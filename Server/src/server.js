let fs = require ('fs');
let path = require ('path');
let util = require ('util');
let express = require ('express');
let bodyParser = require ('body-parser');
let queryString = require ('querystring');
let request = require ('request');
let BioInfo = require ('./BioInfo');
let bioWatchManager = require ('./BioWatchManager');
let app = express ();

let PATIENTS_STATUS_FILE_PATH = path.join (__dirname, 'patients_status.json');

app.set ('port', (process.env.PORT || 1338));
app.use (bodyParser.json ());
app.use ('/', express.static ('public'));

// Additional middleware which will set headers that we need on each request.
app.use ((req, res, next) => {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader ('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader ('Cache-Control', 'no-cache');
    next ();
});

app.get ('/test/update_status/:inPlace/:bioWatchID/:pulse/:rssi', (req, res) => {
  let inPlace = req.params.inPlace;
  let bioWatchID = req.params.bioWatchID;
  let pulse = req.params.pulse;
  let rssi = req.params.rssi;

  let bioWatchSignal = {
    inPlace: inPlace,
    bioWatchID: bioWatchID, 
    pulse: pulse,
    rssi: rssi
  };

  let options = {
    url: 'http://localhost:' + app.get ('port') + '/api/patients_status',
    method: 'POST',
    json: true,
    headers: {
      "Content-Type": "application/json"
    },
    body: bioWatchSignal
  };

  let flowControl = new Promise ((resolve, reject) => {
    request (options, (error, response, body) => {
      if (error) {
        reject (error);
      }

      resolve ();
    }); 
  })
  .catch ((error) => {
    console.log ('Post data error: ' + error);
  })
  .then (() => {
    res.end ();
  });
});

app.post ('/api/patients_status', (req, res) => {

  let inPlace = req.body.inPlace;
  let bioWatchID = req.body.bioWatchID;
  let index = req.body.index;
  let pulse = req.body.pulse;
  let rssi = req.body.rssi;
  let gatewayTimestamp = req.body.gatewayTimestamp;
  let serverTimestamp = new Date () .getTime ();

  // bioWatchManager.inputBioSignal (new BioInfo (bioWatchID, inPlace, pulse, rssi, serverTimestamp))
  bioWatchManager.inputBioSignal (inPlace, bioWatchID, index, pulse, rssi, gatewayTimestamp, serverTimestamp)
  .then (() => {
    res.end ();
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

app.get ('/api/patients_status', (req, res) => {
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
  res.json (bioWatchManager.getPatientsStatusForJSON ());
  res.end ();
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

app.get ('/api/bioSignals/:bioWatchID/:startTime/:endTime', (req, res) => {
  let bioWatchID = req.params.bioWatchID;
  let startTime = req.params.startTime;
  let endTime = req.params.endTime;

  Promise.resolve ()
  .then (() => {
    return bioWatchManager.getBioSignalsFromBioWatchAtTimePeriod (bioWatchID, startTime, endTime);
  })
  .then ((bioSignals) => {
    res.json (JSON.stringify (bioSignals));
  })
  .then (() => {
    res.end ();
  });

});

app.get ('/api/getBioWatchList', (req, res) => {
  Promise.resolve ()
  .then (() => {
    return bioWatchManager.getBioWatchListForJSON ();
  })
  .then ((bioWatchList) => {
    res.json (bioWatchList);
  })
  .then (() => {
    res.end ();
  });
});

app.get ('/api/getPlaceList', (req, res) => {
  Promise.resolve ()
  .then (() => {
    return bioWatchManager.getPlaceListForJSON ();
  })
  .then ((placeList) => {
    res.json (placeList);
  })
  .then (() => {
    res.end ();
  });
});

app.post ('/api/removePlace', (req, res) => {
  let placeID = req.body.placeID;
  
  bioWatchManager.removePlace (placeID);
  res.end ();
});

app.post ('/api/removeBioWatch', (req, res) => {
  let bioWatchID = req.body.bioWatchID;
  
  bioWatchManager.removeBioWatch (bioWatchID);
  res.end ();
});

app.post ('/api/newPlace', (req, res) => {
  let placeID = req.body.placeID;

  bioWatchManager.newPlace (placeID);
  res.end ();
});

app.post ('/api/newBioWatch', (req, res) => {
  let bioWatch = req.body.bioWatchID;

  bioWatchManager.newBioWatch (bioWatch);
  res.end ();
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

app.listen (app.get ('port'), () => {
  bioWatchManager.init ()
  .then (() => {
    console.log ('Ready on port: ' + app.get ('port'));
  })
  .catch ((err) => {
    console.log ('Database error: ' + err);
  });
  
});


