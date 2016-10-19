'use strict';

var BioInfo = function (device_id, inPlace, pulse, rssi, dAndt) {
  this.device_id = device_id;
  this.pulse = pulse;
  this.dateAndTime = dAndt;	
  this.place_id = inPlace;
  this.rssi = rssi;
};

BioInfo.propotype = {};

module.exports = BioInfo;