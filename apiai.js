'use strict';

var restService = require('./restService');

const WPAPI = require('wpapi');
const moment = require('moment');
moment.locale('de');

const OUTPUT_SPEECH_MAX_LENGTH = 8000;

var striptags = require('striptags');
var stripTags = require('strip-tags');
// var html = require('html-escaper');

var helpers = {
    speech: {
        user: {
            phone: function (user) {
                if (user && user.phone) {

                    if (user.phone == '__SECRET__') {
                        return 'Wenn ich die Nummer verrate, zieht er mir den Stecker, sorry. Du kannst ihn aber' +
                            ' über E-Mail erreichen. Seine Adresse ist: ' + user.email;
                    }

                    return 'Die Durchwahl von ' + user.first_name + ' ' + user.last_name + ' ist die ' + user.phone;
                } else {
                    return 'Diese Information zu ' + user.first_name + ' ' + user.last_name +
                        ' habe ich leider nicht vorliegen. ' +
                        'Aber vielleicht kann ich dir mit Informationen zu ' +
                        'E-Mail-Adresse, Leistungen oder betreuten Kunden ' +
                        'weiterhelfen?';
                }
            },
            email: function (user) {
                if (user && user.email) {

                    if (user.phone == '__SECRET__') {
                        return 'Wenn ich dir das sagen würde, müsste ich dich leider umbringen.';
                    }

                    return 'Die E-Mail-Adresse von ' + user.first_name + ' ' + user.last_name + ' lautet ' + user.email;
                } else {
                    return 'Diese Information zu ' + user.first_name + ' ' + user.last_name +
                        ' habe ich leider nicht vorliegen. ' +
                        'Aber vielleicht kann ich dir mit Informationen zu ' +
                        'Durchwahl, Leistungen oder betreuten Kunden ' +
                        'weiterhelfen?';
                }
            },
            services: function (user) {
                if (user && user.services.length > 0) {
                    var services = user.services.length > 1
                        ? user.services.slice(0, -1).join(', ') + ' und ' + user.services.slice(-1)
                        : user.services;

                    return user.first_name + ' ' + user.last_name + ' ist zuständig für ' + services;
                } else {
                    return 'Diese Information zu ' + user.first_name + ' ' + user.last_name +
                        ' habe ich leider nicht vorliegen. ' +
                        'Aber vielleicht kann ich dir mit Informationen zu ' +
                        'Durchwahl, E-Mail-Adresse oder betreuten Kunden ' +
                        'weiterhelfen?';
                }
            }
        }
    }
};

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

function replaceHTMLEntities(string) {
    string = string.replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#39;/g, "'")
        .replace(/&#x2018;/g, "'")
        .replace(/&#xE4;/g, 'ä')
        .replace(/&#xF6;/g, 'ö')
        .replace(/&#xFC;/g, 'ü')
        .replace(/&szlig;/g, 'ß')
        .replace(/&#xDF;/g, 'ß')
        .replace(/&#x2013;/g, '–')
        .replace(/&#x201E;/g, '„')
        .replace(/&#x201C;/g, '“')
        .replace(/&#8216;/g, '‘')
        .replace(/&#8218;/g, '‚')
        .replace(/&quot;/g, '"');

    return string;
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
            user = getInfoForUsername(username);

            speech = helpers.speech.user.phone(user);

            return generateResponse(res, speech);

            break;

        case 'employee.email' :
            username = req.body.result.parameters.employee;
            user = getInfoForUsername(username);

            speech = helpers.speech.user.email(user);

            return generateResponse(res, speech);

            break;

        case 'employee.services' :
            username = req.body.result.parameters.employee;
            user = getInfoForUsername(username);

            speech = helpers.speech.user.services(user);

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
                    phrase += ' Möchtest du, dass ich ihn vorlese?';

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

            // var post_id = 3321;
            // console.log(post_id);

            if (confirmation && blog && post_id) {
                var wp = new WPAPI({endpoint: 'https://www.' + blog + '.de/wp-json'});

                wp.posts().id(post_id).then(function (data) {
                    // do something with the returned posts

                    var html = data.content.rendered;
                    html = stripTags(html, ['link', 'script', 'img', 'style', 'form', 'iframe']);
                    html = striptags(html);
                    // html = decode(html, 'all');

                    html = replaceHTMLEntities(html);

                    console.log(html.length);
                    // var phrase = html;
                    var phrase = html.substring(0, OUTPUT_SPEECH_MAX_LENGTH);

                    console.log(phrase);

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

                if (!confirmation) {
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

            user = getInfoForUsername(username);

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

        case 'knowledge.employeesCount' :

            var blog = req.body.result.parameters.blog || 'euw';

            if (blog) {
                var wp = new WPAPI({endpoint: 'https://www.' + blog + '.de/wp-json'});

                var namespace = 'wp/v2'; // use the WP API namespace
                var route = '/mitarbeiter/(?P<id>)'; // route string - allows optional ID parameter

                wp.mitarbeiter = wp.registerRoute(namespace, route);

                wp.mitarbeiter().perPage(100).order('asc').then(function (data) {
                    // do something with the returned posts
                    // console.log(data.length);

                    var speech = "Das kann man nie so genau sagen. " +
                        "Zur Zeit laufen auch noch einige Praktikanten im Haus rum. " +
                        "Lass mich mal schauen … \n" +
                        "Wir haben " + data.length + " Mitarbeiter, einige Freelancer und natürlich mich.";

                    // var contextOut = [{"name": "blog", "lifespan": 1, "parameters": {"post_id": data[0].id}}];
                    // return generateResponse(res, phrase, contextOut);

                    return generateResponse(res, speech);

                }).catch(function (err) {
                    // handle error
                    console.log(err);
                    return generateResponse(res, 'Ich konnte keine Mitarbeiter finden');
                });
            } else {
                speech = 'no blog provided';
            }

            break;

        case 'knowledge.employees' :

            var blog = req.body.result.parameters.blog || 'euw';

            if (blog) {
                var wp = new WPAPI({endpoint: 'https://www.' + blog + '.de/wp-json'});

                var namespace = 'wp/v2'; // use the WP API namespace
                var route = '/mitarbeiter/(?P<id>)'; // route string - allows optional ID parameter

                wp.mitarbeiter = wp.registerRoute(namespace, route);

                wp.mitarbeiter().perPage(100).order('asc').then(function (data) {
                    // do something with the returned posts
                    // console.log(data);

                    var mitarbeiter = [];

                    data.forEach((m) => {
                        var name = replaceHTMLEntities(m.title.rendered);

                        if (name != "Dieter Eberle" && name != "Mathias Wollweber") {
                            mitarbeiter.push(name);
                        }

                    });

                    var speech_mitarbeiter_list = mitarbeiter.length > 1
                        ? mitarbeiter.slice(0, -1).join(', ') + ' und ' + mitarbeiter.slice(-1)
                        : mitarbeiter;

                    var speech = "Wer bei euw arbeitet? Das frage ich mich auch manchmal. \n" +
                        "Aber Spaß beiseite. \n" +
                        "Neben einer ganzen Reihe von digitalen Kollegen, die fast rund um die Uhr arbeiten, gibt es " +
                        "noch ein paar Menschen. Die Chefs sagen immer, dass diese Menschen der eigentliche Wert " +
                        "von euw sind. Also, die beiden Chefs heißen Dieter Eberle und Mathias Wollweber und dann " +
                        "haben wir noch: \n" +
                        speech_mitarbeiter_list + ". \n" +
                        "Wenn Du jetzt wissen möchtest, wer für was verantwortlich ist, frage einfach danach.";

                    // var contextOut = [{"name": "blog", "lifespan": 1, "parameters": {"post_id": data[0].id}}];
                    // return generateResponse(res, phrase, contextOut);

                    return generateResponse(res, speech);

                }).catch(function (err) {
                    // handle error
                    console.log(err);
                    return generateResponse(res, 'Ich konnte keine Mitarbeiter finden');
                });
            } else {
                speech = 'no blog provided';
            }

            break;

        default:
            break;
    }

});