'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const WPAPI = require( 'wpapi' );
const users = require( './users.json' );
var moment = require( 'moment' );
moment.locale('de');

const restService = express();

restService.use(bodyParser.urlencoded({
    extended: true
}));

restService.use(bodyParser.json());

restService.post('/info', function (req, res) {

    var action = req.body.result && req.body.result.action ? req.body.result.action : null;
    var previousAction = req.body.result && req.body.result.parameters && req.body.result.parameters.myAction ? req.body.result.parameters.myAction : null;
    var speech = '';
    var username = undefined;
    var user = undefined;

    if (action == 'PreviousContext') {
        action = previousAction;
    }

    switch (action) {

        case 'employee.phone' :
            username = req.body.result && req.body.result.parameters && req.body.result.parameters.username ? req.body.result.parameters.username : null;
            user = getInfoForUsername(username);

            if (user) {
                if (user.phone) {
                    speech = 'Die Durchwahl von ' + user.first_name + ' ' + user.last_name + ' ist ' + user.phone;
                } else {
                    speech = 'Ich konnte die Durchwahl von ' + user.first_name + ' ' + user.last_name + ' nicht finden.';
                    speech += ' Aber vielleicht möchtest du ja etwas anderes erfahren';
                }

                return generateResponse(res, speech);
            }

            break;

        case 'employee.email' :
            username = req.body.result && req.body.result.parameters && req.body.result.parameters.username ? req.body.result.parameters.username : null;
            user = getInfoForUsername(username);

            if (user) {
                if (user.email) {
                    speech = 'Die E-Mail-Adresse von ' + user.first_name + ' ' + user.last_name + ' ist ' + user.email;
                } else {
                    speech = 'Ich konnte die E-Mail-Adresse von ' + user.first_name + ' ' + user.last_name + ' nicht finden.';
                    speech += ' Aber vielleicht möchtest du ja etwas anderes erfahren';
                }

                return generateResponse(res, speech);
            }

            break;

        case 'employee.activity' :
            username = req.body.result && req.body.result.parameters && req.body.result.parameters.username ? req.body.result.parameters.username : null;
            user = getInfoForUsername(username);

            if (user) {
                if (user.email) {
                    speech = user.first_name + ' ' + user.last_name + ' ist zuständig für ' + user.activity;
                } else {
                    speech = 'Das weiß ich leider nicht.';
                }

                return generateResponse(res, speech);
            }

            break;

        case 'blog.latest' :

            var blog = req.body.result && req.body.result.parameters && req.body.result.parameters.blog ? req.body.result.parameters.blog : 'schlaadt';

            var wp = new WPAPI({ endpoint: 'https://www.' + blog + '.de/wp-json' });

            wp.posts().then(function( data ) {
                // do something with the returned posts
                // console.log(data[0]);

                var date = moment(data[0].date);

                return generateResponse(res, 'Der letzte Beitrag vom ' + date.format("LL") + ' ist: ' + data[0].title.rendered);
            }).catch(function( err ) {
                // handle error
                // console.log(err);
                return generateResponse(res, 'Ich konnte keine Beiträge finden');
            });

            break;

        default:
            break;
    }

});

function getInfoForUsername(username) {

    for (var i = 0, len = users.length; i < len; i++) {
        if (users[i].handle == username) {
            return users[i];
        }
    }

}

function generateResponse(res, speech) {
    return res.json({
        speech: speech,
        displayText: speech,
        source: 'webhook-echo-sample'
    });
}

restService.post('/slack-test', function (req, res) {

    var slack_message = {
        "text": "Details of JIRA board for Browse and Commerce",
        "attachments": [{
            "title": "JIRA Board",
            "title_link": "http://www.google.com",
            "color": "#36a64f",

            "fields": [{
                "title": "Epic Count",
                "value": "50",
                "short": "false"
            }, {
                "title": "Story Count",
                "value": "40",
                "short": "false"
            }],

            "thumb_url": "https://stiltsoft.com/blog/wp-content/uploads/2016/01/5.jira_.png"
        }, {
            "title": "Story status count",
            "title_link": "http://www.google.com",
            "color": "#f49e42",

            "fields": [{
                "title": "Not started",
                "value": "50",
                "short": "false"
            }, {
                "title": "Development",
                "value": "40",
                "short": "false"
            }, {
                "title": "Development",
                "value": "40",
                "short": "false"
            }, {
                "title": "Development",
                "value": "40",
                "short": "false"
            }]
        }]
    }
    return res.json({
        speech: "speech",
        displayText: "speech",
        source: 'webhook-echo-sample',
        data: {
            "slack": slack_message
        }
    });
});

restService.listen((process.env.PORT || 8000), function () {
    console.log("Server up and listening");
});
