'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Patient = void 0;

var AbnormalPulseRateDetector = function () {
  function AbnormalPulseRateDetector(patient) {
    _classCallCheck(this, AbnormalPulseRateDetector);

    this.patient = patient;
    this.ppgTimeCounter = 0;
    this.ppgAbnormalCounts = 0;
    this.ppgNormalCounts = 0;

    this.ppgClocker = -1;
    Patient = require('./Patient');
  }

  _createClass(AbnormalPulseRateDetector, [{
    key: 'input',
    value: function input(pr) {
      this.ppgTimeCounter = 0;
      this.patient.status = Patient.NORMAL;

      if (pr <= AbnormalPulseRateDetector.UPPER_PR && pr >= AbnormalPulseRateDetector.BOTTOM_PR) {
        // normal
        this.normal_counts++;
      } else if (pr >= AbnormalPulseRateDetector.UPPER_PR && pr <= AbnormalPulseRateDetector.BOTTOM_PR) {
        // abnormal
        this.abnormal_count++;
      }
    }
  }, {
    key: 'startDetect',
    value: function startDetect() {
      if (this.ppgClocker == -1) {
        this.ppgClocker = setInterval(this.detectStatus.bind(this), AbnormalPulseRateDetector.DETECT_INTERVAL);
      }
    }
  }, {
    key: 'stopDetect',
    value: function stopDetect() {
      if (this.ppgClocker != -1) {
        clearInterval(this.ppgClocker);
        this.ppgClocker = -1;
      }
    }
  }, {
    key: 'detectStatus',
    value: function detectStatus() {
      this.ppgTimeCounter++;
      if (this.ppgTimeCounter >= 60) {
        // raise warning
        this.patient.status = Patient.WARNING;
      } else {
        if (this.normal_counts > 300) {
          this.patient.status = Patient.NORMAL;
          this.abnormal_counts = this.normal_counts = 0;
        }

        if (this.abnormal_counts > 180) {
          // raise an alarm
          this.patient.status = Patient.ALARM;
        }
      }

      // if new pulse rate input: 
      //     if abnormal -> abnormal_counts + 1
      //     if normal -> normal_counts + 1
      // if no data input for 10 mins:
      //     raise a warning message
      // if normal_counts > 300 // about 5 mins
      //     abnormal_counts = normal_counts = 0
      // if abnormal_counts > 180
      //     raise an alarm
    }
  }], [{
    key: 'PPG_SAMPLE_FREQUENCY',
    get: function get() {
      return 5;
    }
  }, {
    key: 'UPPER_PR',
    get: function get() {
      return 120;
    }
  }, {
    key: 'BOTTOM_PR',
    get: function get() {
      return 60;
    }
  }, {
    key: 'DETECT_INTERVAL',
    get: function get() {
      return 1000;
    }
  }]);

  return AbnormalPulseRateDetector;
}();

module.exports = AbnormalPulseRateDetector;