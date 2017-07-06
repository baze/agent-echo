'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const WPAPI = require('wpapi');
var moment = require('moment');
moment.locale('de');
var apiai = require('apiai');
var app = apiai("cb3111d6b5cb4b22a6a47d96f8e0bb0a");

const restService = express();

var AlexaSkills = require('alexa-skills'),
    alexa = new AlexaSkills({
        express: restService, // required
        route: "/alexa", // optional, defaults to "/"
        applicationId: "amzn1.ask.skill.17e64ff1-708e-432e-add3-f925579d1938" // optional, but recommended. If you do not set this leave it blank
    });

restService.use(bodyParser.urlencoded({
    extended: true
}));

restService.use(bodyParser.json());

restService.post('/helga', function (req, res) {

    var action = req.body.result && req.body.result.action ? req.body.result.action : null;
    var previousAction = req.body.result && req.body.result.parameters && req.body.result.parameters.myAction ? req.body.result.parameters.myAction : null;
    var speech = '';
    var username = undefined;
    var user = undefined;

    if (action == 'PreviousContext') {
        action = previousAction;
    }

    console.log(action);

    switch (action) {

        case 'employee.phone' :
            username = req.body.result && req.body.result.parameters && req.body.result.parameters.employee ? req.body.result.parameters.employee : null;
            user = getInfoForUsername(username);

            console.log(user);

            if (user && user.phone) {
                speech = 'Die Durchwahl von ' + user.first_name + ' ' + user.last_name + ' ist die ' + user.phone;
            } else {
                speech = 'Diese Information zu ' + user.first_name + ' ' + user.last_name +
                    ' habe ich leider nicht vorliegen. ' +
                    'Aber vielleicht kann ich dir mit Informationen zu ' +
                    'E-Mail-Adresse, Leistungen oder betreuten Kunden ' +
                    'weiterhelfen?';
            }

            return generateResponse(res, speech);

            break;

        case 'employee.email' :
            username = req.body.result && req.body.result.parameters && req.body.result.parameters.employee ? req.body.result.parameters.employee : null;
            user = getInfoForUsername(username);

            if (user && user.email) {
                speech = 'Die E-Mail-Adresse von ' + user.first_name + ' ' + user.last_name + ' lautet ' + user.email;
            } else {
                speech = 'Diese Information zu ' + user.first_name + ' ' + user.last_name +
                    ' habe ich leider nicht vorliegen. ' +
                    'Aber vielleicht kann ich dir mit Informationen zu ' +
                    'Durchwahl, Leistungen oder betreuten Kunden ' +
                    'weiterhelfen?';
            }

            return generateResponse(res, speech);

            break;

        case 'employee.services' :
            username = req.body.result && req.body.result.parameters && req.body.result.parameters.employee ? req.body.result.parameters.employee : null;
            user = getInfoForUsername(username);

            if (user && user.services.length > 0) {
                var services = user.services.length > 1
                    ? user.services.slice(0, -1).join(', ') + ' und ' + user.services.slice(-1)
                    : user.services;

                speech = user.first_name + ' ' + user.last_name + ' ist zuständig für ' + services;
            } else {
                speech = 'Diese Information zu ' + user.first_name + ' ' + user.last_name +
                    ' habe ich leider nicht vorliegen. ' +
                    'Aber vielleicht kann ich dir mit Informationen zu ' +
                    'Durchwahl, E-Mail-Adresse oder betreuten Kunden ' +
                    'weiterhelfen?';
            }

            return generateResponse(res, speech);

            break;

        case 'employee.clients' :
            username = req.body.result && req.body.result.parameters && req.body.result.parameters.employee ? req.body.result.parameters.employee : null;
            user = getInfoForUsername(username);

            console.log(user);

            if (user && user.clients.length > 0) {
                var clients = user.clients.length > 1
                    ? user.clients.slice(0, -1).join(', ') + ' und ' + user.clients.slice(-1)
                    : user.clients;

                speech = user.first_name + ' ' + user.last_name + ' ist zuständig für ' + clients;
            } else {
                speech = 'Diese Information zu ' + user.first_name + ' ' + user.last_name +
                    ' habe ich leider nicht vorliegen. ' +
                    'Aber vielleicht kann ich dir mit Informationen zu ' +
                    'Durchwahl, E-Mail-Adresse oder Leistungen ' +
                    'weiterhelfen?';
            }

            return generateResponse(res, speech);

            break;

        case 'clients.all' :
            break;

        case 'clients.employee' :
            var client = req.body.result && req.body.result.parameters && req.body.result.parameters.client ? req.body.result.parameters.client : null;

            console.log(client);

            var users = getUsersForClient(client);

            console.log(users);

            if (users) {

                if (users.length > 1) {
                    speech = users.slice(0, -1).join(', ') + ' und ' + users.slice(-1) + ' sind ';
                } else {
                    speech = users[0].first_name + ' ' + users[0].last_name + ' ist ';
                }

                speech = speech + 'zuständig für ' + client;
                return generateResponse(res, speech);
            }

            break;

        case 'blog.latest' :

            var blog = req.body.result && req.body.result.parameters && req.body.result.parameters.blog ? req.body.result.parameters.blog : 'null';

            console.log(blog);

            if (blog) {
                var wp = new WPAPI({endpoint: 'https://www.' + blog + '.de/wp-json'});

                wp.posts().then(function (data) {
                    // do something with the returned posts
                    console.log(data);

                    var date = moment(data[0].date);

                    return generateResponse(res, 'Der letzte Beitrag vom ' + date.format("LL") + ' ist: ' + data[0].title.rendered);
                }).catch(function (err) {
                    // handle error
                    console.log(err);
                    return generateResponse(res, 'Ich konnte keine Beiträge finden');
                });
            } else {
                return generateResponse(res, 'Ich konnte den Blog ' + blog + ' leider nicht finden');
            }

            break;

        default:
            break;
    }

});

restService.get('/ews', function (req, res) {

    var EWS = require('node-ews');

    // exchange server connection info
    var ewsConfig = {
        username: 'myuser@domain.com',
        password: 'mypassword',
        host: 'https://ews.domain.com'
    };

    var options = {
        rejectUnauthorized: false,
        strictSSL: false
    };
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    // initialize node-ews
    var ews = new EWS(ewsConfig, options);

    // define ews api function
    var ewsFunction = 'CreateItem';

    // define ews api function args
    var ewsArgs = {
        "attributes": {
            "MessageDisposition": "SendAndSaveCopy"
        },
        "SavedItemFolderId": {
            "DistinguishedFolderId": {
                "attributes": {
                    "Id": "sentitems"
                }
            }
        },
        "Items": {
            "Message": {
                "ItemClass": "IPM.Note",
                "Subject": "Test EWS Email",
                "Body": {
                    "attributes": {
                        "BodyType": "Text"
                    },
                    "$value": "This is a test email"
                },
                "ToRecipients": {
                    "Mailbox": {
                        "EmailAddress": "foo@gmail.com"
                    }
                },
                "IsRead": "false"
            }
        }
    };

    // query ews, print resulting JSON to console
    ews.run(ewsFunction, ewsArgs)
        .then(result => {
            console.log(JSON.stringify(result));
        })
        .catch(err => {
            console.log(err.stack);
        });

    return res.json({});

});

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

alexa.launch(function (req, res) {

    var phrase = "Hallo, ich bin Helga!";
    var options = {
        shouldEndSession: true,
        outputSpeech: phrase
    };

    alexa.send(req, res, options);
});

alexa.intent('SayHello', function (req, res, slots) {

    console.log(slots);

    var phrase = 'Hello World';
    var options = {
        shouldEndSession: true,
        outputSpeech: phrase,
        card: alexa.buildCard("Card Title", phrase)
    };

    alexa.send(req, res, options);
});

alexa.intent('SmalltalkNane', function (req, res, slots) {

    console.log(slots);

    var phrase = 'Natascha';
    var options = {
        shouldEndSession: true,
        outputSpeech: phrase,
        card: alexa.buildCard("Card Title", phrase)
    };

    alexa.send(req, res, options);
});

alexa.intent('Employee', function (req, res, slots, sessionAttributes) {

    console.log(slots);
    console.log(sessionAttributes);

    var phrase = "";
    var textQuery = 'Wer ist ' + slots.employeeslot.value + '?';

    var request = app.textRequest(textQuery, {
        sessionId: '<unique session id>'
    });

    request.on('response', function (response) {
        console.log('response');
        console.log(response);

       phrase = response.result.fulfillment.speech;
        var options = {
            shouldEndSession: false,
            outputSpeech: phrase,
            card: alexa.buildCard("Card Title", phrase)
        };

        alexa.send(req, res, options, sessionAttributes);
    });

    request.on('error', function (error) {
        console.log('error');
        console.log(error);

        phrase = 'Error Poperror!';
        var options = {
            shouldEndSession: true,
            outputSpeech: phrase,
            card: alexa.buildCard("Card Title", phrase)
        };

        alexa.send(req, res, options);
    });


    request.end();

});

alexa.ended(function (req, res, reason) {
    console.log(reason);
});

function getInfoForUsername(username) {
    const _users = require('./users.json');

    for (var i = 0, len = _users.length; i < len; i++) {

        var user = _users[i];

        if (user.username == username) {
            console.log(user);
            return user;
        }
    }
}

function getUsersForClient(client) {
    const _users = require('./users.json');
    var users = [];

    for (var i = 0, len = _users.length; i < len; i++) {

        var user = _users[i];

        if (user.clients) {
            var clients = user.clients;

            for (var j = 0, len2 = clients.length; j < len2; j++) {
                if (clients[j] == client) {
                    users.push(user);
                }
            }
        }
    }

    return users;
}

function generateResponse(res, speech) {
    return res.json({
        speech: speech,
        displayText: speech,
        source: 'webhook-echo-sample'
    });
}

restService.listen((process.env.PORT || 8000), function () {
    console.log("Server up and listening");
});