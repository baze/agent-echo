'use strict';

var restService = require('./restService');

var AlexaSkills = require('./alexa-skills');
var alexa = new AlexaSkills({
    express: restService, // required
    route: "/alexa", // optional, defaults to "/"
    applicationId: "amzn1.ask.skill.17e64ff1-708e-432e-add3-f925579d1938" // optional, but recommended. If you do not set this leave it blank
});

const apiai = require('apiai');
const app = apiai("cb3111d6b5cb4b22a6a47d96f8e0bb0a");

var helpers = {
    launch: function(req, res, slots) {

        // console.log(req);
        // console.log(res);
        var intentName = req.body.request.intent.name;

        console.log(intentName);
        // console.log(slots);

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

    ended: function(req, res, reason) {
        console.log(reason);
    },

    yes: function(req, res, slots) {

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
    },

    simpleRequest: function (req, res, phrase) {
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
    }
};

alexa.launch(helpers.launch);

alexa.intent('DefaultWelcomeIntent', helpers.launch);

alexa.ended(function (req, res, reason) {
    console.log(reason);
});

alexa.intent('Thankyou', function (req, res) {
    var phrase = 'Danke';
    helpers.simpleRequest(req, res, phrase);
});

alexa.intent('SmalltalkNane', function (req, res) {
    var phrase = 'Wer ist zauberhaft und elfengleich?';
    helpers.simpleRequest(req, res, phrase);
});

alexa.intent('SmalltalkStkl', function (req, res) {
    var phrase = 'Wer hat Küchendienst?';
    helpers.simpleRequest(req, res, phrase);
});

alexa.intent('SmalltalkInsult', function (req, res) {
    var phrase = 'Ficke disch';
    helpers.simpleRequest(req, res, phrase);
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

alexa.intent('KnowledgeAddressfunny', function(req, res) {
    var phrase = 'wie finde ich euch?';
    helpers.simpleRequest(req, res, phrase);
});

alexa.intent('KnowledgeAddress', function(req, res) {
    var phrase = 'wie komme ich zu euch?';
    helpers.simpleRequest(req, res, phrase);
});

alexa.intent('KnowledgeActivities', function(req, res) {
    var phrase = 'was macht ihr so?';
    helpers.simpleRequest(req, res, phrase);
});

alexa.intent('KnowledgeEmployees', function(req, res) {
    var phrase = 'wer arbeitet bei euw?';
    helpers.simpleRequest(req, res, phrase);
});

alexa.intent('KnowledgeEmployeescount', function (req, res) {
    var phrase = 'wieviele Personen arbeiten bei euw?';
    helpers.simpleRequest(req, res, phrase);
});

alexa.intent('KnowledgeXbm', function (req, res) {
    var phrase = 'wie kommt euw auf die guten Ideen?';
    helpers.simpleRequest(req, res, phrase);
});

alexa.intent('KnowledgeFounded', function (req, res) {
    var phrase = 'Wann wurde euw gegründet?';
    helpers.simpleRequest(req, res, phrase);
});