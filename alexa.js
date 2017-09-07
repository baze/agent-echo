'use strict';

var restService = require('./restService');

var AlexaSkills = function (options) {

    var RequestValidator = require('./request-validator'),
        jsonParser = require('body-parser').json(),
        app = options.express,
        route = options.route || "/",
        appId = options.applicationId || "",
        launchCallback = null,
        endedCallback = null,
        intents = {};

    app.post(route, jsonParser, RequestValidator, function (req, res) {

        if (req.body.session.application.applicationId == appId || !appId.length) {

            switch (req.body.request.type) {

                case "LaunchRequest":
                    if (launchCallback)
                        launchCallback(req, res);
                    else
                        throw ("LaunchRequest not handled")
                    break;
                case "IntentRequest":

                    if (!req.body.session.attributes)
                        req.body.session.attributes = {};

                    if (intents[req.body.request.intent.name])
                        intents[req.body.request.intent.name](req, res, req.body.request.intent.slots, req.body.session.attributes);
                    else
                        throw ("IntentRequest for `" + req.body.request.intent.name + "` not handled")
                    break;
                case "SessionEndedRequest":
                    if (endedCallback)
                        endedCallback(req, res, req.body.request.reason);
                    res.json({});
                    break;
            }
        }
    });

    this.launch = function (callback) {
        launchCallback = callback;
    };

    this.intent = function (name, callback) {
        intents[name] = callback;
    };

    this.ended = function (callback) {
        endedCallback = callback;
    };

    this.send = function (req, res, options, sessionAttributes) {

        if (!("shouldEndSession" in options))
            options.shouldEndSession = true;

        var response = {
            version: req.body.version,
            sessionAttributes: (sessionAttributes || req.body.session.attributes),
            response: {
                shouldEndSession: options.shouldEndSession
            }
        }

        if (options.outputSpeech && options.outputSpeech.length) {
            response.response.outputSpeech = {
                type: "PlainText",
                text: options.outputSpeech
            };
        } else if (options.outputSSML && options.outputSSML.length) {
            response.response.outputSpeech = {
                type: "SSML",
                ssml: options.outputSSML
            };
        }

        if (options.reprompt && options.reprompt.length) {
            response.response.reprompt = {
                outputSpeech: {
                    type: "PlainText",
                    text: options.reprompt
                }
            };
        } else if (options.repromptSSML && options.repromptSSML.length) {
            response.response.reprompt = {
                outputSpeech: {
                    type: "SSML",
                    ssml: options.repromptSSML
                }
            };
        }

        if (options.card) {
            response.response.card = options.card;
        }

        res.header("Content-Type", "application/json; charset=utf-8");
        res.json(response);

    };

    this.buildCard = function (title, content) {
        return this.buildSimpleCard(title, content);
    };

    this.buildSimpleCard = function (title, content) {
        var card = {};
        card.type = "Simple";
        card.title = title;
        card.content = content;
        return card;
    }

    this.buildStandardCard = function (title, text, smallImageUrl, largeImageUrl) {
        var card = {};
        card.type = "Standard";
        card.title = title;
        card.text = text;
        card.image = {};
        card.image.smallImageUrl = smallImageUrl;
        card.image.largeImageUrl = largeImageUrl;
        return card;
    }

    this.buildLinkAccountCard = function (text) {
        var card = {};
        card.type = "LinkAccount";
        card.text = text;
        return card;
    }

};

var alexa = new AlexaSkills({
    express: restService, // required
    route: "/alexa", // optional, defaults to "/"
    applicationId: "amzn1.ask.skill.17e64ff1-708e-432e-add3-f925579d1938" // optional, but recommended. If you do not set this leave it blank
});

const apiai = require('apiai');
const app = apiai("cb3111d6b5cb4b22a6a47d96f8e0bb0a");

restService.post('/alexa2', function (req, res) {
    console.log(req);
    console.log(res);

    return res.json({});
});

/*var helpers = {
    launch: function(req, res, slots) {

        console.log("DefaultWelcomeIntent");
        console.log(req);
        console.log(res);
        console.log(slots);

        var request = app.textRequest('Hallo', {
            sessionId: '<unique session id>'
        });

        request.on('response', function (response) {

            var phrase = response.result.fulfillment.speech;

            // var phrase = 'Bitte werfen Sie eine Münze ein!';
            var options = {
                shouldEndSession: false,
                outputSpeech: phrase,
                // reprompt: "Bitte werfen Sie noch eine Münze ein",
                // reprompt: phrase
            };

            alexa.send(req, res, options);
        });

        request.on('error', function (error) {
            console.log(error);
        });

        request.end();
    },

    ended: function (req, res, reason) {
        console.log(reason);
    },

    yes: function (req, res, slots) {

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
};*/

alexa.launch(function (req, res) {

    console.log("start launch");
    // console.log(req);
    console.log(req.body.request);
    // console.log(res);
    console.log("end launch");

    var phrase = "Bitte werfen Sie eine Münze ein";
    var options = {
        shouldEndSession: false,
        outputSpeech: phrase,
        reprompt: "Bitte werfen Sie noch eine eine Münze ein"
    };

    alexa.send(req, res, options);
});

alexa.intent('DefaultWelcomeIntent', function (req, res, slots) {

    console.log(req.body.request);
    console.log(slots);

    var phrase = 'Hallo';
    var options = {
        shouldEndSession: true,
        outputSpeech: phrase,
        card: alexa.buildCard("Card Title", phrase)
    };

    alexa.send(req, res, options);
});

alexa.ended(function (req, res, reason) {
    console.log(reason);
});

/*
alexa.intent('Thankyou', function (req, res) {
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

alexa.intent('SmalltalkNane', function (req, res) {

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

alexa.intent('SmalltalkInsult', function (req, res) {

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

alexa.intent('BlogReadAnswerYes', helpers.yes);
*/