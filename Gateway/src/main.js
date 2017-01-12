'use strict';

const csv = require ('fast-csv');
const fs = require ('fs');
const path = require ('path');
const bodyParser = require ('body-parser');
const queryString = require ('querystring');
const request = require ('request');
const util = require ('util');
const SerialPort = require ('serialport').SerialPort;
const xbee_api = require ('xbee-api');

const C = xbee_api.constants;
const COM_NUM = "/dev/cu.usbserial-A403MPU4"; // mac usb
// const COM_NUM = "/dev/ttyUSB0" // Linux usb
const BAUDRATE = 9600;

const xbeeAPI = new xbee_api.XBeeAPI ({
	api_mode: 1
});

const IP = "http://140.115.51.30";
const PORT = "1338";
const POST_API = "/api/patients_status";

const IN_PLACE = process.argv[2];

const serialport = new SerialPort (COM_NUM, {
    baudrate: BAUDRATE, 
    parser: xbeeAPI.rawParser ()
});

const csvFileName = "gateway_" + (new Date ().toString ()) + '.csv';
const csvStream = csv.createWriteStream ({headers: true});
const writableStream = fs.createWriteStream ("./saves/" + csvFileName);

writableStream.on ("finish", function () {
	console.log ("finish");
});

csvStream.pipe (writableStream);

serialport.on ("open", () => {
    var frame_obj = {
    	type: C.FRAME_TYPE.AT_COMMAND,
    	command: "NI",
    	commandParameter: []
    };

    // serialport.write (xbeeAPI.buildFrame (frame_obj));
});

xbeeAPI.on ("frame_object", (frame) => {
	console.log (">>", frame);
    
	var inPlace = IN_PLACE;
    var rssi = frame.rssi;
    var timestamp = new Date ().getTime ();
    var signal = packageAnalyzer (frame.data);
	
	var bioWatchSignal = {
	  inPlace: inPlace,
	  bioWatchID: signal.bioWatchID,
	  index: signal.index,
	  pulse: signal.pulse,
	  rssi: rssi,
	  gatewayTimestamp: timestamp
	};

	console.log (bioWatchSignal);
    writeToCSV (bioWatchSignal);

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

var packageAnalyzer = (data) => {
  var bioWatchID = data.toString ('utf-8', 0, 2);
  var index = data.readUIntBE (2, 5);
  var pulse = data.readUIntBE (5, 1);
  
  return {
  	bioWatchID: bioWatchID, 
  	pulse: pulse,
  	index: index
  };
};

var writeToCSV = (bioWatchSignal) => {
	csvStream.write  ({
	  inPlace: bioWatchSignal.inPlace,
	  bioWatchID: bioWatchSignal.bioWatchID,
	  index: bioWatchSignal.index,
	  pulse: bioWatchSignal.pulse,
	  rssi: bioWatchSignal.rssi,
	  timestamp: bioWatchSignal.timestamp,
	  dateAndTime: new Date (bioWatchSignal.timestamp)
	});
}

