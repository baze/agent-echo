'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const WPAPI = require( 'wpapi' );

const restService = express();

restService.use(bodyParser.urlencoded({
    extended: true
}));

// test

restService.use(bodyParser.json());

restService.post('/info', function (req, res) {

    var intentName = req.body.result && req.body.result.metadata && req.body.result.metadata.intentName ? req.body.result.metadata.intentName : null;

    if (intentName) {
        switch (intentName) {

            case 'phonenumber' :
                var username = req.body.result && req.body.result.parameters && req.body.result.parameters.username ? req.body.result.parameters.username : null;

                if (username) {
                    var phonenumber = getPhoneNumberForUsername(username);
                    var speech = 'Ich konnte die Durchwahl von ' + username + ' nicht finden';;

                    if (phonenumber) {
                        speech = 'Die Durchwahl von ' + username + ' lautet ' + phonenumber;
                    }

                    return generateResponse(res, speech);

                }

                return generateResponse(res, 'Kein Name angegeben.');

            case 'blog' :

                var blogName = req.body.result && req.body.result.parameters && req.body.result.parameters.blogName ? req.body.result.parameters.blogName : 'schlaadt';
                console.log(blogName);

                var wp = new WPAPI({ endpoint: 'https://www.' + blogName + '.de/wp-json' });

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
    } else {
        return generateResponse(res, 'No Intent Provided');
    }

    // return generateResponse(res, 'Something went wrong.');


});

function getPhoneNumberForUsername(username) {

    switch (username) {

        case 'dieb' :
        case 'mawo' :
            break;

        case 'joma' :
            return 19;

        case 'bjma' :
            return 25;

        case 'jawa' :
            return 30;

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
