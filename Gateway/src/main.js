'use strict';

const fs = require ('fs');
const path = require ('path');
const bodyParser = require ('body-parser');
const queryString = require ('querystring');
const request = require ('request');
const util = require ('util');
const SerialPort = require ('serialport').SerialPort;
const xbee_api = require ('xbee-api');

const C = xbee_api.constants;
const COM_NUM = "/dev/cu.usbserial-A403MPU4";
const BAUDRATE = 9600;

const xbeeAPI = new xbee_api.XBeeAPI ({
	api_mode: 1
});

const IP = "http://140.115.51.30";
const PORT = "1338";
const POST_API = "/api/patient_status";

const IN_PLACE = process.argv[2];

const serialport = new SerialPort (COM_NUM, {
    baudrate: BAUDRATE, 
    parser: xbeeAPI.rawParser ()
});

serialport.on ("open", () => {
    var frame_obj = {
    	type: C.FRAME_TYPE.AT_COMMAND,
    	command: "NI",
    	commandParameter: []
    };

    serialport.write (xbeeAPI.buildFrame (frame_obj));
});

xbeeAPI.on ("frame_object", (frame) => {
	console.log (">>", frame);

	var inPlace = IN_PLACE;
    var bioWatchId = frame.data;
    var pulse = frame.data;
    var rssi = frame.rssi;
    var dateAndTime = new Date ().getTime ();
	
	var bioWatchSignal = {
	  inPlace: inPlace,
	  bioWatchId: bioWatchId,
	  pulse: pulse,
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
	
	var flowControl = new Promise ((resolve, reject) => {
	  request (options, (error, response, body) => {
	    if (error) {
	      reject (error);
	    }
	    // res.send (response.body.toString ());
	    resolve ();
	  });
	}).catch ((error) => {
	  console.log ('Post data error: ' + error);
	}).then (() => {
	  res.end ();
	});
});

