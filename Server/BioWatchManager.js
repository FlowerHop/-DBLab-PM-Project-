'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Main Control from Server to BioSignalDatabase
// maintain criteria setting, patients status and operation of the BioSignalDatabase
var csv = require('fast-csv');
var fs = require('fs');
var Place = require('./Place');
var Patient = require('./Patient');
var BioWatch = require('./BioWatch');
var BioSignal = require('./BioSignal');

var csvFileName = "server_" + new Date().toString() + '.csv';
var csvStream = csv.createWriteStream({ headers: true });
var writableStream = fs.createWriteStream("./saves/" + csvFileName);

writableStream.on("finish", function () {
  console.log("finish");
});

csvStream.pipe(writableStream);

var BioWatchManager = function () {
  function BioWatchManager() {
    _classCallCheck(this, BioWatchManager);

    var path = require('path');
    this.fs = require('fs');
    this.CRITERIA_SETTINGS_FILE_PATH = path.join(__dirname, 'criteria_settings.json');
    this.PATIENTS_STATUS_FILE_PATH = path.join(__dirname, 'patients_status.json');
    this.DATABASE_FILE_NAME = 'bioSignalDatabase.db';
    this.DATABASE_FILE_PATH = path.join(__dirname, this.DATABASE_FILE_NAME);

    this.bioSignalDatabase = new (require('./BioSignalDatabase'))(this.DATABASE_FILE_NAME);
    this.bioSignalDatabase.init();
    this.patients = [];

    this.bioWatchList = [];
    this.patientList = [];
    this.placeList = [];
  }

  _createClass(BioWatchManager, [{
    key: 'init',
    value: function init() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        // if (autoReset == true) {
        //   resolve (defaults);
        // } else {
        //   if (database file) {
        //     resolve ();
        //   } else
        //     resolve (data);
        // }
        // .then (function (data) {
        //   if (data) {
        //     remove database
        //     and init database
        //       input default setting
        //     write patients_status
        //   } else {
        //     init database 
        //     get the last database data into patients_status
        //   }
        // })
        _this.fs.readFile(_this.CRITERIA_SETTINGS_FILE_PATH, function (err, data) {
          if (err) {
            reject(err);
          }

          resolve(data);
        });
      }).then(function (data) {
        data = JSON.parse(data);
        var autoReset = data.autoReset;

        if (autoReset === true) {
          console.log('autoReset == true');
          return Promise.resolve().then(function () {
            return data.default_settings;
          });
        } else {
          console.log('autoReset == false');

          return _this.bioSignalDatabase.getPlaceList().then(function (placeList) {
            return null;
          }).catch(function (err) {
            return data.default_settings;
          });

          // return new Promise ((resolve, reject) => {
          //   this.fs.access (this.DATABASE_FILE_PATH, this.fs.F_OK, (err) => {
          //     if (err == null) {
          //       // db exist
          //       resolve ();
          //     } else {
          //       resolve (data.default_settings);
          //     }
          //   });
          // })
          // .then ((defaultSettings) => {
          //   console.log ('default');
          //   console.log (defaultSettings);
          //   return defaultSettings;
          // });
        }
      }).then(function (defaultSettings) {
        if (defaultSettings) {
          // console.log ('db file does not exist');
          console.log('has no list');
          return Promise.resolve().then(function () {
            console.log('destroy');
            return Promise.resolve().then(function () {
              _this.bioSignalDatabase.destroy();
            });
          }).then(function () {
            console.log('init');
            return Promise.resolve().then(function () {
              return _this.bioSignalDatabase.init();
            });
          }).then(function () {
            console.log('insert');
            var rooms = defaultSettings.rooms;
            var bioWatches = defaultSettings.bioWatches;

            rooms.forEach(function (room) {
              _this.bioSignalDatabase.insertPlace(room);
            });

            bioWatches.forEach(function (bioWatch) {
              _this.bioSignalDatabase.insertBioWatch(bioWatch);
            });

            // test -----
            var placeIDList = defaultSettings.rooms;
            var bioWatchIDList = defaultSettings.bioWatches;

            placeIDList.forEach(function (placeID) {
              _this.placeList.push(new Place(placeID));
            });

            bioWatchIDList.forEach(function (bioWatchID) {
              var bioWatch = new BioWatch(bioWatchID);
              var patient = new Patient(bioWatchID);
              patient.wearBioWatch(bioWatch);

              _this.bioWatchList.push(bioWatch);
              _this.patientList.push(patient);
            });

            // test =====

            var initial_status = [];

            for (var i = 0; i < rooms.length; i++) {
              initial_status.push({ inPlace: rooms[i], devices: [] });
            }

            var None = { inPlace: 'None', devices: [] };
            for (var _i = 0; _i < bioWatches.length; _i++) {
              var bioWatch = bioWatches[_i];
              None.devices.push({ device_id: bioWatch, rssi: 0, pulse: 0 });
            }

            // for (let i = 0; i < bioWatches.length; i++) {
            //   let bioWatch = bioWatches[i];
            //   this.patients.push (new Patient (bioWatch, bioWatch));
            // }

            _this.bioSignalDatabase.getPlaceList().then(function (data) {
              console.log(data);
            });

            initial_status.push(None);
            return new Promise(function (resolve, reject) {
              _this.fs.writeFile(_this.PATIENTS_STATUS_FILE_PATH, JSON.stringify(initial_status), function (err) {
                if (err) {
                  reject(err);
                }
                resolve();
              });
            });
          });
        } else {
          var _ret = function () {
            // console.log ('db file does exist');
            console.log('has list');
            var initial_status = [];

            return {
              v: _this.bioSignalDatabase.init().then(function () {
                return _this.bioSignalDatabase.getPlaceList();
              }).then(function (placeList) {
                for (var id in placeList) {
                  var place = placeList[id];
                  _this.placeList.push(new Place(place));
                }

                for (var _id in placeList) {
                  initial_status.push({ inPlace: placeList[_id], devices: [] });
                }
              }).then(function () {
                return _this.bioSignalDatabase.getBioWatchList();
              }).then(function (bioWatchList) {
                // test
                for (var id in bioWatchList) {
                  var bioWatchID = bioWatchList[id];
                  var bioWatch = new BioWatch(bioWatchID);
                  var patient = new Patient(bioWatchID);
                  patient.wearBioWatch(bioWatch);
                  _this.bioWatchList.push(bioWatch);
                }
                // test

                var None = { inPlace: 'None', devices: [] };
                for (var _id2 in bioWatchList) {
                  None.devices.push({ device_id: bioWatchList[_id2], pulse: 0, rssi: 0, dateAndTime: 0 });
                }

                initial_status.push(None);

                var promiseArray = [];

                for (var _id3 in bioWatchList) {
                  promiseArray.push(_this.bioSignalDatabase.getBioSignalsFromBioWatch(bioWatchList[_id3]));
                }

                return Promise.all(promiseArray);

                // return initial_status;
              }).then(function (bioSignalsArray) {
                bioSignalsArray.forEach(function (bioSignals) {
                  var theLatestBioSignal = bioSignals[0];
                  if (theLatestBioSignal) {
                    var device_id = theLatestBioSignal.device_id;
                    var place_id = theLatestBioSignal.place_id;
                    var pulse = theLatestBioSignal.pulse;
                    var rssi = theLatestBioSignal.rssi;
                    var _dateAndTime = theLatestBioSignal.dateAndTime;

                    // test
                    var bioWatch = null;
                    var place = null;

                    for (var i in _this.bioWatchList) {
                      if (_this.bioWatchList[i].bioWatchID == device_id) {
                        bioWatch = _this.bioWatchList[i];
                        break;
                      }
                    }

                    for (var _i2 in _this.placeList) {
                      if (_this.placeList[_i2].placeID == place_id) {
                        place = _this.placeList[_i2];
                        break;
                      }
                    }

                    if (bioWatch != null && place != null) {
                      bioWatch.pulse = pulse;
                      bioWatch.dateAndTime = _dateAndTime;
                      place.scannedIn(bioWatch, rssi);
                    } else {
                      console.log("BioWatch: " + bioWatch);
                      console.log("Place: " + place);
                    }

                    // test 

                    var noneDeviceList = initial_status[initial_status.length - 1];

                    for (var _place in initial_status) {
                      if (initial_status[_place].inPlace === 'None') {
                        noneDeviceList = initial_status[_place].devices;
                        break;
                      }
                    }

                    for (var _i3 = 0; _i3 < noneDeviceList.length; _i3++) {
                      if (noneDeviceList[_i3].device_id === device_id) {
                        noneDeviceList.splice(_i3, 1);

                        for (var _place2 in initial_status) {
                          if (initial_status[_place2].inPlace === place_id) {
                            initial_status[_place2].devices.push({
                              device_id: device_id,
                              pulse: pulse,
                              rssi: rssi,
                              dateAndTime: _dateAndTime
                            });
                            break;
                          }
                        }
                        break;
                      }
                    }
                  }
                });

                return initial_status;
              }).then(function (initial_status) {
                return new Promise(function (resolve, reject) {
                  _this.fs.writeFile(_this.PATIENTS_STATUS_FILE_PATH, JSON.stringify(initial_status), function (err) {
                    if (err) {
                      reject(err);
                    }

                    resolve();
                  });
                });
              })
            };
          }();

          if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        }
      }).catch(function (err) {
        console.log(err);
      });
      // it needs some feature of checking connection
    }
  }, {
    key: 'newPlace',
    value: function newPlace(inPlace) {
      var _this2 = this;

      return this.bioSignalDatabase.insertPlace(inPlace).then(function () {
        _this2.placeList.push(new Place(inPlace));
      }).catch(function (err) {
        console.log('Error: newPlace (' + inPlace + ') ' + err);
      });
    }
  }, {
    key: 'newBioWatch',
    value: function newBioWatch(bioWatchID) {
      var _this3 = this;

      return this.bioSignalDatabase.insertBioWatch(bioWatchID).then(function () {
        _this3.bioWatchList.push(new BioWatch(bioWatchID));
      }).catch(function (err) {
        console.log('Error: newBioWatch (' + bioWatchID + ') ' + err);
      });
    }

    // inputBioSignal (bioInfo) {
    //   var device_id = bioInfo.device_id;
    //   var place_id = bioInfo.place_id;
    //   var pulse = bioInfo.pulse;
    //   var rssi = bioInfo.rssi;
    //   var dateAndTime = bioInfo.dateAndTime;

  }, {
    key: 'inputBiosignal',
    value: function inputBiosignal(inPlace, bioWatchID, index, pulse, rssi, gatewayTimestamp, serverTimestamp) {
      var _this4 = this;

      var device_id = bioWatchID;
      var place_id = inPlace;

      return Promise.resolve().then(function () {
        return _this4.updateStatus(new BioInfo(bioWatchID, place_id, pulse, rssi, serverTimestamp));
      }).then(function (place) {
        if (place != null) {
          // write
          csvStream.write({
            inPlace: inPlace,
            bioWatchID: bioWatchID,
            index: index,
            pulse: pulse,
            rssi: rssi,
            gatewayTimestamp: gatewayTimestamp,
            serverTimestamp: serverTimestamp,
            gatewayDateAndTime: new Date(gatewayTimestamp),
            serverDateAndTime: new Date(serverTimestamp)
          });

          _this4.writeToCSV(bioWatchSignal);
          return _this4.bioSignalDatabase.insertBioSignal(device_id, place.placeID, pulse, rssi, dateAndTime);
        }
      }).catch(function (err) {
        console.log('Error: inputBioSignal (' + bioInfo + ') ' + err);
      });
    }
  }, {
    key: 'updateStatus',
    value: function updateStatus(bioInfo) {
      var bioWatch = null;
      var place = null;
      for (var i in this.bioWatchList) {
        bioWatch = this.bioWatchList[i];
        if (bioWatch.wear.patient != null && bioWatch.bioWatchID == bioInfo.device_id) {
          bioWatch.wear.patient.inputBioSignal(new BioSignal(bioInfo.pulse, bioInfo.dateAndTime));
          break;
        }
      }

      for (var _i4 in this.placeList) {
        place = this.placeList[_i4];
        if (place.placeID == bioInfo.place_id) {
          place = place.scannedIn(bioWatch, bioInfo.rssi);
          break;
        }
      }

      return place;
    }
  }, {
    key: 'getPlaceList',
    value: function getPlaceList() {
      return this.placeList;
    }
  }, {
    key: 'getBioWatchList',
    value: function getBioWatchList() {
      return this.bioWatchList;
    }

    // for json
    // updateStatus (bioInfo) {
    //   return new Promise ((resolve, reject) => {
    //     this.fs.readFile (this.PATIENTS_STATUS_FILE_PATH, (err, data) => {
    //       if (err) {
    //         reject (err);
    //       }

    //       let patients_status = JSON.parse (data);

    //       let device_id = bioInfo.device_id;
    //       let place_id = bioInfo.place_id;
    //       let pulse = bioInfo.pulse;
    //       let rssi = bioInfo.rssi;
    //       let dateAndTime = bioInfo.dateAndTime;

    //       // find the place of this bio watch
    //       let lastPlace = -1;

    //       for (let i in patients_status) {
    //         let devices = patients_status[i].devices;
    //         for (let j in devices) { 
    //           // find the bio watch whether exist
    //           if (devices[j].device_id === device_id) {
    //             lastPlace = i;
    //             // in the same place
    //             if (patients_status[lastPlace].inPlace === place_id) {
    //               devices[j].pulse = pulse;
    //               devices[j].rssi = rssi;
    //               devices[j].dateAndTime = dateAndTime;
    //             } else {
    //               // remove the last place of the bio watch
    //               devices.splice (j,1);

    //               // change place
    //               for (let k = 0; k < patients_status.length; k++) {
    //                 if (patients_status[k].inPlace === place_id) {
    //                   patients_status[k].devices.push ({device_id: device_id, pulse: pulse, rssi: rssi, dateAndTime: dateAndTime});
    //                   break;
    //                 }
    //               }
    //             }
    //             break;
    //           }
    //         }

    //         if (lastPlace != -1) {
    //           break;
    //         }
    //       }

    //       // if the bio watch doesn't exist
    //       if (lastPlace === -1) {
    //         reject ("This bio watch hasn't been registered: " + device_id);
    //         // for (var i = 0; i < patients_status.length; i++) {
    //         //   if (patients_status[i].inPlace === inPlace) {
    //         //     patients_status[i].devices.push ({device_id: bioWatchId, rssi: rssi, pulse: pulse});          
    //         //     break;
    //         //   }
    //         // }
    //       }  

    //       resolve (patients_status);
    //     });
    //   })
    //   .then ((patients_status) => {
    //     return new Promise ((resolve, reject) => {
    //       this.fs.writeFile (this.PATIENTS_STATUS_FILE_PATH, JSON.stringify(patients_status), (err) => {
    //         if (err) {
    //           throw new Error (err);
    //         }
    //         resolve ();
    //       });
    //     });
    //   });
    // }

    // updateSpace (bioInfo) {
    //   let toConnect = '-1';
    //   return new Promise ((resolve, reject) => {
    //     this.fs.readFile (this.PATIENTS_STATUS_FILE_PATH, (err, data) => {
    //       if (err) {
    //         reject (err);
    //       }

    //       let patients_status = JSON.parse (data);

    //       let place_id = bioInfo.place_id;
    //       let device_id = bioInfo.device_id;
    //       let rssi = bioInfo.rssi;

    //       // find the place of this bio watch
    //       let foundPlace = -1;
    //       for (let i in patients_status) {
    //         let devices = patients_status[i].devices;

    //         for (let j in devices) {
    //           // find the bio watch whether exist
    //           if (devices[j].device_id === device_id) {
    //             foundPlace = i;

    //             // if it doesn't connect yet
    //             if (patients_status[foundPlace].inPlace == 'None') {
    //               toConnect = '1';
    //               //res.send (toConnect);
    //               break;
    //             } 

    //             if (patients_status[foundPlace].inPlace === place_id) {
    //               devices[j].rssi = rssi;
    //               toConnect = '0';
    //             } else {
    //               // to check
    //               if (parseInt (devices[j].rssi) < parseInt (rssi)) {
    //                 toConnect = '1';
    //               } else {
    //                 toConnect = '0';
    //               }
    //             }
    //             //res.send (toConnect);
    //             break;
    //           }
    //         }

    //         if (foundPlace != -1) {
    //           break;
    //         }
    //       }

    //       resolve (patients_status);
    //     });
    //   })
    //   .then ((patients_status) => {
    //     return new Promise ((resolve, reject) => {
    //       this.fs.writeFile (this.PATIENTS_STATUS_FILE_PATH, JSON.stringify(patients_status), (err) => {
    //         if (err) {
    //           reject (err);
    //         }
    //         resolve (toConnect);
    //       });
    //     });
    //   })
    //   .catch ((err) => {
    //     console.log ('Error: ' + err);
    //   })
    // }

    // getBioWatchList () {
    //   return this.bioSignalDatabase.getBioWatchList ()
    //   .catch ((err) => {
    //     console.log ('Error: ' + err);
    //   });
    // }

  }, {
    key: 'getBioSignalsFromBioWatchAtTimePeriod',
    value: function getBioSignalsFromBioWatchAtTimePeriod(device_id, startDateAndTime, endDateAndTime) {
      return this.bioSignalDatabase.getBioSignalsFromBioWatchAtTimePeriod(device_id, startDateAndTime, endDateAndTime).catch(function (err) {
        console.log('Error: ' + err);
      });
    }
  }, {
    key: 'getPatientList',
    value: function getPatientList() {
      return this.patientList;
    }
  }, {
    key: 'getPatientsStatusForJSON',
    value: function getPatientsStatusForJSON() {
      var result = [];

      for (var i in this.placeList) {
        var placeObj = {};
        var place = this.placeList[i];
        var bioWatchList = place.bioWatchList;

        placeObj.placeID = place.placeID;

        var bioWatchListObj = [];
        for (var j in bioWatchList) {
          var bioWatch = bioWatchList[j];
          var bioWatchObj = {};
          bioWatchObj.bioWatchID = bioWatch.bioWatchID;

          var wear = bioWatch.wear;
          var wearObj = {};

          if (wear.patient != null) {
            var patient = wear.patient;
            var patientObj = {};

            patientObj.patientID = patient.patientID;
            patientObj.status = patient.status;
            patientObj.bioSignal = patient.bioSignal;

            wearObj.patient = patientObj;
          }

          bioWatchObj.wear = wearObj;
          bioWatchListObj.push(bioWatchObj);
        }

        placeObj.bioWatchList = bioWatchListObj;

        result.push(placeObj);
      }
      console.log(result);
      return result;
    }
  }, {
    key: 'getPlaceListForJSON',
    value: function getPlaceListForJSON() {
      var result = [];

      for (var i in this.placeList) {
        var placeObj = {};
        placeObj.placeID = this.placeList[i].placeID;
        result.push(placeObj);
      }

      return result;
    }
  }, {
    key: 'getBioWatchListForJSON',
    value: function getBioWatchListForJSON() {
      var result = [];

      for (var i in this.bioWatchList) {
        var bioWatchObj = {};
        bioWatchObj.bioWatchID = this.bioWatchList[i].bioWatchID;
        result.push(bioWatchObj);
      }

      return result;
    }
  }, {
    key: 'removePlace',
    value: function removePlace(placeID) {
      for (var i in this.placeList) {
        if (placeID == this.placeList[i].placeID) {
          this.placeList.splice(i, 1);
          break;
        }
      }
    }
  }, {
    key: 'removeBioWatch',
    value: function removeBioWatch(bioWatchID) {
      for (var i in this.bioWatchList) {
        if (bioWatchID == this.bioWatchList[i].bioWatchID) {
          this.bioWatchList.splice(i, 1);
          break;
        }
      }
    }
  }, {
    key: 'newPlace',
    value: function newPlace(placeID) {
      for (var i in this.placeList) {
        if (placeID == this.placeList[i].placeID) {
          return;
        }
      }

      this.placeList.push(new Place(placeID));
      this.bioSignalDatabase.insertPlace(placeID);
    }
  }, {
    key: 'newBioWatch',
    value: function newBioWatch(bioWatchID) {
      for (var i in this.bioWatchList) {
        if (bioWatchID == this.bioWatchList[i].bioWatchID) {
          return;
        }
      }

      this.bioWatchList.push(new BioWatch(bioWatchID));
      this.bioSignalDatabase.insertBioWatch(bioWatchID);
    }
  }]);

  return BioWatchManager;
}();

// var BioWatchManager = function () {
//   var path = require ('path');
//   this.fs = require ('fs');
//   this.CRITERIA_SETTINGS_FILE_PATH = path.join (__dirname, 'criteria_settings.json');
//   this.PATIENTS_STATUS_FILE_PATH = path.join (__dirname, 'patients_status.json');
//   this.DATABASE_FILE_NAME = 'bioSignalDatabase.db';
//   this.DATABASE_FILE_PATH = path.join (__dirname, this.DATABASE_FILE_NAME);
//   this.bioWatchList = [];
//   this.bioSignalDatabase = new (require ('./BioSignalDatabase')) (this.DATABASE_FILE_NAME);
// }

// BioWatchManager.prototype = {
//   init: function () {
//     return new Promise (function (resolve, reject) {
//       // if (autoReset == true) {
//       //   resolve (defaults);
//       // } else {
//       //   if (database file) {
//       //     resolve ();
//       //   } else
//       //     resolve (data);
//       // }
//       // .then (function (data) {
//       //   if (data) {
//       //     remove database
//       //     and init database
//       //       input default setting
//       //     write patients_status
//       //   } else {
//       //     init database 
//       //     get the last database data into patients_status
//       //   }
//       // })
//       this.fs.readFile (this.CRITERIA_SETTINGS_FILE_PATH, function (err, data) {
//         if (err) {
//           reject (err);
//         }

//         resolve (data);
//       });
//     }.bind (this))
//     .then (function (data) {
//       data = JSON.parse (data);
//       var autoReset = data.autoReset;

//       if (autoReset === true) {
//         console.log ('autoReset == true');
//         return Promise.resolve ().then (function () {
//           return data.default_settings;
//         });
//       } else {
//         console.log ('autoReset == false');
//         return new Promise (function (resolve, reject) {
//           this.fs.access (this.DATABASE_FILE_PATH, this.fs.F_OK, function (err) {
//             if (err == null) {
//               // db exist
//               resolve ();
//             } else {
//               resolve (data.default_settings);
//             }
//           });
//         }.bind (this))
//         .then (function (defaultSettings) {
//           return defaultSettings;
//         });
//       }
//     }.bind (this))
//     .then (function (defaultSettings) {
//       if (defaultSettings) {
//         console.log ('db file does not exist');
//         Promise.resolve ().then (function () {
//           return this.bioSignalDatabase.destroy ();
//         }.bind (this))
//         .then (function () {
//           return this.bioSignalDatabase.init ();
//         }.bind (this))
//         .then (function () {
//           var rooms = defaultSettings.rooms;
//           var bioWatches = defaultSettings.bioWatches;

//           rooms.forEach (function (room) {
//             this.bioSignalDatabase.insertPlace (room);
//           }.bind (this));

//           bioWatches.forEach (function (bioWatch) {
//             this.bioSignalDatabase.insertBioWatch (bioWatch);
//           }.bind (this));

//           var initial_status = [];

//           for (var i = 0; i < rooms.length; i++) {
//             initial_status.push ({inPlace: rooms[i], devices: []});
//           }

//           var None = {inPlace: 'None', devices: []};
//           for (var i = 0; i < bioWatches.length; i++) {
//             var bioWatch = bioWatches[i];
//             None.devices.push ({device_id: bioWatch, rssi: 0, pulse: 0});
//           }

//           initial_status.push (None);
//           return new Promise (function (resolve, reject) {
//             this.fs.writeFile (this.PATIENTS_STATUS_FILE_PATH, JSON.stringify(initial_status), function(err) {
//               if (err) {
//                 reject (err);
//               }
//               resolve ();
//             });
//           }.bind (this));


//         }.bind (this));


//       } else {
//         console.log ('db file does exist');
//         var initial_status = [];

//         return this.bioSignalDatabase.init ()
//         .then (function () {
//           return this.bioSignalDatabase.getPlaceList ();
//         }.bind (this))
//         .then (function (placeList) {
//           for (var id in placeList) {
//             initial_status.push ({inPlace: placeList[id], devices: []});
//           }
//         }.bind (this))
//         .then (function () {
//           return this.bioSignalDatabase.getBioWatchList ();
//         }.bind (this))
//         .then (function (bioWatchList) {
//           var None = {inPlace: 'None', devices: []};
//           for (var id in bioWatchList) {
//             None.devices.push ({device_id: bioWatchList[id], pulse: 0, rssi: 0, dateAndTime: 0});
//           }

//           initial_status.push (None);

//           var promiseArray = [];

//           for (var id in bioWatchList) {
//             promiseArray.push (this.bioSignalDatabase.getBioSignalsFromBioWatch (bioWatchList[id]));
//           }

//           return Promise.all (promiseArray);

//             // return initial_status;

//         }.bind (this))
//         .then (function (bioSignalsArray) {
//           bioSignalsArray.forEach (function (bioSignals) {
//             var theLatestBioSignal = bioSignals[0];
//             if (theLatestBioSignal) {
//               var device_id = theLatestBioSignal.device_id;
//               var place_id = theLatestBioSignal.place_id;
//               var pulse = theLatestBioSignal.pulse;
//               var rssi = theLatestBioSignal.rssi;
//               var dateAndTime = theLatestBioSignal.dateAndTime;

//               var noneDeviceList = initial_status[initial_status.length - 1];

//               for (var place in initial_status) {
//                 if (initial_status[place].inPlace === 'None') {
//                   noneDeviceList = initial_status[place].devices;
//                   break;
//                 }
//               }

//               for (var i = 0; i < noneDeviceList.length; i++) {
//                 if (noneDeviceList[i].device_id === device_id) {
//                   noneDeviceList.splice (i, 1);

//                   for (var place in initial_status) {
//                     if (initial_status[place].inPlace === place_id) {
//                       initial_status[place].devices.push (
//                         {
//                           device_id: device_id, 
//                           pulse: pulse, 
//                           rssi: rssi, 
//                           dateAndTime: dateAndTime
//                         }
//                       );
//                       break;
//                     }
//                   }
//                   break;
//                 }
//               } 
//             }

//           });

//           return initial_status;
//         })
//         .then (function (initial_status) {
//           return new Promise (function (resolve, reject) {
//             this.fs.writeFile (this.PATIENTS_STATUS_FILE_PATH, JSON.stringify (initial_status), function (err) {
//               if (err) {
//                 reject (err);
//               }

//               resolve();
//             });
//           }.bind (this));
//         }.bind (this));
//       }
//     }.bind (this))
//     .catch (function (err) {
//       console.log (err);
//     });
//     // it needs some feature of checking connection
//   },

//   newPlace: function (inPlace) {
//     return this.bioSignalDatabase.insertPlace (inPlace)
//     .catch (function (err) {
//       console.log ('Error: newPlace (' + inPlace + ') ' + err);
//     });
//   },

//   newBioWatch: function (bioWatchId) {
//     return this.bioSignalDatabase.insertBioWatch (bioWatchId)
//     .catch (function (err) {
//       console.log ('Error: newBioWatch (' + bioWatchId + ') ' + err);
//     });
//   },

//   inputBioSignal: function (bioInfo) {
//     var device_id = bioInfo.device_id;
//     var place_id = bioInfo.place_id;
//     var pulse = bioInfo.pulse;
//     var rssi = bioInfo.rssi;
//     var dateAndTime = bioInfo.dateAndTime;

//     return this.bioSignalDatabase.insertBioSignal (device_id, place_id, pulse, rssi, dateAndTime)
//     .then (function () {
//       return this.updateStatus (bioInfo);
//     }.bind (this)) 
//     .catch (function (err) {
//       console.log ('Error: inputBiosignal (' + bioInfo + ') ' + err);
//     });
//   },

//   updateStatus: function (bioInfo) {
//     return new Promise (function (resolve, reject) {
//       this.fs.readFile (this.PATIENTS_STATUS_FILE_PATH, function (err, data) {
//         if (err) {
//           reject (err);
//         }

//         var patients_status = JSON.parse (data);

//         var device_id = bioInfo.device_id;
//         var place_id = bioInfo.place_id;
//         var pulse = bioInfo.pulse;
//         var rssi = bioInfo.rssi;
//         var dateAndTime = bioInfo.dateAndTime;

//         // find the place of this bio watch
//         var lastPlace = -1;

//         for (var i in patients_status) {
//           var devices = patients_status[i].devices;
//           for (var j in devices) { 
//             // find the bio watch whether exist
//             if (devices[j].device_id === device_id) {
//               lastPlace = i;
//               // in the same place
//               if (patients_status[lastPlace].inPlace === place_id) {
//                 devices[j].pulse = pulse;
//                 devices[j].rssi = rssi;
//                 devices[j].dateAndTime = dateAndTime;
//               } else {
//                 // remove the last place of the bio watch
//                 devices.splice (j,1);

//                 // change place
//                 for (var k = 0; k < patients_status.length; k++) {
//                   if (patients_status[k].inPlace === place_id) {
//                     patients_status[k].devices.push ({device_id: device_id, pulse: pulse, rssi: rssi, dateAndTime: dateAndTime});
//                     break;
//                   }
//                 }
//               }
//               break;
//             }
//           }

//           if (lastPlace != -1) {
//             break;
//           }
//         }

//         // if the bio watch doesn't exist
//         if (lastPlace === -1) {
//           reject ("This bio watch hasn't been registered: " + device_id);
//           // for (var i = 0; i < patients_status.length; i++) {
//           //   if (patients_status[i].inPlace === inPlace) {
//           //     patients_status[i].devices.push ({device_id: bioWatchId, rssi: rssi, pulse: pulse});          
//           //     break;
//           //   }
//           // }
//         }  

//         resolve (patients_status);
//       });
//     }.bind (this))
//     .then (function (patients_status) {
//       return new Promise (function (resolve, reject) {
//         this.fs.writeFile (this.PATIENTS_STATUS_FILE_PATH, JSON.stringify(patients_status), function(err) {
//           if (err) {
//             throw new Error (err);
//           }
//           resolve ();
//         });
//       }.bind (this));
//     }.bind (this));
//   },

//   updateSpace: function (bioInfo) {
//     var toConnect = '-1';
//     return new Promise (function (resolve, reject) {
//       this.fs.readFile (this.PATIENTS_STATUS_FILE_PATH, function (err, data) {
//         if (err) {
//           reject (err);
//         }

//         var patients_status = JSON.parse (data);

//         var place_id = bioInfo.place_id;
//         var device_id = bioInfo.device_id;
//         var rssi = bioInfo.rssi;

//         // find the place of this bio watch
//         var foundPlace = -1;
//         for (var i in patients_status) {
//           var devices = patients_status[i].devices;

//           for (var j in devices) {
//             // find the bio watch whether exist
//             if (devices[j].device_id === device_id) {
//               foundPlace = i;

//               // if it doesn't connect yet
//               if (patients_status[foundPlace].inPlace == 'None') {
//                 toConnect = '1';
//                 //res.send (toConnect);
//                 break;
//               } 

//               if (patients_status[foundPlace].inPlace === place_id) {
//                 devices[j].rssi = rssi;
//                 toConnect = '0';
//               } else {
//                 // to check
//                 if (parseInt(devices[j].rssi) < parseInt(rssi)) {
//                   toConnect = '1';
//                 } else {
//                   toConnect = '0';
//                 }
//               }
//               //res.send (toConnect);
//               break;
//             }
//           }

//           if (foundPlace != -1) {
//             break;
//           }
//         }

//         resolve (patients_status);
//       });
//     }.bind (this))
//     .then (function (patients_status) {
//       return new Promise (function (resolve, reject) {
//         this.fs.writeFile (this.PATIENTS_STATUS_FILE_PATH, JSON.stringify(patients_status), function(err) {
//           if (err) {
//             reject (err);
//           }
//           resolve (toConnect);
//         });
//       }.bind (this));
//     }.bind (this))
//     .catch (function (err) {
//       console.log ('Error: ' + err);
//     })
//   }, 

//   getBioWatchList: function () {
//     return this.bioSignalDatabase.getBioWatchList ()
//     .catch (function (err) {
//       console.log ('Error: ' + err);
//     });
//   }
// };	

module.exports = new BioWatchManager();