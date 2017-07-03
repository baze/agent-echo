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
                var phoneNumber = getPhoneNumberForUsername(employee);
                var speech = 'Ich konnte die Durchwahl von ' + employee + ' nicht finden';;

                if (phoneNumber) {
                    speech = 'Die Durchwahl von ' + employee + ' lautet ' + phoneNumber;
                }

                return generateResponse(res, speech);

            }

            return generateResponse(res, 'Kein Name angegeben.');

        case 'employee.email' :
            var employee = req.body.result && req.body.result.parameters && req.body.result.parameters.employee ? req.body.result.parameters.employee : null;

            if (employee) {
                var emailAddress = getEmailAddressForUsername(employee);
                var speech = 'Ich konnte die E-Mail-Adresse von ' + employee + ' nicht finden';;

                if (emailAddress) {
                    speech = 'Die E-Mail-Adresse von ' + employee + ' lautet ' + emailAddress;
                }

                return generateResponse(res, speech);

            }

            return generateResponse(res, 'Kein Name angegeben.');

        case 'getBlogPosts' :

            var blog = req.body.result && req.body.result.parameters && req.body.result.parameters.blog ? req.body.result.parameters.blog : 'schlaadt';
            console.log(blog);

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

switch (employee) {

    case 'Zentrale' : return 10;

    case 'Herr Eberle' :
    case 'Herr Wollweber' :
        break;

    case 'Frau Eberle' : return 13;
    case 'Frau Maier' : return 19;
    case 'Frau Brandt' : return 22;
    case 'Frau Fuhr' : return 24;
    case 'Herr Martensen' : return 25;
    case 'Frau Neidhöfer' : return 25;
    case 'Herr Wambach' : return 30;
    case 'Frau Fais' : return 33;
    case 'Herr Roth' : return 34;

    default:
        break;
}

function getPhoneNumberForUsername(employee) {
}

function getEmailAddressForUsername(employee) {

    switch (employee) {

        case 'dieb' :
        case 'mawo' :
            break;

        case 'joma' :
            return 'joma@euw.de';

        case 'bjma' :
            return 'bjma@euw.de';

        case 'jawa' :
            return 'jawa@euw.de';

        default:
            break;
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
