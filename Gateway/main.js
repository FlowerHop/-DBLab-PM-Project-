'use strict';

var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var queryString = require('querystring');
var request = require('request');
var util = require('util');
var SerialPort = require('serialport').SerialPort;
var xbee_api = require('xbee-api');

var C = xbee_api.constants;
var COM_NUM = "COM19";
var BAUDRATE = 9600;

var xbeeAPI = new xbee_api.XBeeAPI({
    api_mode: 1
});

var serialport = new SerialPort(COM_NUM, {
    baudrate: BAUDRATE,
    parser: xbeeAPI.rawParser()
});

serialport.on("open", function () {
    var frame_obj = {
        type: C.FRAME_TYPE.AT_COMMAND,
        command: "NI",
        commandParameter: []
    };

    serialport.write(xbeeAPI.buildFrame(frame_obj));
});

xbeeAPI.on("frame_object", function (frame) {
    console.log(">>", frame);
});