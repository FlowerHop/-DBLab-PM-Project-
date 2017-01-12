'use strict';

var csv = require('fast-csv');
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
// const COM_NUM = "/dev/ttyUSB0" // Linux usb
var BAUDRATE = 9600;

var xbeeAPI = new xbee_api.XBeeAPI({
	api_mode: 1
});

var IP = "http://140.115.51.30";
var PORT = "1338";
var POST_API = "/api/patients_status";

var IN_PLACE = process.argv[2];

var serialport = new SerialPort(COM_NUM, {
	baudrate: BAUDRATE,
	parser: xbeeAPI.rawParser()
});

var csvFileName = "gateway_" + new Date().toString() + '.csv';
var csvStream = csv.createWriteStream({ headers: true });
var writableStream = fs.createWriteStream("./saves/" + csvFileName);

writableStream.on("finish", function () {
	console.log("finish");
});

csvStream.pipe(writableStream);

serialport.on("open", function () {
	var frame_obj = {
		type: C.FRAME_TYPE.AT_COMMAND,
		command: "NI",
		commandParameter: []
	};

	// serialport.write (xbeeAPI.buildFrame (frame_obj));
});

xbeeAPI.on("frame_object", function (frame) {
	console.log(">>", frame);

	var inPlace = IN_PLACE;
	var rssi = frame.rssi;
	var gatewayTimestamp = new Date().getTime();
	var signal = packageAnalyzer(frame.data);

	var bioWatchSignal = {
		inPlace: inPlace,
		bioWatchID: signal.bioWatchID,
		index: signal.index,
		pulse: signal.pulse,
		rssi: rssi,
		gatewayTimestamp: gatewayTimestamp
	};

	console.log(bioWatchSignal);
	writeToCSV(bioWatchSignal);

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
	var bioWatchID = data.toString('utf-8', 0, 2);
	var index = data.readUIntBE(2, 5);
	var pulse = data.readUIntBE(7, 1);

	return {
		bioWatchID: bioWatchID,
		pulse: pulse,
		index: index
	};
};

var writeToCSV = function writeToCSV(bioWatchSignal) {
	csvStream.write({
		inPlace: bioWatchSignal.inPlace,
		bioWatchID: bioWatchSignal.bioWatchID,
		index: bioWatchSignal.index,
		pulse: bioWatchSignal.pulse,
		rssi: bioWatchSignal.rssi,
		gatewayTimestamp: bioWatchSignal.gatewayTimestamp,
		gatewayDateAndTime: new Date(bioWatchSignal.gatewayTimestamp)
	});
};