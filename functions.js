'use strict';

module.exports = {
    getInfoForUsername: function (username) {
        const _users = require('./users.json');

        for (var i = 0, len = _users.length; i < len; i++) {

            var user = _users[i];

            if (user.username == username) {
                console.log(user);
                return user;
            }
        }
    },

    getUsersForClient: function (client) {
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
    },


    generateResponse: function (res, speech) {
        return res.json({
            speech: speech,
            displayText: speech,
            source: 'webhook-echo-sample'
        });
    }

};
/*


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
*/
