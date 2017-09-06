'use strict';

var restService = require('./restService');

// require('./apiai');
require('./alexa');

restService.listen((process.env.PORT || 8000), function () {
    console.log("Server up and listening");
});