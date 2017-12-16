var express = require('express');
var memes = require('./memes');
var users = require('./users');
var list = require('./list');

module.exports = function (app) {
    app.use('/user', users);
    app.use('/memes', memes);
    app.use('/', list);
};
