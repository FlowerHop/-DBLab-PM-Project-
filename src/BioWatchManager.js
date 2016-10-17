// Main Control from Server to BioSignalDatabase
// maintain criteria setting, patients status and operation of the BioSignalDatabase
class BioWatchManager {
  constructor () {
    var path = require ('path');
    this.fs = require ('fs');
    this.CRITERIA_SETTINGS_FILE_PATH = path.join (__dirname, 'criteria_settings.json');
    this.PATIENTS_STATUS_FILE_PATH = path.join (__dirname, 'patients_status.json');
    this.DATABASE_FILE_NAME = 'bioSignalDatabase.db';
    this.DATABASE_FILE_PATH = path.join (__dirname, this.DATABASE_FILE_NAME);
    this.bioWatchList = [];
    this.bioSignalDatabase = new (require ('./BioSignalDatabase')) (this.DATABASE_FILE_NAME);
  }
  init () {
    return new Promise ((resolve, reject) => {
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
      this.fs.readFile (this.CRITERIA_SETTINGS_FILE_PATH, (err, data) => {
        if (err) {
          reject (err);
        }

        resolve (data);
      });
    })
    .then ((data) => {
      data = JSON.parse (data);
      var autoReset = data.autoReset;

      if (autoReset === true) {
        console.log ('autoReset == true');
        return Promise.resolve ()
        .then (() => {
          return data.default_settings;
        });
      } else {
        console.log ('autoReset == false');
        return new Promise ((resolve, reject) => {
          this.fs.access (this.DATABASE_FILE_PATH, this.fs.F_OK, (err) => {
            if (err == null) {
              // db exist
              resolve ();
            } else {
              resolve (data.default_settings);
            }
          });
        })
        .then ((defaultSettings) => {
          return defaultSettings;
        });
      }
    })
    .then ((defaultSettings) => {
      if (defaultSettings) {
        console.log ('db file does not exist');
        Promise.resolve ()
        .then (() => {
          return this.bioSignalDatabase.destroy ();
        })
        .then (() => {
          return this.bioSignalDatabase.init ();
        })
        .then (() => {
          let rooms = defaultSettings.rooms;
          let bioWatches = defaultSettings.bioWatches;
    
          rooms.forEach ((room) => {
            this.bioSignalDatabase.insertPlace (room);
          });

          bioWatches.forEach ((bioWatch) => {
            this.bioSignalDatabase.insertBioWatch (bioWatch);
          });

          let initial_status = [];

          for (let i = 0; i < rooms.length; i++) {
            initial_status.push ({inPlace: rooms[i], devices: []});
          }
      
          let None = {inPlace: 'None', devices: []};
          for (let i = 0; i < bioWatches.length; i++) {
            let bioWatch = bioWatches[i];
            None.devices.push ({device_id: bioWatch, rssi: 0, pulse: 0});
          }
      
          initial_status.push (None);
          return new Promise ((resolve, reject) => {
            this.fs.writeFile (this.PATIENTS_STATUS_FILE_PATH, JSON.stringify(initial_status), (err) => {
              if (err) {
                reject (err);
              }
              resolve ();
            });
          });
        });
      } else {
        console.log ('db file does exist');
        let initial_status = [];

        return this.bioSignalDatabase.init ()
        .then (() => {
          return this.bioSignalDatabase.getPlaceList ();
        })
        .then ((placeList) => {
          for (let id in placeList) {
            initial_status.push ({inPlace: placeList[id], devices: []});
          }
        })
        .then (() => {
          return this.bioSignalDatabase.getBioWatchList ();
        })
        .then ((bioWatchList) => {
          let None = {inPlace: 'None', devices: []};
          for (let id in bioWatchList) {
            None.devices.push ({device_id: bioWatchList[id], pulse: 0, rssi: 0, dateAndTime: 0});
          }

          initial_status.push (None);

          let promiseArray = [];

          for (let id in bioWatchList) {
            promiseArray.push (this.bioSignalDatabase.getBioSignalsFromBioWatch (bioWatchList[id]));
          }

          return Promise.all (promiseArray);

            // return initial_status;
    
        })
        .then ((bioSignalsArray) => {
          bioSignalsArray.forEach ((bioSignals) => {
            let theLatestBioSignal = bioSignals[0];
            if (theLatestBioSignal) {
              let device_id = theLatestBioSignal.device_id;
              let place_id = theLatestBioSignal.place_id;
              let pulse = theLatestBioSignal.pulse;
              let rssi = theLatestBioSignal.rssi;
              let dateAndTime = theLatestBioSignal.dateAndTime;
       
              let noneDeviceList = initial_status[initial_status.length - 1];
       
              for (let place in initial_status) {
                if (initial_status[place].inPlace === 'None') {
                  noneDeviceList = initial_status[place].devices;
                  break;
                }
              }
       
              for (let i = 0; i < noneDeviceList.length; i++) {
                if (noneDeviceList[i].device_id === device_id) {
                  noneDeviceList.splice (i, 1);
      
                  for (let place in initial_status) {
                    if (initial_status[place].inPlace === place_id) {
                      initial_status[place].devices.push (
                        {
                          device_id: device_id, 
                          pulse: pulse, 
                          rssi: rssi, 
                          dateAndTime: dateAndTime
                        }
                      );
                      break;
                    }
                  }
                  break;
                }
              } 
            }
            
          });

          return initial_status;
        })
        .then ((initial_status) => {
          return new Promise ((resolve, reject) => {
            this.fs.writeFile (this.PATIENTS_STATUS_FILE_PATH, JSON.stringify (initial_status), (err) => {
              if (err) {
                reject (err);
              }

              resolve();
            });
          });
        });
      }
    })
    .catch ((err) => {
      console.log (err);
    });
    // it needs some feature of checking connection
  }

  newPlace (inPlace) {
    return this.bioSignalDatabase.insertPlace (inPlace)
    .catch ((err) => {
      console.log ('Error: newPlace (' + inPlace + ') ' + err);
    });
  }

  newBioWatch (bioWatchId) {
    return this.bioSignalDatabase.insertBioWatch (bioWatchId)
    .catch ((err) => {
      console.log ('Error: newBioWatch (' + bioWatchId + ') ' + err);
    });
  }

  inputBioSignal (bioInfo) {
    var device_id = bioInfo.device_id;
    var place_id = bioInfo.place_id;
    var pulse = bioInfo.pulse;
    var rssi = bioInfo.rssi;
    var dateAndTime = bioInfo.dateAndTime;
    
    return this.bioSignalDatabase.insertBioSignal (device_id, place_id, pulse, rssi, dateAndTime)
    .then (() => {
      return this.updateStatus (bioInfo);
    }) 
    .catch ((err) => {
      console.log ('Error: inputBiosignal (' + bioInfo + ') ' + err);
    });
  }

  updateStatus (bioInfo) {
    return new Promise ((resolve, reject) => {
      this.fs.readFile (this.PATIENTS_STATUS_FILE_PATH, (err, data) => {
        if (err) {
          reject (err);
        }

        let patients_status = JSON.parse (data);

        let device_id = bioInfo.device_id;
        let place_id = bioInfo.place_id;
        let pulse = bioInfo.pulse;
        let rssi = bioInfo.rssi;
        let dateAndTime = bioInfo.dateAndTime;
  
        // find the place of this bio watch
        let lastPlace = -1;
  
        for (let i in patients_status) {
          let devices = patients_status[i].devices;
          for (let j in devices) { 
            // find the bio watch whether exist
            if (devices[j].device_id === device_id) {
              lastPlace = i;
              // in the same place
              if (patients_status[lastPlace].inPlace === place_id) {
                devices[j].pulse = pulse;
                devices[j].rssi = rssi;
                devices[j].dateAndTime = dateAndTime;
              } else {
                // remove the last place of the bio watch
                devices.splice (j,1);
                
                // change place
                for (let k = 0; k < patients_status.length; k++) {
                  if (patients_status[k].inPlace === place_id) {
                    patients_status[k].devices.push ({device_id: device_id, pulse: pulse, rssi: rssi, dateAndTime: dateAndTime});
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
          reject ("This bio watch hasn't been registered: " + device_id);
          // for (var i = 0; i < patients_status.length; i++) {
          //   if (patients_status[i].inPlace === inPlace) {
          //     patients_status[i].devices.push ({device_id: bioWatchId, rssi: rssi, pulse: pulse});          
          //     break;
          //   }
          // }
        }  
        
        resolve (patients_status);
      });
    })
    .then ((patients_status) => {
      return new Promise ((resolve, reject) => {
        this.fs.writeFile (this.PATIENTS_STATUS_FILE_PATH, JSON.stringify(patients_status), (err) => {
          if (err) {
            throw new Error (err);
          }
          resolve ();
        });
      });
    });
  }

  updateSpace (bioInfo) {
    let toConnect = '-1';
    return new Promise ((resolve, reject) => {
      this.fs.readFile (this.PATIENTS_STATUS_FILE_PATH, (err, data) => {
        if (err) {
          reject (err);
        }
        
        let patients_status = JSON.parse (data);
     
        let place_id = bioInfo.place_id;
        let device_id = bioInfo.device_id;
        let rssi = bioInfo.rssi;
        
        // find the place of this bio watch
        let foundPlace = -1;
        for (let i in patients_status) {
          let devices = patients_status[i].devices;
    
          for (let j in devices) {
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
                if (parseInt (devices[j].rssi) < parseInt (rssi)) {
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
    
        resolve (patients_status);
      });
    })
    .then ((patients_status) => {
      return new Promise ((resolve, reject) => {
        this.fs.writeFile (this.PATIENTS_STATUS_FILE_PATH, JSON.stringify(patients_status), (err) => {
          if (err) {
            reject (err);
          }
          resolve (toConnect);
        });
      });
    })
    .catch ((err) => {
      console.log ('Error: ' + err);
    })
  }

  getBioWatchList () {
    return this.bioSignalDatabase.getBioWatchList ()
    .catch ((err) => {
      console.log ('Error: ' + err);
    });
  }
}


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

module.exports = new BioWatchManager ();
  
