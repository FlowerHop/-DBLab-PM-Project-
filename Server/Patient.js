'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AbnormalPulseRateDetector = require('./AbnormalPulseRateDetector');
var Wear = require('./Wear');

var Patient = function () {
  function Patient(id) {
    _classCallCheck(this, Patient);

    this.status = Patient.NORMAL;

    this.patientID = id;

    this.bioSignal = null;
    this.wear = new Wear();
    this.wear.patient = this;

    this.abnormalPulseRateDetector = new AbnormalPulseRateDetector(this);
    this.abnormalPulseRateDetector.startDetect();
  }

  _createClass(Patient, [{
    key: 'inputBioSignal',
    value: function inputBioSignal(bioSignal) {
      this.bioSignal = bioSignal;
      this.abnormalPulseRateDetector.input(this.bioSignal.pulse);
    }
  }, {
    key: 'wearBioWatch',
    value: function wearBioWatch(bioWatch) {
      this.wear.wearBioWatch(bioWatch);
    }
  }], [{
    key: 'NORMAL',
    get: function get() {
      return 0;
    }
  }, {
    key: 'ALARM',
    get: function get() {
      return 1;
    }
  }, {
    key: 'WARNING',
    get: function get() {
      return 2;
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