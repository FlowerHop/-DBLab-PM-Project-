"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BioSignal = function BioSignal(pulse, dateAndTime) {
  _classCallCheck(this, BioSignal);

  this.pulse = pulse;
  this.dateAndTime = dateAndTime;
};

module.exports = BioSignal;