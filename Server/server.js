'use strict';

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var queryString = require('querystring');
var request = require('request');
var BioInfo = require('./BioInfo');
var bioWatchManager = require('./BioWatchManager');
var app = express();

var PATIENTS_STATUS_FILE_PATH = path.join(__dirname, 'patients_status.json');

app.set('port', process.env.PORT || 1338);
app.use(bodyParser.json());
app.use('/', express.static('public'));

// Additional middleware which will set headers that we need on each request.
app.use(function (req, res, next) {
  // Set permissive CORS header - this allows this server to be used only as
  // an API server in conjunction with something like webpack-dev-server.
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Disable caching so we'll always get the latest comments.
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

app.get('/test/update_status/:inPlace/:bioWatchId/:pulse/:rssi', function (req, res) {
  var inPlace = req.params.inPlace;
  var bioWatchId = req.params.bioWatchId;
  var pulse = req.params.pulse;
  var rssi = req.params.rssi;

  var bioWatchSignal = {
    inPlace: inPlace,
    bioWatchId: bioWatchId,
    pulse: pulse,
    rssi: rssi
  };

  var options = {
    url: 'http://localhost:' + app.get('port') + '/api/patients_status',
    method: 'POST',
    json: true,
    headers: {
      "Content-Type": "application/json"
    },
    body: bioWatchSignal
  };

  var flowControl = new Promise(function (resolve, reject) {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      }

      resolve();
    });
  }).catch(function (error) {
    console.log('Post data error: ' + error);
  }).then(function () {
    res.end();
  });
});

app.post('/api/patients_status', function (req, res) {

  var inPlace = req.body.inPlace;
  var bioWatchId = req.body.bioWatchId;
  var pulse = req.body.pulse;
  var rssi = req.body.rssi;
  var dateAndTime = new Date().getTime();

  bioWatchManager.inputBioSignal(new BioInfo(bioWatchId, inPlace, pulse, rssi, dateAndTime)).then(function () {
    res.end();
  });
});

app.get('/api/patients_status', function (req, res) {
  var flowControl = new Promise(function (resolve, reject) {
    fs.readFile(PATIENTS_STATUS_FILE_PATH, function (err, data) {
      if (err) {
        reject(err);
      }

      res.json(JSON.parse(data));
      resolve();
    });
  }).catch(function (err) {
    console.log('Error: ' + err);
  }).then(function () {
    res.end();
  });
});

app.get('/test/scanedResult/:inPlace/:bioWatchId/:rssi/', function (req, res) {
  var inPlace = req.params.inPlace;
  var bioWatchId = req.params.bioWatchId;
  var rssi = req.params.rssi;

  var bioWatchSignal = {
    inPlace: inPlace,
    bioWatchId: bioWatchId,
    rssi: rssi
  };

  var options = {
    url: 'http://localhost:' + app.get('port') + '/api/scanedResult',
    method: 'POST',
    json: true,
    headers: {
      "Content-Type": "application/json"
    },
    body: bioWatchSignal
  };

  var flowControl = new Promise(function (resolve, reject) {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      }
      res.send(response.body.toString());
      resolve();
    });
  }).catch(function (error) {
    console.log('Post data error: ' + error);
  }).then(function () {
    res.end();
  });
});

app.post('/api/scanedResult', function (req, res) {
  // I would check if the last rssi is smaller (the last is farther) then connect(send: 1) else nothing(send: 0)
  var place_id = req.body.inPlace;
  var device_id = req.body.bioWatchId;
  var rssi = req.body.rssi;

  bioWatchManager.updateSpace(new BioInfo(device_id, place_id, null, rssi, null)).then(function (toConnect) {
    res.send(toConnect);
  }).catch(function (err) {
    console.log('Error: ' + err);
  }).then(function () {
    res.end();
  });
});

app.get('/api/bioWatchList', function (req, res) {
  Promise.resolve().then(function () {
    return bioWatchManager.getBioWatchList();
  }).then(function (bioWatchList) {
    res.json(JSON.stringify(bioWatchList));
  }).then(function () {
    res.end();
  });
});

app.get('/api/configures', function (req, res) {
  Promise.resolve().then(function () {
    return bioWatchManager.getBioWatchList();
  }).then(function (bioWatchList) {
    var configures = bioWatchList.join(',');
    res.send(configures);
  }).then(function () {
    res.end();
  });
});

app.listen(app.get('port'), function () {
  bioWatchManager.init().then(function () {
    console.log('Ready on port: ' + app.get('port'));
  }).catch(function (err) {
    console.log('Database error: ' + err);
  });
});