'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AbnormalPulseRateDetector = require('./AbnormalPulseRateDetector');
var Wear = require('./Wear');

var Patient = function () {
  function Patient(id) {
    _classCallCheck(this, Patient);

    var NORMAL = 0;
    var ALARM = 1;
    var WARNING = 2;

    this.status = NORMAL;

    this.patientID = id;

    this.bioSignal = null;
    this.wear = new Wear();
    this.wear.patient = this;

    this.abnormalPulseRateDetector = new AbnormalPulseRateDetector(this);
  }

  _createClass(Patient, [{
    key: 'inputBioSignal',
    value: function inputBioSignal(bioSignal) {
      this.bioSignal = bioSignal;
      abnormalPulseRateDetector.input(this.bioSignal.pulse);
    }
  }, {
    key: 'wearBioWatch',
    value: function wearBioWatch(bioWatch) {
      this.wear.wearBioWatch(bioWatch);
    }

    // inputPulse (pulse, dateAndTime = new Date ().getTime ()) {
    //   this.pulse = pulse;
    //   this.dateAndTime = dateAndTime;
    //   abnormalPulseRateDetector.input (pulse);
    // }

  }]);

  return Patient;
}();

module.exports = Patient;