'use strict';

const express = require('express');
const restService = express();
const bodyParser = require('body-parser');

/*restService.use(bodyParser.json());
restService.use(bodyParser.urlencoded({
    extended: true
}));*/

restService.listen((process.env.PORT || 8080), function () {
    console.log("Server up and listening");
});

module.exports = restService;