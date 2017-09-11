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

    request: function (req, res, phrase, shouldEndSession = false, sessionAttributes, contexts) {
        var request = app.textRequest(phrase, {
            sessionId: '<unique session id>'
        });

        request.on('response', function (response) {

            var phrase = response.result.fulfillment.speech;
            var options = {
                shouldEndSession: shouldEndSession,
                outputSpeech: phrase,
                contexts: contexts
            };

            sessionAttributes.myAction = response.result.action;
            console.log(sessionAttributes);

            alexa.send(req, res, options, sessionAttributes);
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

// Blog

alexa.intent('BlogLatest', function (req, res, slots) {

    var blog = slots.blogslot.value;

    var phrase = 'Was gibt es neues bei ' + blog + '?';

    helpers.request(req, res, phrase);
});

alexa.intent('BlogReadAnswerYes', helpers.yes);

// Employees

alexa.intent('Employee', function (req, res, slots, sessionAttributes) {
    var employee = slots.employeeslot.value;

    var phrase = 'Wer ist ' + employee + '?';

    sessionAttributes.employee = employee;

    var contexts = [
        {
            name: 'userinfo',
            parameters: {
                'employee': employee
            }
        }
    ];

    var shouldEndSession = false;

    helpers.request(req, res, phrase, shouldEndSession, sessionAttributes, contexts);
});

alexa.intent('EmployeeEmail', function (req, res, slots, sessionAttributes) {

    console.log(req.request.intent.name);

    // var employee = req.request.intent.name == 'Previousintent' ? req.request.slots.employeeslot.value : slots.employeeslot.value;
    var employee = slots.employeeslot.value;

    var phrase = 'Wer ist die E-Mail-Adresse von ' + employee + '?';

    sessionAttributes.employee = employee;

    var contexts = [
        {
            name: 'userinfo',
            parameters: {
                'employee': employee
            }
        }
    ];

    var shouldEndSession = false;

    helpers.request(req, res, phrase, shouldEndSession, sessionAttributes, contexts);
});

alexa.intent('EmployeePhone', function (req, res, slots, sessionAttributes) {

    var employee = req.request.intent.name == 'Previousintent' ? req.request.slots.employeeslot.value : slots.employeeslot.value;

    var phrase = 'Wer ist die Durchwahl von ' + employee + '?';

    sessionAttributes.employee = employee;

    var contexts = [
        {
            name: 'userinfo',
            parameters: {
                'employee': employee
            }
        }
    ];

    var shouldEndSession = false;

    helpers.request(req, res, phrase, shouldEndSession, sessionAttributes, contexts);

});

alexa.intent('EmployeeContextUserinfoCommentPhone', function (req, res, slots, sessionAttributes) {

    var employee = sessionAttributes.employee;
    sessionAttributes.employee = employee;

    var phrase = 'wie ist die Durchwahl?';

    var contexts = [
        {
            name: 'userinfo',
            parameters: {
                'employee': employee
            }
        }
    ];

    var shouldEndSession = false;

    helpers.request(req, res, phrase, shouldEndSession, sessionAttributes, contexts);
});

alexa.intent('EmployeeContextUserinfoCommentEmail', function (req, res, slots, sessionAttributes) {

    var employee = sessionAttributes.employee;
    sessionAttributes.employee = employee;

    var phrase = 'Wie ist die E-Mail-Adresse?';

    var contexts = [
        {
            name: 'userinfo',
            parameters: {
                'employee': employee
            }
        }
    ];

    var shouldEndSession = false;

    helpers.request(req, res, phrase, shouldEndSession, sessionAttributes, contexts);
});

// Knowledge
alexa.intent('KnowledgeActivities', function (req, res) {
    var phrase = 'was macht ihr so?';
    helpers.request(req, res, phrase);
});

alexa.intent('KnowledgeAddress', function (req, res) {
    var phrase = 'wie komme ich zu euch?';
    helpers.request(req, res, phrase);
});

alexa.intent('KnowledgeAddressfunny', function(req, res) {
    var phrase = 'wie finde ich euch?';
    helpers.request(req, res, phrase);
});

alexa.intent('KnowledgeEmployees', function(req, res) {
    var phrase = 'wer arbeitet bei euw?';
    helpers.request(req, res, phrase);
});

alexa.intent('KnowledgeEmployeescount', function (req, res) {
    var phrase = 'wieviele Personen arbeiten bei euw?';
    helpers.request(req, res, phrase);
});

alexa.intent('KnowledgeFounded', function (req, res) {
    var phrase = 'Wann wurde euw gegründet?';
    helpers.request(req, res, phrase);
});

alexa.intent('KnowledgeIndustrysectors', function (req, res) {
    var phrase = 'In welchen Branchen seid ihr tätig';
    helpers.request(req, res, phrase);
});

alexa.intent('KnowledgeOpeninghours', function (req, res) {
    var phrase = 'Wie sind die Öffnungszeiten';
    helpers.request(req, res, phrase);
});

alexa.intent('KnowledgeRevenue', function (req, res) {
    var phrase = 'Welchen Umsatz macht euw?';
    helpers.request(req, res, phrase);
});

alexa.intent('KnowledgeServices', function (req, res) {
    var phrase = 'welche Leistungen bietet ihr an?';
    helpers.request(req, res, phrase);
});

alexa.intent('KnowledgeXbm', function (req, res) {
    var phrase = 'wie kommt euw auf die guten Ideen?';
    helpers.request(req, res, phrase);
});

// Smalltalk

alexa.intent('SmalltalkAbout', function (req, res) {
    var phrase = 'wofür steht helga';
    helpers.request(req, res, phrase);
});

alexa.intent('SmalltalkInsult', function (req, res) {
    var phrase = 'Ficke disch';
    helpers.request(req, res, phrase);
});

alexa.intent('SmalltalkNane', function (req, res) {
    var phrase = 'Wer ist zauberhaft und elfengleich?';
    helpers.request(req, res, phrase);
});

alexa.intent('SmalltalkStkl', function (req, res) {
    var phrase = 'Wer hat Küchendienst?';
    helpers.request(req, res, phrase);
});

// Misc

alexa.intent('Thankyou', function (req, res) {
    var phrase = 'Danke';
    helpers.request(req, res, phrase);
});

alexa.intent('Previousintent', function (req, res, slots, sessionAttributes) {

    console.log(slots);
    // console.log(sessionAttributes);

    switch (sessionAttributes.myAction) {
        case 'employee.email' :
            console.log("email");
            helpers.request(req, res, 'und die email?', false, sessionAttributes);
            break;

        case 'employee.phone' :
            console.log("phone");
            helpers.request(req, res, 'und die telefonnummer?', false, sessionAttributes);
            break;

        default:
            console.log("default");
            break;
    }
});