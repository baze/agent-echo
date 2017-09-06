'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const restService = express();

restService.use(bodyParser.json());
restService.use(bodyParser.urlencoded({
    extended: true
}));

restService.listen((process.env.PORT || 8000), function () {
    console.log("Server up and listening");
});

module.exports = restService;