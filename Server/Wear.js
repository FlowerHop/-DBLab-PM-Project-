"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Wear = function () {
  function Wear() {
    _classCallCheck(this, Wear);

    this.patient = null;
    this.bioWatch = null;
  }

  _createClass(Wear, [{
    key: "wearBioWatch",
    value: function wearBioWatch(bioWatch) {
      bioWatch.wear.bioWatch = null;
      this.bioWatch = bioWatch;
      this.bioWatch.wear = this;
    }
  }, {
    key: "woreByPatient",
    value: function woreByPatient(patient) {
      patient.wear.patient = null;
      this.patient = patient;
      this.patient.wear = this;
    }
  }]);

  return Wear;
}();

module.exports = Wear;