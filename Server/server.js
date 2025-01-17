'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
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

app.get('/test/update_status/:inPlace/:bioWatchID/:pulse/:rssi', function (req, res) {
  var inPlace = req.params.inPlace;
  var bioWatchID = req.params.bioWatchID;
  var pulse = req.params.pulse;
  var rssi = req.params.rssi;

  var bioWatchSignal = {
    inPlace: inPlace,
    bioWatchID: bioWatchID,
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
  var bioWatchID = req.body.bioWatchID;
  var index = req.body.index;
  var pulse = req.body.pulse;
  var rssi = req.body.rssi;
  var gatewayTimestamp = req.body.gatewayTimestamp;
  var serverTimestamp = new Date().getTime();

  // bioWatchManager.inputBioSignal (new BioInfo (bioWatchID, inPlace, pulse, rssi, serverTimestamp))
  bioWatchManager.inputBioSignal(inPlace, bioWatchID, index, pulse, rssi, gatewayTimestamp, serverTimestamp).then(function () {
    res.end();
  });

  // console.log ("Get from: ", inPlace);
});

// for json
// app.get ('/api/patients_status', (req, res) => {
//   let flowControl = new Promise ((resolve, reject) => {
//     fs.readFile (PATIENTS_STATUS_FILE_PATH, (err, data) => {
//       if (err) {
//         reject (err);
//       }

//       res.json (JSON.parse (data));
//       resolve ();
//     });
//   })
//   .catch ((err) => {
//     console.log ('Error: ' + err);    
//   })
//   .then (() => {
//     res.end ();
//   });
//   // res.send (this.bioWatchManager.testForGetPatientsStatus ());
//   // res.end ();
// });

app.get('/api/patients_status', function (req, res) {
  // var cache = [];
  // var objStr = JSON.stringify (bioWatchManager.getPatientList (), function (key, value) {
  //     // console.log (bioWatchManager.getPatientList ());
  //     if (typeof value === 'object' && value !== null) {
  //         if (cache.indexOf(value) !== -1) {
  //             // Circular reference found, discard key
  //             return;
  //         }
  //         // Store value in our collection
  //         cache.push(value);
  //     }
  //     return value;
  // });
  // cache = null; // Enable garbage collection

  // // res.json (JSON.parse (objStr));
  res.json(bioWatchManager.getPatientsStatusForJSON());
  res.end();
});

// app.get ('/test/scanedResult/:inPlace/:bioWatchId/:rssi/', (req, res) => {
//   let inPlace = req.params.inPlace;
//   let bioWatchId = req.params.bioWatchId;
//   let rssi = req.params.rssi;

//   let bioWatchSignal = {
//     inPlace: inPlace,
//     bioWatchId: bioWatchId, 
//     rssi: rssi
//   };

//   let options = {
//     url: 'http://localhost:' + app.get ('port') + '/api/scanedResult',
//     method: 'POST',
//     json: true,
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: bioWatchSignal
//   };

//   let flowControl = new Promise ((resolve, reject) => {
//     request (options, (error, response, body) => {
//       if (error) {
//         reject (error);
//       }
//       res.send (response.body.toString ());
//       resolve ();
//     });
//   })
//   .catch ((error) => {
//     console.log ('Post data error: ' + error);
//   })
//   .then (() => {
//     res.end ();
//   });
// });

// app.post ('/api/scanedResult', (req, res) => {
//   // I would check if the last rssi is smaller (the last is farther) then connect(send: 1) else nothing(send: 0)
//   let place_id = req.body.inPlace;
//   let device_id = req.body.bioWatchId;
//   let rssi = req.body.rssi;

//   bioWatchManager.updateSpace (new BioInfo (device_id, place_id, null, rssi, null))
//   .then ((toConnect) => {
//     res.send (toConnect);
//   })
//   .catch ((err) => {
//     console.log ('Error: ' + err);
//   })
//   .then (() => {
//     res.end ();
//   });
// });

app.get('/api/bioSignals/:bioWatchID/:startTime/:endTime', function (req, res) {
  var bioWatchID = req.params.bioWatchID;
  var startTime = req.params.startTime;
  var endTime = req.params.endTime;

  Promise.resolve().then(function () {
    return bioWatchManager.getBioSignalsFromBioWatchAtTimePeriod(bioWatchID, startTime, endTime);
  }).then(function (bioSignals) {
    res.json(JSON.stringify(bioSignals));
  }).then(function () {
    res.end();
  });
});

app.get('/api/getBioWatchList', function (req, res) {
  Promise.resolve().then(function () {
    return bioWatchManager.getBioWatchListForJSON();
  }).then(function (bioWatchList) {
    res.json(bioWatchList);
  }).then(function () {
    res.end();
  });
});

app.get('/api/getPlaceList', function (req, res) {
  Promise.resolve().then(function () {
    return bioWatchManager.getPlaceListForJSON();
  }).then(function (placeList) {
    res.json(placeList);
  }).then(function () {
    res.end();
  });
});

app.post('/api/removePlace', function (req, res) {
  var placeID = req.body.placeID;

  bioWatchManager.removePlace(placeID);
  res.end();
});

app.post('/api/removeBioWatch', function (req, res) {
  var bioWatchID = req.body.bioWatchID;

  bioWatchManager.removeBioWatch(bioWatchID);
  res.end();
});

app.post('/api/newPlace', function (req, res) {
  var placeID = req.body.placeID;

  bioWatchManager.newPlace(placeID);
  res.end();
});

app.post('/api/newBioWatch', function (req, res) {
  var bioWatch = req.body.bioWatchID;

  bioWatchManager.newBioWatch(bioWatch);
  res.end();
});

// app.get ('/api/configures', (req, res) => {
//   Promise.resolve ()
//   .then (() => {
//     return bioWatchManager.getBioWatchList ();
//   })
//   .then ((bioWatchList) => {
//     let configures = bioWatchList.join (',');
//     res.send (configures);
//   })
//   .then (() => {
//     res.end ();
//   });
// });

app.listen(app.get('port'), function () {
  bioWatchManager.init().then(function () {
    console.log('Ready on port: ' + app.get('port'));
  }).catch(function (err) {
    console.log('Database error: ' + err);
  });
});