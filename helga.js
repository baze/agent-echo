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

    speech : {
        user : {
            phone : function (user) {
                if (user && user.phone) {
                    return 'Die Durchwahl von ' + user.first_name + ' ' + user.last_name + ' ist die ' + user.phone;
                } else {
                    return 'Diese Information zu ' + user.first_name + ' ' + user.last_name +
                        ' habe ich leider nicht vorliegen. ' +
                        'Aber vielleicht kann ich dir mit Informationen zu ' +
                        'E-Mail-Adresse, Leistungen oder betreuten Kunden ' +
                        'weiterhelfen?';
                }
            },
            email : function (user) {
                if (user && user.email) {
                    return 'Die E-Mail-Adresse von ' + user.first_name + ' ' + user.last_name + ' lautet ' + user.email;
                } else {
                    return 'Diese Information zu ' + user.first_name + ' ' + user.last_name +
                        ' habe ich leider nicht vorliegen. ' +
                        'Aber vielleicht kann ich dir mit Informationen zu ' +
                        'Durchwahl, Leistungen oder betreuten Kunden ' +
                        'weiterhelfen?';
                }
            },
            services : function (user) {
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