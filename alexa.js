'use strict';

var restService = require('./restService');

const alexa_application_id = "amzn1.ask.skill.17e64ff1-708e-432e-add3-f925579d1938";

const apiai = require('apiai');
const AlexaSkills = require('alexa-skills');
const app = apiai("cb3111d6b5cb4b22a6a47d96f8e0bb0a");
const alexa = new AlexaSkills({
    express: restService, // required
    route: "/alexa", // optional, defaults to "/"
    applicationId: alexa_application_id // optional, but recommended. If you do not set this leave it blank
});

var helpers = {
    welcome: function Welcome(req, res, slots) {

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
};

alexa.launch(helpers.welcome);

alexa.intent('DefaultWelcomeIntent', helpers.welcome);

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

alexa.intent('BlogReadAnswerYes', helpers.yes);

alexa.ended(function (req, res, reason) {
    console.log(reason);
});