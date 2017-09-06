'use strict';

const express = require('express');
const restService = express();
const bodyParser = require('body-parser');

restService.use(bodyParser.json());
restService.use(bodyParser.urlencoded({
    extended: true
}));

restService.listen((443), function () {
    console.log("Server up and listening");
});

module.exports = restService;