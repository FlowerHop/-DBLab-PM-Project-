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
var COM_NUM = "/dev/cu.usbserial-A403MPU4"; // mac usb
var BAUDRATE = 9600;

var xbeeAPI = new xbee_api.XBeeAPI({
				api_mode: 1
});

var IP = "http://140.115.51.30";
var PORT = "1338";
var POST_API = "/api/patient_status";

var IN_PLACE = process.argv[2];

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

				var inPlace = IN_PLACE;
				var rssi = frame.rssi;
				var dateAndTime = new Date().getTime();
				var signal = packageAnalyzer(frame);

				var bioWatchSignal = {
								inPlace: inPlace,
								bioWatchId: signal.bioWatchId,
								pulse: signal.pulse,
								rssi: rssi,
								dateAndTime: dateAndTime
				};

				var options = {
								// IP:port/api/
								url: IP + ':' + PORT + POST_API,
								method: 'POST',
								json: true,
								headers: {
												"Content-Type": "application/json"
								},
								body: bioWatchSignal
				};

				var flowControl = new Promise(function (resolve, reject) {
								request(options, function (error, response, body) {
												if (error) {
																reject(error);
												}
												// res.send (response.body.toString ());
												resolve();
								});
				}).catch(function (error) {
								console.log('Post data error: ' + error);
				}).then(function () {
								res.end();
				});
});

var packageAnalyzer = function packageAnalyzer(data) {
				var bioWatchId = data.toString('utf-8', 0, 2);
				var pulse = frame.data.readUIntBE(2, 1);

				return {
								bioWatchId: bioWatchId,
								pulse: pulse
				};
};