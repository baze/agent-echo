'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const restService = express();

const WPAPI = require('wpapi');
const moment = require('moment');
moment.locale('de');

const apiai = require('apiai');
const AlexaSkills = require('alexa-skills');
const app = apiai("cb3111d6b5cb4b22a6a47d96f8e0bb0a");
const alexa = new AlexaSkills({
    express: restService, // required
    route: "/alexa", // optional, defaults to "/"
    applicationId: "amzn1.ask.skill.17e64ff1-708e-432e-add3-f925579d1938" // optional, but recommended. If you do not set this leave it blank
});

var striptags = require('striptags');

restService.use(bodyParser.json());

var helga = require('./helga');

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
            username = req.body.result.parameters.employee;
            user = helga.getInfoForUsername(username);

            speech = helga.speech.user.phone(user);

            return generateResponse(res, speech);

            break;

        case 'employee.email' :
            username = req.body.result.parameters.employee;
            user = helga.getInfoForUsername(username);

            speech = helga.speech.user.email(user);

            return generateResponse(res, speech);

            break;

        case 'employee.services' :
            username = req.body.result.parameters.employee;
            user = helga.getInfoForUsername(username);

            speech = helga.speech.user.services(user);

            return generateResponse(res, speech);

            break;

        case 'employee.clients' :
            username = req.body.result && req.body.result.parameters && req.body.result.parameters.employee ? req.body.result.parameters.employee : null;
            user = helga.getInfoForUsername(username);

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
            var client = req.body.result.parameters.client;

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

            var blog = req.body.result.parameters.blog;

            if (blog) {
                var wp = new WPAPI({endpoint: 'https://www.' + blog + '.de/wp-json'});

                wp.posts().perPage(1).then(function (data) {
                    // do something with the returned posts
                    console.log(data);

                    var date = moment(data[0].date);
                    var phrase = 'Der letzte Beitrag vom ' + date.format("LL") + ' ist: ' + data[0].title.rendered + '.';
                    phrase += ' Möchtest du, dass ich ihn dir vorlese?';

                    var contextOut = [{"name": "blog", "lifespan": 1, "parameters": {"post_id": data[0].id}}];

                    return generateResponse(res, phrase, contextOut);
                }).catch(function (err) {
                    // handle error
                    console.log(err);
                    return generateResponse(res, 'Ich konnte keine Beiträge finden');
                });
            } else {
                return generateResponse(res, 'Ich konnte den Blog ' + blog + ' leider nicht finden');
            }

            break;

        case 'blog.read' :

            console.log("blog read");

            var confirmation = req.body.result && req.body.result.parameters && req.body.result.parameters.confirmation ? req.body.result.parameters.confirmation : null;
            var blog = req.body.result && req.body.result.parameters && req.body.result.parameters.blog ? req.body.result.parameters.blog : null;
            var post_id = req.body.result && req.body.result.parameters && req.body.result.parameters.post_id ? parseInt(req.body.result.parameters.post_id) : null;

            if (confirmation && blog && post_id) {
                var wp = new WPAPI({endpoint: 'https://www.' + blog + '.de/wp-json'});

                wp.posts(post_id).then(function (data) {
                    // do something with the returned posts
                    var html = data[0].content.rendered;
                    // var html = '<strong>BAMM BAMM BALLERMANN!</strong>'
                    html = striptags(html);
                    var phrase = html.replace(/(\r\n|\n|\r)/gm, "");


                    console.log(phrase);

                    // var phrase = "bummsfallerra";

                    return generateResponse(res, phrase);
                }).catch(function (err) {
                    // handle error
                    console.log(err);
                    return generateResponse(res, 'Ich konnte den Beitrag nicht finden');
                });
            } else {
                console.log(confirmation);
                console.log(blog);
                console.log(post_id);

                var phrase = "Das geht leider nich nicht. Ich benötige erst noch weitere Informationen zu ";

                if (! confirmation) {
                    phrase += "phrase, Wert: " + phrase;
                }

                if (!blog) {
                    phrase += "blog, Wert: " + blog;
                }

                if (!post_id) {
                    phrase += "post_id, Wert: " + post_id;
                }

                return generateResponse(res, phrase);
            }

            break;

        case 'employee.contact.email':

            username = req.body.result && req.body.result.parameters && req.body.result.parameters.employee ? req.body.result.parameters.employee : null;
            var subject = req.body.result.parameters.subject;
            var text = req.body.result.parameters.text;

            user = helga.getInfoForUsername(username);

            if (user && user.email && subject && text) {
                var send = require('gmail-send')({
                    user: 'foo@gmail.com',               // Your GMail account used to send emails
                    pass: 'bar',             // Application-specific password
                    to: user.email,               // Send back to yourself;
                    // you also may set array of recipients:
                    // [ 'user1@gmail.com', 'user2@gmail.com' ]
                    from: '"E&W Helga" <helga@euw.de>',  // from: by default equals to user
                    // replyTo:'user@gmail.com'           // replyTo: by default undefined
                    subject: subject,
                    text: text
                    // html:    '<b>html text text</b>'
                });

                send({
                    // subject: 'override',   // Override value set as default
                    // files: [file]                // String or array of strings of filenames to attach
                }, function (err, res) {

                    if (!err) {
                        speech = 'Die E-Mail wurde versandt!';
                    } else {
                        speech = 'Es ist ein Fehler aufgetreten: ' + err;
                    }

                    console.log('* [example1] send(): err:', err, '; res:', res);
                });

            }

            return generateResponse(res, speech);

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

restService.use(bodyParser.urlencoded({
    extended: true
}));

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

function generateResponse(res, speech, contextOut) {
    var response = {
        speech: speech,
        displayText: speech,
        source: 'helga'
    };

    if (contextOut) {
        response.contextOut = contextOut;
    }

    return res.json(response);
}

function alexaWelcome(req, res, slots) {

    console.log("DefaultWelcomeIntent");

    var request = app.textRequest('Hallo', {
        sessionId: '<unique session id>'
    });

    request.on('response', function (response) {

        // var phrase = response.result.fulfillment.speech;
        var phrase = 'Bitte werfen Sie eine Münze ein!';
        var options = {
            shouldEndSession: false,
            outputSpeech: phrase
        };

        alexa.send(req, res, options);
    });

    request.on('error', function (error) {
        console.log(error);
    });

    request.end();
}

function alexaYes(req, res, slots) {

    var phrase = "Ja";

    var request = app.textRequest(phrase, {
        sessionId: '<unique session id>'
    });

    request.on('response', function (response) {

        var phrase = response.result.fulfillment.speech;
        var options = {
            shouldEndSession: true,
            outputSpeech: phrase
        };

        alexa.send(req, res, options);

    });

    request.on('error', function (error) {
        // console.log(error);
    });

    request.end();
}

alexa.launch(alexaWelcome);

alexa.intent('DefaultWelcomeIntent', alexaWelcome);

alexa.intent('Thankyou', function (req, res, slots) {
    var request = app.textRequest('Danke', {
        sessionId: '<unique session id>'
    });

    request.on('response', function (response) {

        var phrase = response.result.fulfillment.speech;
        var options = {
            shouldEndSession: true,
            outputSpeech: phrase
        };

        alexa.send(req, res, options);
    });

    request.on('error', function (error) {
        console.log(error);
    });

    request.end();
});

alexa.intent('SmalltalkNane', function (req, res, slots) {

    console.log(req);
    console.log(res);

    var phrase = 'Wer ist zauberhaft und elfengleich?';

    var request = app.textRequest(phrase, {
        sessionId: '<unique session id>'
    });

    request.on('response', function (response) {

        var phrase = response.result.fulfillment.speech;
        var options = {
            shouldEndSession: true,
            outputSpeech: phrase
        };

        alexa.send(req, res, options);
    });

    request.on('error', function (error) {
        console.log(error);
    });

    request.end();
});

alexa.intent('SmalltalkInsult', function (req, res, slots) {

    var phrase = 'Ficke disch';

    var request = app.textRequest(phrase, {
        sessionId: '<unique session id>'
    });

    request.on('response', function (response) {

        var phrase = response.result.fulfillment.speech;
        var options = {
            shouldEndSession: true,
            outputSpeech: phrase
        };

        alexa.send(req, res, options);
    });

    request.on('error', function (error) {
        console.log(error);
    });

    request.end();
});

alexa.intent('Employee', function (req, res, slots, sessionAttributes) {

    console.log(slots);

    var textQuery = 'Wer ist ' + slots.employeeslot.value + '?';

    var request = app.textRequest(textQuery, {
        sessionId: '<unique session id>'
    });

    request.on('response', function (response) {
        var phrase = response.result.fulfillment.speech;
        var options = {
            shouldEndSession: false,
            outputSpeech: phrase,
            contexts: [
                {
                    name: 'userinfo',
                    parameters: {
                        'employee': slots.employeeslot.value
                    }
                }
            ]
        };

        sessionAttributes.employee = slots.employeeslot.value;

        alexa.send(req, res, options, sessionAttributes);
    });

    request.on('error', function (error) {
        console.log(error);
    });

    request.end();
});

alexa.intent('EmployeeContextUserinfoCommentPhone', function (req, res, slots, sessionAttributes) {

    console.log(req);
    console.log(slots);
    console.log(sessionAttributes);

    var phrase = "";
    var textQuery = 'Wer ist die Durchwahl von ' + sessionAttributes.employee + '?';

    var request = app.textRequest(textQuery, {
        sessionId: '<unique session id>'
    });

    request.on('response', function (response) {
        console.log(response);

        phrase = response.result.fulfillment.speech;
        var options = {
            shouldEndSession: false,
            outputSpeech: phrase
        };

        alexa.send(req, res, options, sessionAttributes);
    });

    request.on('error', function (error) {
        console.log(error);
    });

    request.end();

});

alexa.intent('EmployeeContextUserinfoCommentEmail', function (req, res, slots, sessionAttributes) {

    console.log(req);
    console.log(slots);
    console.log(sessionAttributes);

    var phrase = "";
    var textQuery = 'Wer ist die E-Mail-Adresse von ' + sessionAttributes.employee + '?';

    var request = app.textRequest(textQuery, {
        sessionId: '<unique session id>'
    });

    request.on('response', function (response) {
        console.log(response);

        phrase = response.result.fulfillment.speech;
        var options = {
            shouldEndSession: false,
            outputSpeech: phrase
        };

        alexa.send(req, res, options, sessionAttributes);
    });

    request.on('error', function (error) {
        console.log(error);
    });

    request.end();

});

alexa.intent('BlogLatest', function (req, res, slots, sessionAttributes) {

    sessionAttributes.blog = 'euw';

    var phrase = "";
    if (sessionAttributes.blog) {
        phrase = 'Was gibt es neues bei ' + sessionAttributes.blog + '?';
    } else {
        phrase = 'Was gibt es neues bei ' + slots.blogslot.value + '?';
    }

    // sessionAttributes.blog = slots.blogslot.value;

    var request = app.textRequest(phrase, {
        sessionId: '<unique session id>',
        contexts: [
            {
                name: 'blog',
                parameters: {
                    'blog': sessionAttributes.blog
                }
            }
        ]
    });

    request.on('response', function (response) {

        // console.log(response);

        var phrase = response.result.fulfillment.speech;
        var options = {
            shouldEndSession: false,
            outputSpeech: phrase
        };

        alexa.send(req, res, options, sessionAttributes);

    });

    request.on('error', function (error) {
        // console.log(error);
    });

    request.end();
});

alexa.intent('BlogReadAnswerYes', alexaYes);

alexa.ended(function (req, res, reason) {
    console.log(reason);
});

restService.listen((process.env.PORT || 8000), function () {
    console.log("Server up and listening");
});