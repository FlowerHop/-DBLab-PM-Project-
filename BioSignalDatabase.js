'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require('fs');
var path = require('path');

var BioSignalDatabase = function () {
  function BioSignalDatabase(fileName) {
    _classCallCheck(this, BioSignalDatabase);

    this.fileName = fileName;
  }

  _createClass(BioSignalDatabase, [{
    key: 'init',
    value: function init(fileName) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        if (fileName != undefined) {
          _this.fileName = fileName;
        }

        _this.db = new (require('sqlite3').verbose().Database)(_this.fileName);

        _this.placeTable = "Place";
        _this.bioWatchTable = "BioWatch";
        _this.bioWatchInPlaceTable = "BioWatchInPlace";

        _this.db.serialize(function () {
          _this.db.run("CREATE TABLE IF NOT EXISTS " + _this.placeTable + "(place_id TEXT PRIMARY KEY)");

          _this.db.run("CREATE TABLE IF NOT EXISTS " + _this.bioWatchTable + "(device_id TEXT PRIMARY KEY)");

          _this.db.run("CREATE TABLE IF NOT EXISTS " + _this.bioWatchInPlaceTable + "(in_id INTEGER PRIMARY KEY AUTOINCREMENT, device_id TEXT NOT NULL, place_id TEXT NOT NULL, pulse INTEGER NOT NULL, rssi INTEGER NOT NULL, dateAndTime INTEGER NOT NULL)", function () {
            resolve();
          });
        });
      });
    }
  }, {
    key: 'insertPlace',
    value: function insertPlace(place_id) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.db.run("INSERT INTO " + _this2.placeTable + " (place_id) VALUES (?)", place_id, function (err) {
          if (err) {
            reject(err);
          }
          resolve();
        });
      });
    }
  }, {
    key: 'insertBioWatch',
    value: function insertBioWatch(device_id) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3.db.run("INSERT INTO " + _this3.bioWatchTable + " (device_id) VALUES (?)", device_id, function (err) {
          if (err) {
            reject(err);
          }
          resolve();
        });
      });
    }
  }, {
    key: 'insertBioSignal',
    value: function insertBioSignal(device_id, inPlace, pulse, rssi, dateAndTime) {
      var _this4 = this;

      // check if the bio watch and place has been registered
      return this.getPlace(inPlace).then(function (data) {
        if (data == undefined) {
          throw new Error('no this place');
        }

        return data;
      }).then(function (inPlace) {
        return _this4.getBioWatch(device_id).then(function (data) {
          if (data == undefined) {
            throw new Error('no this bio watch');
          }

          return data;
        }).then(function (device_id) {
          _this4.db.run("INSERT INTO " + _this4.bioWatchInPlaceTable + " (device_id, place_id, pulse, rssi, dateAndTime) VALUES (?, ?, ?, ?, ?)", [device_id, inPlace, pulse, rssi, dateAndTime], function (err) {
            if (err) {
              throw new Error(err);
            }
          });

          return [inPlace, device_id];
        });
      });
    }
  }, {
    key: 'getPlace',
    value: function getPlace(place_id) {
      var _this5 = this;

      return new Promise(function (resolve, reject) {
        _this5.db.all("SELECT place_id FROM " + _this5.placeTable + " WHERE place_id = ?", [place_id], function (err, rows) {
          if (err) {
            reject(err);
          }

          resolve(rows[0].place_id);
        });
      });
    }
  }, {
    key: 'getPlaceList',
    value: function getPlaceList() {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        var placeList = [];

        _this6.db.all("SELECT * FROM " + _this6.placeTable, function (err, rows) {
          if (err) {
            reject(err);
          }

          rows.forEach(function (row) {
            placeList.push(row.place_id);
          });

          resolve(placeList);
        });
      });
    }
  }, {
    key: 'getBioWatch',
    value: function getBioWatch(device_id) {
      var _this7 = this;

      return new Promise(function (resolve, reject) {
        _this7.db.all("SELECT device_id FROM " + _this7.bioWatchTable + " WHERE device_id = ?", [device_id], function (err, rows) {
          if (err) {
            reject(err);
          }

          resolve(rows[0].device_id);
        });
      });
    }
  }, {
    key: 'getBioWatchList',
    value: function getBioWatchList() {
      var _this8 = this;

      return new Promise(function (resolve, reject) {
        var bioWatchList = [];

        _this8.db.all("SELECT * FROM " + _this8.bioWatchTable, function (err, rows) {
          if (err) {
            reject(err);
          }

          rows.forEach(function (row) {
            bioWatchList.push(row.device_id);
          });

          resolve(bioWatchList);
        });
      });
    }
  }, {
    key: 'getBioSignalAtTime',
    value: function getBioSignalAtTime(device_id, dateAndTime) {
      var _this9 = this;

      return new Promise(function (resolve, reject) {
        _this9.db.all("SELECT place_id, pulse, rssi FROM " + _this9.bioWatchInPlaceTable + " WHERE device_id = ? AND dateAndTime = ?", [device_id, dateAndTime], function (err, rows) {
          if (err) {
            reject(err);
          }

          resolve({ place_id: rows[0].place_id, pulse: rows[0].pulse, rssi: rows[0].rssi });
        });
      });
    }

    // return ordered list

  }, {
    key: 'getBioSignalsFromBioWatch',
    value: function getBioSignalsFromBioWatch(device_id) {
      var _this10 = this;

      return new Promise(function (resolve, reject) {
        var bioSignals = [];

        _this10.db.all("SELECT device_id, place_id, pulse, rssi, dateAndTime FROM " + _this10.bioWatchInPlaceTable + " WHERE device_id = ? ORDER BY dateAndTime DESC", [device_id], function (err, rows) {
          if (err) {
            reject(err);
          }

          rows.forEach(function (row) {
            bioSignals.push(row);
          });

          resolve(bioSignals);
        });
      });
    }
  }, {
    key: 'getBioSignalsInPlace',
    value: function getBioSignalsInPlace(inPlace) {
      var _this11 = this;

      return new Promise(function (resolve, reject) {
        var bioSignals = [];
        _this11.db.all("SELECT device_id, pulse, rssi, dateAndTime FROM " + _this11.bioWatchInPlaceTable + " WHERE place_id = ?", [inPlace], function (err, rows) {
          if (err) {
            reject(err);
          }

          rows.forEach(function (row) {
            bioSignals.push(row);
          });

          resolve(bioSignals);
        });
      });
    }

    // return order list by time

  }, {
    key: 'getBioSignals',
    value: function getBioSignals() {
      var _this12 = this;

      return new Promise(function (resolve, reject) {
        _this12.db.all("SELECT * FROM " + _this12.bioWatchInPlaceTable + " ORDER BY dateAndTime DESC", function (err, rows) {
          if (err) {
            reject(err);
          }
          resolve(rows);
        });
      });
    }
  }, {
    key: 'close',
    value: function close() {
      this.db.close();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var _this13 = this;

      // remove the db file
      return new Promise(function (resolve, reject) {
        fs.unlink(_this13.fileName, function (err) {
          if (err) {
            reject(err);
          }
          console.log('Destroy database successfully.');
          resolve();
        });
      });
    }
  }]);

  return BioSignalDatabase;
}();

module.exports = BioSignalDatabase;