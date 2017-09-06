'use strict';

const restService = require('./restService');

const AlexaSkills = require('alexa-skills');
const alexa = new AlexaSkills({
    express: restService, // required
    route: "/alexa", // optional, defaults to "/"
    applicationId: "amzn1.ask.skill.17e64ff1-708e-432e-add3-f925579d1938" // optional, but recommended. If you do not set this leave it blank
});

// initialize api.ai
const apiai = require('apiai');
const app = apiai("cb3111d6b5cb4b22a6a47d96f8e0bb0a");

let helpers = {
    launch: function(req, res, slots) {

        console.log("DefaultWelcomeIntent");
        console.log(req);
        console.log(res);
        console.log(slots);

        let request = app.textRequest('Hallo', {
            sessionId: '<unique session id>'
        });

        request.on('response', function (response) {

            let phrase = response.result.fulfillment.speech;

            // let phrase = 'Bitte werfen Sie eine Münze ein!';
            let options = {
                shouldEndSession: false,
                outputSpeech: phrase,
                // reprompt: "Bitte werfen Sie noch eine Münze ein",
                reprompt: phrase
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

        let phrase = "Ja";

        let request = app.textRequest(phrase, {
            sessionId: '<unique session id>'
        });

        request.on('response', function (response) {

            let phrase = response.result.fulfillment.speech;
            let options = {
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

alexa.launch(helpers.launch);

alexa.intent('DefaultWelcomeIntent', helpers.launch);

alexa.ended(helpers.ended);

alexa.intent('Thankyou', function (req, res) {
    let request = app.textRequest('Danke', {
        sessionId: '<unique session id>'
    });

    request.on('response', function (response) {

        let phrase = response.result.fulfillment.speech;
        let options = {
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

    let phrase = 'Wer ist zauberhaft und elfengleich?';

    let request = app.textRequest(phrase, {
        sessionId: '<unique session id>'
    });

    request.on('response', function (response) {

        let phrase = response.result.fulfillment.speech;
        let options = {
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

    let phrase = 'Ficke disch';

    let request = app.textRequest(phrase, {
        sessionId: '<unique session id>'
    });

    request.on('response', function (response) {

        let phrase = response.result.fulfillment.speech;
        let options = {
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

/*
alexa.intent('Employee', function (req, res, slots, sessionAttributes) {

    console.log(slots);

    let textQuery = 'Wer ist ' + slots.employeeslot.value + '?';

    let request = app.textRequest(textQuery, {
        sessionId: '<unique session id>'
    });

    request.on('response', function (response) {
        let phrase = response.result.fulfillment.speech;
        let options = {
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

    let phrase = "";
    let textQuery = 'Wer ist die Durchwahl von ' + sessionAttributes.employee + '?';

    let request = app.textRequest(textQuery, {
        sessionId: '<unique session id>'
    });

    request.on('response', function (response) {
        console.log(response);

        phrase = response.result.fulfillment.speech;
        let options = {
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

    let phrase = "";
    let textQuery = 'Wer ist die E-Mail-Adresse von ' + sessionAttributes.employee + '?';

    let request = app.textRequest(textQuery, {
        sessionId: '<unique session id>'
    });

    request.on('response', function (response) {
        console.log(response);

        phrase = response.result.fulfillment.speech;
        let options = {
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

    let phrase = "";
    if (sessionAttributes.blog) {
        phrase = 'Was gibt es neues bei ' + sessionAttributes.blog + '?';
    } else {
        phrase = 'Was gibt es neues bei ' + slots.blogslot.value + '?';
    }

    // sessionAttributes.blog = slots.blogslot.value;

    let request = app.textRequest(phrase, {
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

        let phrase = response.result.fulfillment.speech;
        let options = {
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