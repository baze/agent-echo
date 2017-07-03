'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const WPAPI = require( 'wpapi' );
const users = require( './users.json' );

const restService = express();

restService.use(bodyParser.urlencoded({
    extended: true
}));

restService.use(bodyParser.json());

restService.post('/info', function (req, res) {

    var action = req.body.result && req.body.result.action ? req.body.result.action : null;
    var previousAction = req.body.result && req.body.result.parameters && req.body.result.parameters.myAction ? req.body.result.parameters.myAction : null;
    var speech = '';
    var info = {};
    var employee = undefined;

    if (action == 'PreviousContext') {
        action = previousAction;
    }

    switch (action) {

        case 'employee.phone' :
            employee = req.body.result && req.body.result.parameters && req.body.result.parameters.employee ? req.body.result.parameters.employee : null;

            if (employee) {
                info = getInfoForUsername(employee);

                if (info.phone) {
                    speech = 'Die Durchwahl von ' + employee + ' ist ' + info.phone;
                } else {
                    speech = 'Ich konnte die Durchwahl von ' + employee + ' nicht finden.';
                    speech += ' Aber vielleicht möchtest du ja etwas anderes erfahren';
                }

                return generateResponse(res, speech);
            }

            break;

        case 'employee.email' :
            employee = req.body.result && req.body.result.parameters && req.body.result.parameters.employee ? req.body.result.parameters.employee : null;

            // info = getInfoForUsername(employee);

            console.log(users);

            return generateResponse(res, 'wip');

            /*if (employee) {
                info = getInfoForUsername(employee);

                if (info.email) {
                    speech = 'Die E-Mail-Adresse von ' + employee + ' ist ' + info.email;
                } else {
                    speech = 'Ich konnte die E-Mail-Adresse von ' + employee + ' nicht finden.';
                    speech += ' Aber vielleicht möchtest du ja etwas anderes erfahren';
                }

                return generateResponse(res, speech);
            }*/

            break;

        case 'employee.activity' :
            employee = req.body.result && req.body.result.parameters && req.body.result.parameters.employee ? req.body.result.parameters.employee : null;

            if (employee) {
                info = getInfoForUsername(employee);

                if (info.activity) {
                    speech = employee + ' ist zuständig für ' + info.activity;
                } else {
                    speech = 'Das weiß ich leider nicht.';
                }

                return generateResponse(res, speech);
            }

            break;

        case 'getBlogPosts' :

            var blog = req.body.result && req.body.result.parameters && req.body.result.parameters.blog ? req.body.result.parameters.blog : 'schlaadt';

            var wp = new WPAPI({ endpoint: 'https://www.' + blog + '.de/wp-json' });

            wp.posts().then(function( data ) {
                // do something with the returned posts
                console.log(data[0]);

                // 2015-07-09T16:13:46

                return generateResponse(res, 'Der letzte Beitrag war: ' + data[0].title.rendered);
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
    for (var user in users) {
        console.log(user);
        /*if (user.get('handle') == username) {
            return user;
        }*/
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
