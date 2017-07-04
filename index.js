'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const WPAPI = require('wpapi');
var moment = require('moment');
moment.locale('de');

const restService = express();

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

    switch (action) {

        case 'employee.phone' :
            username = req.body.result && req.body.result.parameters && req.body.result.parameters.employee ? req.body.result.parameters.employee : null;
            user = getInfoForUsername(username);

            if (user && user.phone) {
                speech = 'Die Durchwahl von ' + user.first_name + ' ' + user.last_name + ' ist die ' + user.phone;
                return generateResponse(res, speech);
            }

            break;

        case 'employee.email' :
            username = req.body.result && req.body.result.parameters && req.body.result.parameters.employee ? req.body.result.parameters.employee : null;
            user = getInfoForUsername(username);

            if (user && user.email) {
                speech = 'Die E-Mail-Adresse von ' + user.first_name + ' ' + user.last_name + ' lautet ' + user.email;
                return generateResponse(res, speech);
            }

            break;

        case 'employee.services' :
            username = req.body.result && req.body.result.parameters && req.body.result.parameters.employee ? req.body.result.parameters.employee : null;
            user = getInfoForUsername(username);

            if (user && user.services.length > 0) {
                var services = user.services.length > 1
                    ? user.services.slice(0, -1).join(', ') + ' und ' + user.services.slice(-1)
                    : user.services;

                speech = user.first_name + ' ' + user.last_name + ' ist zuständig für ' + services;
                return generateResponse(res, speech);
            }

            break;

        case 'employee.clients' :
            username = req.body.result && req.body.result.parameters && req.body.result.parameters.employee ? req.body.result.parameters.employee : null;
            user = getInfoForUsername(username);

            if (user && user.clients.length > 0) {
                var clients = user.clients.length > 1
                    ? user.clients.slice(0, -1).join(', ') + ' und ' + user.clients.slice(-1)
                    : user.clients;

                speech = user.first_name + ' ' + user.last_name + ' ist zuständig für ' + clients;
                return generateResponse(res, speech);
            }

            break;

        case 'clients.all' : break;

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

            var blog = req.body.result && req.body.result.parameters && req.body.result.parameters.blog ? req.body.result.parameters.blog : 'schlaadt';

            var wp = new WPAPI({endpoint: 'https://www.' + blog + '.de/wp-json'});

            wp.posts().then(function (data) {
                // do something with the returned posts
                // console.log(data[0]);

                var date = moment(data[0].date);

                return generateResponse(res, 'Der letzte Beitrag vom ' + date.format("LL") + ' ist: ' + data[0].title.rendered);
            }).catch(function (err) {
                // handle error
                // console.log(err);
                return generateResponse(res, 'Ich konnte keine Beiträge finden');
            });

            break;

        default:
            break;
    }

});

restService.post('/alexa', function (req, res) {

    console.log("hello alexa");
    console.log(req);
    console.log(res);

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


var Alexa = require('alexa-sdk');

exports.handler = (event, context, callback) => {

    var alexa = Alexa.handler(event, context, callback);
    console.log(alexa);

    try {

        if (event.session.new) {
            // New Session
            console.log("NEW SESSION")
        }

        switch (event.request.type) {

            case "LaunchRequest":
                console.log("LAUNCH REQUEST")
                context.succeed(
                    generateResponse(
                        buildSpeechletResponse("Hallo.", true),
                        {}
                    )
                )
                break;

            case "IntentRequest":
                console.log("INTENT REQUEST")

                switch (event.request.intent.name) {

                    case "SayHello":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponse("Hallo. Schön, bei euch zu sein!", true),
                                {}
                            )
                        )
                        break;

                    case "GetUpdate":
                        /*var endpoint = "https://www.schlaadt.de/wp-json/wp/v2/posts?per_page=1"
                        var body = ""

                        https.get(endpoint, (response) => {

                            response.on('data', (chunk) => {
                                body += chunk
                            })
                            response.on('end', () => {
                                var data = JSON.parse(body)
                                var post = data[0]
                                var date = new Date(post.date)

                                context.succeed(
                                    generateResponse(
                                        buildSpeechletResponse("Der letzte Blog-Beitrag war: " + post.title.rendered, true),
                                        {}
                                    )
                                )

                            })
                        })*/
                        var endpoint = "https://www.euw.de/apps/alexa/api.twitter.php"
                        var body = ""
                        https.get(endpoint, (response) => {
                            response.on('data', (chunk) => {
                                body += chunk
                            })
                            response.on('end', () => {
                                var data = JSON.parse(body)
                                context.succeed(
                                    generateResponse(
                                        buildSpeechletResponse(`Der letzte Tweet von ${data.user.name} war: ${data.text}`, true),
                                        {}
                                    )
                                )
                            })
                        })

                        break;

                    case "GetKitchenService":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponse("Stephan hat Küchendienst. Immer!", true),
                                {}
                            )
                        )
                        break;

                    case "GetInsult":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponse("Ficke disch doch selber!", true),
                                {}
                            )
                        )
                        break;

                    case "GetFairy":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponse("Natascha ist zauberhaft und elfengleich", true),
                                {}
                            )
                        )
                        break;

                    case "GetLetMe":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponse("Lasse mich!", true),
                                {}
                            )
                        )
                        break;

                    case "GetGarbagePlan":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponse("Gelbe Säcke am Dienstag abend. Mülltonne raus am Mittwoch abend und am Donnerstag vormittag wieder in den Keller.", true),
                                {}
                            )
                        );
                        break;

                    case "GetKitchenServiceDate":
                        var date = event.request.intent.slots.Date.value
                        var endpoint = "https://www.euw.de/apps/alexa/api.kitchen.php"
                        var body = ""
                        https.get(endpoint, (response) => {
                            response.on('data', (chunk) => {
                                body += chunk
                            })
                            response.on('end', () => {
                                var data = JSON.parse(body)
                                context.succeed(
                                    generateResponse(
                                        buildSpeechletResponse(`${data[date]}`, true),
                                        {}
                                    )
                                )
                            })
                        })
                        break;

                    case "GetHailHydra":
                        context.succeed(
                            generateResponse(
                                buildSpeechletResponse('Hail Hydra', true),
                                {}
                            )
                        )
                        break;

                    case "GetFunnyDay":
                        var date = event.request.intent.slots.Date.value
                        //var endpoint = "http://www.webcal.fi/cal.php?id=50&rid=ics&wrn=0&wp=12&wf=55"
                        var endpoint = "https://www.euw.de/apps/alexa/api.calendar.php"
                        var body = ""
                        https.get(endpoint, (response) => {
                            console.log(response)
                            response.on('data', (chunk) => {
                                body += chunk
                            })
                            response.on('end', () => {
                                var data = JSON.parse(body)
                                context.succeed(
                                    generateResponse(
                                        buildSpeechletResponse(`Heute ist ein guter Tag`, true),
                                        {}
                                    )
                                )
                            })
                        })
                        break;

                    default:
                        throw "Invalid intent"
                }

                break;

            case "SessionEndedRequest":
                console.log("SESSION ENDED REQUEST")
                break;

            default:
                context.fail(`INVALID REQUEST TYPE: ${event.request.type}`)
        }

    } catch (error) {
        context.fail(`Exception: ${error}`)
    }
}

buildSpeechletResponse = (outputText, shouldEndSession) => {

    return {
        outputSpeech: {
            type: "PlainText",
            text: outputText
        },
        shouldEndSession: shouldEndSession
    }

}

generateResponse = (speechletResponse, sessionAttributes) => {

    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    }

}