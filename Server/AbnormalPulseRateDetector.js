"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AbnormalPulseRateDetector = function () {
  function AbnormalPulseRateDetector(patient) {
    _classCallCheck(this, AbnormalPulseRateDetector);

    var PPG_SAMPLE_FREQUENCY = 5; // s
    var UPPER_PR = 120;
    var BOTTOM_PR = 60;
    var DETECT_INTERVAL = 1000;

    this.patient = patient;
    this.ppgTimeCounter = 0;
    this.ppgAbnormalCounts = 0;
    this.ppgNormalCounts = 0;

    this.ppgClocker = -1;
  }

  _createClass(AbnormalPulseRateDetector, [{
    key: "input",
    value: function input(pr) {
      this.ppgTimeCounter = 0;

      if (pr <= UPPER_PR && pr >= BOTTOM_PR) {
        // normal
        this.normal_counts++;
      } else if (pr >= UPPER_PR && pr <= BOTTOM_PR) {
        // abnormal
        this.abnormal_count++;
      }
    }
  }, {
    key: "startDetect",
    value: function startDetect() {
      if (this.ppgClocker == -1) {
        this.ppgClocker = setInterval(detectStatus, AbnormalPulseRateDetector.DETECT_INTERVAL);
      }
    }
  }, {
    key: "stopDetect",
    value: function stopDetect() {
      if (this.ppgClocker != -1) {
        clearInterval(this.ppgClocker);
        this.ppgClocker = -1;
      }
    }
  }, {
    key: "detectStatus",
    value: function detectStatus() {
      this.ppgTimeCounter++;
      if (this.ppgTimeCounter >= 600000) {
        // raise warning
        this.setStatus(Patient.WARNING);
      } else {
        if (normal_counts > 300000) {
          this.setStatus(Patient.NORMAL);
          abnormal_counts = normal_counts = 0;
        }

        if (abnormal_counts > 180000) {
          // raise an alarm
          this.setStatus(Patient.ALARM);
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
  }]);

  return AbnormalPulseRateDetector;
}();

module.exports = AbnormalPulseRateDetector;