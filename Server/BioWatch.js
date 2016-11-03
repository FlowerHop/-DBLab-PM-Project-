'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Wear = require('./Wear');

var BioWatch = function () {
  function BioWatch(id) {
    _classCallCheck(this, BioWatch);

    this.bioWatchID = id;
    // this.place = null;
    this.currentPlace = null;
    this.lastPlace = null;
    this.wear = new Wear();
    this.wear.bioWatch = this;
  }

  _createClass(BioWatch, [{
    key: 'woreByPatient',
    value: function woreByPatient(patient) {
      this.wear.woreByPatient(patient);
    }
  }, {
    key: 'updatePlace',
    value: function updatePlace(place) {
      this.lastPlace = this.currentPlace;
      this.currentPlace = place;
    }
  }]);

  return BioWatch;
}();

module.exports = BioWatch;