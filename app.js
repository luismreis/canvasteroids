#!/usr/bin/env node
/*jslint indent: 2, node: true */
/*global requestAnimationFrame: false */

"use strict";

process.on('uncaughtException', function (err) {
  console.log("Caught exception: " + err.message + "\n" + err.stack);
});

var util = require('util');
var fs = require('fs');

function initWebApp() {
  var express = require('express'),
      http = require('http'),
      path = require('path'),
      socket_io = require('socket.io');

  var app = express();

  app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(require('less-middleware')({ src: __dirname + '/public' }));
    app.use(express.static(path.join(__dirname, 'public')));
  });

  app.configure('development', function () {
    app.use(express.errorHandler());
  });

  var server = require('http').createServer(app);
  server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
  });
}

function initCanvas() {
  var Canvas = require('openvg-canvas');
  var canvas = new Canvas(1920, 1080);
  var Canvasteroids = require('./public/canvas.js');
  Canvasteroids.painter(canvas);

  setInterval(function () {
    Canvasteroids.draw();
    Canvasteroids.update();
    canvas.vgSwapBuffers();
  }, 1000 / 60);
}

fs.readFile('config.json', function (err, data) {
  if (err) {
    console.log('Can\'t read config file.');
    console.log('Error: ' + err);
    return;
  }

  var config = JSON.parse(data);

  var emitter = function (event) {};

  if (config.renderers.canvas) {
    initCanvas();
  }

  if (config.renderers.webapp) {
    initWebApp();
  }
});
