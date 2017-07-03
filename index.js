'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const WPAPI = require( 'wpapi' );

const restService = express();

restService.use(bodyParser.urlencoded({
    extended: true
}));

restService.use(bodyParser.json());

restService.post('/info', function (req, res) {

    var action = req.body.result && req.body.result.action ? req.body.result.action : null;
    var previousAction = req.body.result && req.body.result.parameters && req.body.result.parameters.myAction ? req.body.result.parameters.myAction : null;

    if (action == 'PreviousContext') {
        action = previousAction;
    }

    switch (action) {

        case 'employee.phone' :
            var employee = req.body.result && req.body.result.parameters && req.body.result.parameters.employee ? req.body.result.parameters.employee : null;

            if (employee) {
                var info = getInfoForUsername(employee);
                var speech = 'Ich konnte die Durchwahl von ' + employee + ' nicht finden';;

                if (info.phone) {
                    speech = 'Die Durchwahl von ' + employee + ' ist ' + info.phone;
                }

                return generateResponse(res, speech);
            }

            return generateResponse(res, 'Kein Name angegeben.');

        case 'employee.email' :
            var employee = req.body.result && req.body.result.parameters && req.body.result.parameters.employee ? req.body.result.parameters.employee : null;

            if (employee) {
                var info = getInfoForUsername(employee);

                var speech = 'Ich konnte die E-Mail-Adresse von ' + employee + ' nicht finden';;

                if (info.email) {
                    speech = 'Die E-Mail-Adresse von ' + employee + ' ist ' + email;
                }

                return generateResponse(res, speech);

            }

            return generateResponse(res, 'Kein Name angegeben.');

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

    var info = {
        email : 'geheim',
        phone : 'geheim'
    };

    switch (username) {

        case 'Zentrale' :
            info.email = 'info@euw.de';
            info.phone = '10';
            break;

        case 'Herr Eberle' :
        case 'Herr Wollweber' :
            break;

        case 'Frau Eberle' :
            info.email = 'anja.eberle@euw.de';
            info.phone = '13';
            break;

        case 'Frau Maier' :
            info.email = 'maier@euw.de';
            info.phone = '19';
            break;

        case 'Frau Brandt' :
            info.email = 'brandt@euw.de';
            info.phone = 22;
            break;

        case 'Frau Fuhr' :
            info.email = 'fuhr@euw.de';
            info.phone = 24;
            break;

        case 'Herr Martensen' :
            info.email = 'martensen@euw.de';
            info.phone = 25;
            break;

        case 'Frau Neidhöfer' :
            info.email = 'neidhoefer@euw.de';
            info.phone = 28;
            break;

        case 'Herr Wambach' :
            info.email = 'wambach@euw.de';
            info.phone = 30;
            break;

        case 'Frau Fais' :
            info.email = 'fais@euw.de';
            info.phone = 33;
            break;

        case 'Herr Roth' :
            info.email = 'roth@euw.de';
            info.phone = 34;
            break;

        default:
            return {};
    }

    return info;
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
