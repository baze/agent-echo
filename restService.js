'use strict';

var express = require('express');
var restService = express();
var bodyParser = require('body-parser');

restService.use(bodyParser.json());
restService.use(bodyParser.urlencoded({
    extended: true
}));

console.log(process.env.PORT);

// restService.listen((process.env.PORT || 8000), function () {
restService.listen((process.env.PORT || 433), function () {
    console.log("Server up and listening");
});

module.exports = restService;