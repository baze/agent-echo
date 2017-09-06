'use strict';

// require('./apiai');
// require('./alexa');

var express = require('express');
var restService = express();

var AlexaSkills = require('alexa-skills');
var alexa = new AlexaSkills({
    express: restService, // required
    route: "/alexa", // optional, defaults to "/"
    applicationId: "amzn1.ask.skill.17e64ff1-708e-432e-add3-f925579d1938" // optional, but recommended. If you do not set this leave it blank
});

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

// restService.listen((process.env.PORT || 8000), function () {
restService.listen((process.env.PORT || 8000), function () {
    console.log("Server up and listening");
});