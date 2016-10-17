const fs = require ('fs');
const path = require ('path');

class BioSignalDatabase {
  constructor (fileName) {
    this.fileName = fileName;
  }

  init (fileName) {
    return new Promise ((resolve, reject) => {
      if (fileName != undefined) {
        this.fileName = fileName;
      }

      this.db = new (require ('sqlite3').verbose ().Database) (this.fileName);

      this.placeTable = "Place";
      this.bioWatchTable = "BioWatch";
      this.bioWatchInPlaceTable = "BioWatchInPlace";

      this.db.serialize (() => {
        this.db.run ("CREATE TABLE IF NOT EXISTS " + this.placeTable + "(place_id TEXT PRIMARY KEY)");

        this.db.run ("CREATE TABLE IF NOT EXISTS " + this.bioWatchTable + "(device_id TEXT PRIMARY KEY)");

        this.db.run ("CREATE TABLE IF NOT EXISTS " + this.bioWatchInPlaceTable + "(in_id INTEGER PRIMARY KEY AUTOINCREMENT, device_id TEXT NOT NULL, place_id TEXT NOT NULL, pulse INTEGER NOT NULL, rssi INTEGER NOT NULL, dateAndTime INTEGER NOT NULL)", function () {
          resolve ();
        });
      });
    });
  }

  insertPlace (place_id) {
    return new Promise ((resolve, reject) => {
      this.db.run ("INSERT INTO " + this.placeTable + " (place_id) VALUES (?)", place_id, (err) => {
        if (err) {
          reject (err);
        }
        resolve ();
      });
    });
  }

  insertBioWatch (device_id) {
    return new Promise ((resolve, reject) => {
      this.db.run ("INSERT INTO " + this.bioWatchTable + " (device_id) VALUES (?)", device_id, (err) => {
        if (err) {
          reject (err);
        }
        resolve ();
      });
    });
  }

  insertBioSignal (device_id, inPlace, pulse, rssi, dateAndTime) {
    // check if the bio watch and place has been registered
    return this.getPlace (inPlace)
    .then ((data) => {
      if (data == undefined) {
        throw new Error('no this place');
      }

      return data;
    })
    .then ((inPlace) => {
      return this.getBioWatch(device_id)
      .then ((data) => {
        if (data == undefined) {
          throw new Error('no this bio watch');
        }

        return data;
      })
      .then ((device_id) => {
        this.db.run ("INSERT INTO " + this.bioWatchInPlaceTable + " (device_id, place_id, pulse, rssi, dateAndTime) VALUES (?, ?, ?, ?, ?)", [device_id, inPlace, pulse, rssi, dateAndTime], (err) => {
          if (err) {
            throw new Error (err);
          }
        });

        return [inPlace, device_id];
      });
    });
  }

  getPlace (place_id) {
    return new Promise ((resolve, reject) => {
      this.db.all ("SELECT place_id FROM " + this.placeTable + " WHERE place_id = ?", [place_id], (err, rows) => {
        if (err) {
          reject (err);
        }

        resolve (rows[0].place_id);
      });
    });
  }

  getPlaceList () {
    return new Promise ((resolve, reject) => {
      var placeList = [];

      this.db.all ("SELECT * FROM " + this.placeTable, (err, rows) => {
        if (err) {
          reject (err);
        }

        rows.forEach ((row) => {
          placeList.push(row.place_id);
        });

        resolve (placeList);
      });
    });
  }

  getBioWatch (device_id) {
    return new Promise ((resolve, reject) => {
      this.db.all ("SELECT device_id FROM " + this.bioWatchTable + " WHERE device_id = ?", [device_id], (err, rows) => {
        if (err) {
          reject (err);
        }

        resolve (rows[0].device_id);
      });
    });
  }

  getBioWatchList () {
    return new Promise ((resolve, reject) => {
      var bioWatchList = [];

      this.db.all ("SELECT * FROM " + this.bioWatchTable, (err, rows) => {
        if (err) {
          reject (err);
        }

        rows.forEach ((row) => {
          bioWatchList.push (row.device_id);
        });

        resolve (bioWatchList);
      });
    });
  }

  getBioSignalAtTime (device_id, dateAndTime) {
    return new Promise ((resolve, reject) => {
      this.db.all ("SELECT place_id, pulse, rssi FROM " + this.bioWatchInPlaceTable + " WHERE device_id = ? AND dateAndTime = ?", [device_id, dateAndTime], (err, rows) => {
        if (err) {
          reject (err);
        }

        resolve ({ place_id: rows[0].place_id, pulse: rows[0].pulse, rssi: rows[0].rssi });
      });
    });
  }

  // return ordered list
  getBioSignalsFromBioWatch (device_id) {
    return new Promise ((resolve, reject) => {
      var bioSignals = [];

      this.db.all ("SELECT device_id, place_id, pulse, rssi, dateAndTime FROM " + this.bioWatchInPlaceTable + " WHERE device_id = ? ORDER BY dateAndTime DESC", [device_id], (err, rows) => {
        if (err) {
          reject (err);
        }

        rows.forEach ((row) => {
          bioSignals.push (row);
        });

        resolve (bioSignals);
      });
    });
  }

  getBioSignalsInPlace (inPlace) {
    return new Promise ((resolve, reject) => {
      var bioSignals = [];
      this.db.all("SELECT device_id, pulse, rssi, dateAndTime FROM " + this.bioWatchInPlaceTable + " WHERE place_id = ?", [inPlace], (err, rows) => {
        if (err) {
          reject (err);
        }

        rows.forEach ((row) => {
          bioSignals.push (row);
        });

        resolve (bioSignals);
      });
    });
  }

  // return order list by time
  getBioSignals () {
    return new Promise ((resolve, reject) => {
      this.db.all ("SELECT * FROM " + this.bioWatchInPlaceTable + " ORDER BY dateAndTime DESC", (err, rows) => {
        if (err) {
          reject (err);
        }
        resolve (rows);
      });
    });
  }

  close () {
    this.db.close ();
  }

  destroy () {
    // remove the db file
    return new Promise ((resolve, reject) => {
      fs.unlink (this.fileName, (err) => {
        if (err) {
          reject (err);
        }
        console.log ('Destroy database successfully.');
        resolve ();
      });
    });
  }
}

module.exports = BioSignalDatabase;