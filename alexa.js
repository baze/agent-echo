const express = require('express');
const restService = express();

const apiai = require('apiai');
const AlexaSkills = require('alexa-skills');

const app = apiai("cb3111d6b5cb4b22a6a47d96f8e0bb0a");

const alexa = new AlexaSkills({
    express: restService, // required
    route: "/alexa", // optional, defaults to "/"
    applicationId: "amzn1.ask.skill.17e64ff1-708e-432e-add3-f925579d1938" // optional, but recommended. If you do not set this leave it blank
});

alexa.launch(function (req, res) {

    var phrase = "Hallo, ich bin Helga!";
    var options = {
        shouldEndSession: true,
        outputSpeech: phrase
    };

    alexa.send(req, res, options);
});

alexa.intent('DefaultWelcomeIntent', function (req, res, slots) {

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

/*alexa.intent('Employee', function (req, res, slots) {

    console.log(slots);
    console.log(sessionAttributes);

    var phrase = "";
    var textQuery = 'Wer ist ' + slots.employeeslot.value + '?';

    var request = app.textRequest(textQuery, {
        sessionId: '<unique session id>'
    });

    request.on('response', function (response) {
        console.log(JSON.stringify(response, null, '  '));

        phrase = response.result.fulfillment.speech;
        var options = {
            shouldEndSession: false,
            outputSpeech: phrase
        };

        alexa.send(req, res, options);
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

});*/

alexa.intent('Employee', function (req, res, slots, sessionAttributes) {

    console.log(req);
    console.log(res);
    console.log(slots);
    console.log(sessionAttributes);

    var phrase = 'Hello World';
    var options = {
        shouldEndSession: true,
        outputSpeech: phrase,
        card: alexa.buildCard("Card Title", phrase)
    };

    alexa.send(req, res, options);

    /*var phrase = "";
    if (sessionAttributes.previous) {
        phrase = 'You previously said "' + sessionAttributes.previous + '". I have replaced that with "' + slots.city.value + '". Please say another city name.';
    }
    else {
        phrase = 'You said "' + slots.city.value + '". Please say another city name.';
    }

    sessionAttributes.previous = slots.city.value;

    var options = {
        shouldEndSession: false,
        outputSpeech: phrase
    };

    alexa.send(req, res, options, sessionAttributes);*/
});

alexa.intent('EmployeeContextUserinfoCommentPhone', function (req, res, slots) {

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

module.exports = alexa;