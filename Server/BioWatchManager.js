'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Main Control from Server to BioSignalDatabase
// maintain criteria setting, patients status and operation of the BioSignalDatabase
var Patient = require('./Patient');

var BioWatchManager = function () {
  function BioWatchManager() {
    _classCallCheck(this, BioWatchManager);

    var path = require('path');
    this.fs = require('fs');
    this.CRITERIA_SETTINGS_FILE_PATH = path.join(__dirname, 'criteria_settings.json');
    this.PATIENTS_STATUS_FILE_PATH = path.join(__dirname, 'patients_status.json');
    this.DATABASE_FILE_NAME = 'bioSignalDatabase.db';
    this.DATABASE_FILE_PATH = path.join(__dirname, this.DATABASE_FILE_NAME);
    this.bioWatchList = [];
    this.bioSignalDatabase = new (require('./BioSignalDatabase'))(this.DATABASE_FILE_NAME);
    this.patients = [];
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
          return new Promise(function (resolve, reject) {
            _this.fs.access(_this.DATABASE_FILE_PATH, _this.fs.F_OK, function (err) {
              if (err == null) {
                // db exist
                resolve();
              } else {
                resolve(data.default_settings);
              }
            });
          }).then(function (defaultSettings) {
            return defaultSettings;
          });
        }
      }).then(function (defaultSettings) {
        if (defaultSettings) {
          console.log('db file does not exist');

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
            var rooms = defaultSettings.rooms;
            var bioWatches = defaultSettings.bioWatches;

            rooms.forEach(function (room) {
              _this.bioSignalDatabase.insertPlace(room);
            });

            bioWatches.forEach(function (bioWatch) {
              _this.bioSignalDatabase.insertBioWatch(bioWatch);
            });

            var initial_status = [];

            for (var i = 0; i < rooms.length; i++) {
              initial_status.push({ inPlace: rooms[i], devices: [] });
            }

            var None = { inPlace: 'None', devices: [] };
            for (var _i = 0; _i < bioWatches.length; _i++) {
              var bioWatch = bioWatches[_i];
              None.devices.push({ device_id: bioWatch, rssi: 0, pulse: 0 });
            }

            for (var _i2 = 0; _i2 < bioWatches.length; _i2++) {
              var _bioWatch = bioWatches[_i2];
              _this.patients.push(new Patient(_bioWatch, _bioWatch));
            }

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
            console.log('db file does exist');
            var initial_status = [];

            return {
              v: _this.bioSignalDatabase.init().then(function () {
                return _this.bioSignalDatabase.getPlaceList();
              }).then(function (placeList) {
                for (var id in placeList) {
                  initial_status.push({ inPlace: placeList[id], devices: [] });
                }
              }).then(function () {
                return _this.bioSignalDatabase.getBioWatchList();
              }).then(function (bioWatchList) {
                var None = { inPlace: 'None', devices: [] };
                for (var id in bioWatchList) {
                  None.devices.push({ device_id: bioWatchList[id], pulse: 0, rssi: 0, dateAndTime: 0 });
                }

                for (var _id in bioWatchList) {
                  _this.patients.push(new Patient(bioWatchList[_id], bioWatchList[_id]));
                }

                initial_status.push(None);

                var promiseArray = [];

                for (var _id2 in bioWatchList) {
                  promiseArray.push(_this.bioSignalDatabase.getBioSignalsFromBioWatch(bioWatchList[_id2]));
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
                    var dateAndTime = theLatestBioSignal.dateAndTime;

                    var noneDeviceList = initial_status[initial_status.length - 1];

                    for (var place in initial_status) {
                      if (initial_status[place].inPlace === 'None') {
                        noneDeviceList = initial_status[place].devices;
                        break;
                      }
                    }

                    for (var i = 0; i < noneDeviceList.length; i++) {
                      if (noneDeviceList[i].device_id === device_id) {
                        noneDeviceList.splice(i, 1);

                        for (var _place in initial_status) {
                          if (initial_status[_place].inPlace === place_id) {
                            initial_status[_place].devices.push({
                              device_id: device_id,
                              pulse: pulse,
                              rssi: rssi,
                              dateAndTime: dateAndTime
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
                    console.log('write');
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
      return this.bioSignalDatabase.insertPlace(inPlace).catch(function (err) {
        console.log('Error: newPlace (' + inPlace + ') ' + err);
      });
    }
  }, {
    key: 'newBioWatch',
    value: function newBioWatch(bioWatchId) {
      return this.bioSignalDatabase.insertBioWatch(bioWatchId).catch(function (err) {
        console.log('Error: newBioWatch (' + bioWatchId + ') ' + err);
      });
    }
  }, {
    key: 'inputBioSignal',
    value: function inputBioSignal(bioInfo) {
      var _this2 = this;

      var device_id = bioInfo.device_id;
      var place_id = bioInfo.place_id;
      var pulse = bioInfo.pulse;
      var rssi = bioInfo.rssi;
      var dateAndTime = bioInfo.dateAndTime;

      return this.bioSignalDatabase.insertBioSignal(device_id, place_id, pulse, rssi, dateAndTime).then(function () {
        return _this2.updateStatus(bioInfo);
      }).catch(function (err) {
        console.log('Error: inputBiosignal (' + bioInfo + ') ' + err);
      });
    }
  }, {
    key: 'updateStatus',
    value: function updateStatus(bioInfo) {
      var _this3 = this;

      for (var i in patients) {
        var patient = patients[i];
        if (patient.getBioWatchID == bioInfo.device_id) {
          patient.inputPulse(bioInfo.pulse, bioInfo.dateAndTime);
          break;
        }
      }
      return new Promise(function (resolve, reject) {
        _this3.fs.readFile(_this3.PATIENTS_STATUS_FILE_PATH, function (err, data) {
          if (err) {
            reject(err);
          }

          var patients_status = JSON.parse(data);

          var device_id = bioInfo.device_id;
          var place_id = bioInfo.place_id;
          var pulse = bioInfo.pulse;
          var rssi = bioInfo.rssi;
          var dateAndTime = bioInfo.dateAndTime;

          // find the place of this bio watch
          var lastPlace = -1;

          for (var _i3 in patients_status) {
            var devices = patients_status[_i3].devices;
            for (var j in devices) {
              // find the bio watch whether exist
              if (devices[j].device_id === device_id) {
                lastPlace = _i3;
                // in the same place
                if (patients_status[lastPlace].inPlace === place_id) {
                  devices[j].pulse = pulse;
                  devices[j].rssi = rssi;
                  devices[j].dateAndTime = dateAndTime;
                } else {
                  // remove the last place of the bio watch
                  devices.splice(j, 1);

                  // change place
                  for (var k = 0; k < patients_status.length; k++) {
                    if (patients_status[k].inPlace === place_id) {
                      patients_status[k].devices.push({ device_id: device_id, pulse: pulse, rssi: rssi, dateAndTime: dateAndTime });
                      break;
                    }
                  }
                }
                break;
              }
            }

            if (lastPlace != -1) {
              break;
            }
          }

          // if the bio watch doesn't exist
          if (lastPlace === -1) {
            reject("This bio watch hasn't been registered: " + device_id);
            // for (var i = 0; i < patients_status.length; i++) {
            //   if (patients_status[i].inPlace === inPlace) {
            //     patients_status[i].devices.push ({device_id: bioWatchId, rssi: rssi, pulse: pulse});          
            //     break;
            //   }
            // }
          }

          resolve(patients_status);
        });
      }).then(function (patients_status) {
        return new Promise(function (resolve, reject) {
          _this3.fs.writeFile(_this3.PATIENTS_STATUS_FILE_PATH, JSON.stringify(patients_status), function (err) {
            if (err) {
              throw new Error(err);
            }
            resolve();
          });
        });
      });
    }
  }, {
    key: 'updateSpace',
    value: function updateSpace(bioInfo) {
      var _this4 = this;

      var toConnect = '-1';
      return new Promise(function (resolve, reject) {
        _this4.fs.readFile(_this4.PATIENTS_STATUS_FILE_PATH, function (err, data) {
          if (err) {
            reject(err);
          }

          var patients_status = JSON.parse(data);

          var place_id = bioInfo.place_id;
          var device_id = bioInfo.device_id;
          var rssi = bioInfo.rssi;

          // find the place of this bio watch
          var foundPlace = -1;
          for (var i in patients_status) {
            var devices = patients_status[i].devices;

            for (var j in devices) {
              // find the bio watch whether exist
              if (devices[j].device_id === device_id) {
                foundPlace = i;

                // if it doesn't connect yet
                if (patients_status[foundPlace].inPlace == 'None') {
                  toConnect = '1';
                  //res.send (toConnect);
                  break;
                }

                if (patients_status[foundPlace].inPlace === place_id) {
                  devices[j].rssi = rssi;
                  toConnect = '0';
                } else {
                  // to check
                  if (parseInt(devices[j].rssi) < parseInt(rssi)) {
                    toConnect = '1';
                  } else {
                    toConnect = '0';
                  }
                }
                //res.send (toConnect);
                break;
              }
            }

            if (foundPlace != -1) {
              break;
            }
          }

          resolve(patients_status);
        });
      }).then(function (patients_status) {
        return new Promise(function (resolve, reject) {
          _this4.fs.writeFile(_this4.PATIENTS_STATUS_FILE_PATH, JSON.stringify(patients_status), function (err) {
            if (err) {
              reject(err);
            }
            resolve(toConnect);
          });
        });
      }).catch(function (err) {
        console.log('Error: ' + err);
      });
    }
  }, {
    key: 'getBioWatchList',
    value: function getBioWatchList() {
      return this.bioSignalDatabase.getBioWatchList().catch(function (err) {
        console.log('Error: ' + err);
      });
    }
  }, {
    key: 'getBioSignalsFromBioWatchAtTimePeriod',
    value: function getBioSignalsFromBioWatchAtTimePeriod(device_id, startDateAndTime, endDateAndTime) {
      return this.bioSignalDatabase.getBioSignalsFromBioWatchAtTimePeriod(device_id, startDateAndTime, endDateAndTime).catch(function (err) {
        console.log('Error: ' + err);
      });
    }
  }, {
    key: 'getPatients',
    value: function getPatients() {
      return this.patients;
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