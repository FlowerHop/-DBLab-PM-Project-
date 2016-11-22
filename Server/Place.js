'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Patient = require('./Patient');

var Place = function () {
  function Place(id) {
    _classCallCheck(this, Place);

    this.placeID = id;
    this.bioWatchList = [];
    this.rssiList = [];
  }

  _createClass(Place, [{
    key: 'scannedIn',
    value: function scannedIn(bioWatch, rssi) {
      if (bioWatch.currentPlace == null) {
        // bioWatch is not in any place
        // this.bioWatchMoveIn (bioWatch, rssi);
        this.bioWatchList.push(bioWatch);
        this.rssiList.push(rssi);
        bioWatch.updatePlace(this);
        return this;
      } else if (bioWatch.currentPlace != this) {
        // place changing algorithm
        var currentPlace = bioWatch.currentPlace;

        if (currentPlace.getRSSI(bioWatch) > rssi) {
          // currentPlace.bioWatchMoveOut (bioWatch);
          // this.bioWatchMoveIn (bioWatch, rssi);
          currentPlace.bioWatchMoveOutList(bioWatch);
          this.bioWatchList.push(bioWatch);
          this.rssiList.push(rssi);
          bioWatch.updatePlace(this);
          return currentPlace;
        }
        return this;
      } else {
        // update rssi
        this.setRSSI(bioWatch, rssi);
        return this;
      }
    }
  }, {
    key: 'bioWatchMoveOutList',
    value: function bioWatchMoveOutList(bioWatch) {
      for (var i in this.bioWatchList) {
        if (bioWatch == this.bioWatchList[i]) {
          this.bioWatchList.splice(i, 1);
          this.rssiList.splice(i, 1);
          break;
        }
      }
    }

    // bioWatchMoveInList (bioWatch, rssi) {
    //   for (let i in this.bioWatchList) {
    //     if (bioWatch == this.bioWatchList[i]) {
    //     	return;
    //     }
    //   }

    //   this.bioWatchList.push (bioWatch);
    //   this.rssiList.push (rssi);
    //   bioWatch.updatePlace (this);
    // }

  }, {
    key: 'getRSSI',
    value: function getRSSI(bioWatch) {
      for (var i in this.bioWatchList) {
        if (bioWatch == this.bioWatchList[i]) {
          return this.rssiList[i];
        }
      }
      return -1; // no this bioWatch
    }
  }, {
    key: 'setRSSI',
    value: function setRSSI(bioWatch, rssi) {
      for (var i in this.bioWatchList) {
        if (bioWatch == this.bioWatchList[i]) {
          this.rssiList[i] = rssi;
          return;
        }
      }
    }
  }]);

  return Place;
}();

module.exports = Place;