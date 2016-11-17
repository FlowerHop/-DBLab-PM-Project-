var assert = require ('assert');
var should = require ('should');
var Patient = require ('./../Patient');
var BioWatch = require ('./../BioWatch');
var Place = require ('./../Place');
var Wear = require ('./../Wear');
// var ScannedIn = require ('./../ScannedIn');

describe ('Wear Test', function () {
  describe ('Patient A, BioWatch a', function () {
    describe ('Wear BioWatch', function () {
      var patient;
      var bioWatch;

      beforeEach (function () {
        patient = new Patient ('A');
        bioWatch = new BioWatch ('a');

        patient.wearBioWatch (bioWatch);
      });
      
      it ('patientID should equal A', function () {
        patient.patientID.should.equal ('A');    	
      });

      it ('bioWatchID should equal a', function () {
        bioWatch.bioWatchID.should.equal ('a');    	
      });

      it ('wear shoud be equal', function () {
        patient.wear.should.equal (bioWatch.wear);
      });

      it ('in wear of A, patient shoud equal A', function () {
        patient.wear.patient.should.equal (patient);
      });

      it ('in wear of a, patient shoud equal A', function () {
        bioWatch.wear.patient.should.equal (patient);
      });

      it ('in wear of A, bioWatch shoud equal a', function () {
        patient.wear.bioWatch.should.equal (bioWatch);
      });

      it ('in wear of a, bioWatch shoud equal a', function () {
        bioWatch.wear.bioWatch.should.equal (bioWatch);
      });
    });

    describe ('Wore By Patient', function () {
      var patient;
      var bioWatch;

      beforeEach (function () {
        patient = new Patient ('A');
        bioWatch = new BioWatch ('a');

        bioWatch.woreByPatient (patient);
      });
      
      it ('patientID should equal A', function () {
        patient.patientID.should.equal ('A');    	
      });

      it ('bioWatchID should equal a', function () {
        bioWatch.bioWatchID.should.equal ('a');    	
      });

      it ('wear shoud be equal', function () {
        bioWatch.wear.should.equal (patient.wear);
      });

      it ('in wear of A, patient shoud equal A', function () {
        patient.wear.patient.should.equal (patient);
      });

      it ('in wear of a, patient shoud equal A', function () {
        bioWatch.wear.patient.should.equal (patient);
      });

      it ('in wear of A, bioWatch shoud equal a', function () {
        patient.wear.bioWatch.should.equal (bioWatch);
      });

      it ('in wear of a, bioWatch shoud equal a', function () {
        bioWatch.wear.bioWatch.should.equal (bioWatch);
      });
    });
    
  });
});

describe ('Scan Test', function () {
  describe ('Place A, B; BioWatch a, b, c', function () {
    describe ('init checking', function () {
      var placeA, placeB, bioWatchA, bioWatchB, bioWatchC;
      beforeEach (function () {
        placeA = new Place ('A');
        placeB = new Place ('B');
        bioWatchA = new BioWatch ('a');
        bioWatchB = new BioWatch ('b');
        bioWatchC = new BioWatch ('c');
      });

      it ('placeA.placeID should equal A',function () {
        placeA.placeID.should.equal ('A');
      });
      it ('placeB.placeID should equal B',function () {
        placeB.placeID.should.equal ('B');
      });
      it ('BioWatchA.bioWatchID should equal a',function () {
        bioWatchA.bioWatchID.should.equal ('a');
      });
      it ('BioWatchB.bioWatchID should equal b',function () {
        bioWatchB.bioWatchID.should.equal ('b');
      });
      it ('BioWatchC.bioWatchID should equal c',function () {
        bioWatchC.bioWatchID.should.equal ('c');
      });
    });

    describe ('bioWatchA walk in placeA (rssi = 40), change to placeB (rssi = 30), and update in placeB (rssi = 20)', function () {
      var placeA, placeB, bioWatchA, bioWatchB, bioWatchC;

      beforeEach (function () {
        placeA = new Place ('A');
        placeB = new Place ('B');
        bioWatchA = new BioWatch ('a');
        bioWatchB = new BioWatch ('b');
        bioWatchC = new BioWatch ('c');
        placeA.scannedIn (bioWatchA, 40);
        placeB.scannedIn (bioWatchA, 30);
        placeB.scannedIn (bioWatchA, 20);
      });

      it ('placeB.getRSSI (bioWatchA) should equal 20', function () {        
        placeB.getRSSI (bioWatchA).should.equal (20);
      });

      it ('bioWatchA.currentPlace should eqaul placeB', function () {
        bioWatchA.currentPlace.should.equal (placeB);
      });

      it ('bioWatchA.lastPlace should equal placeA', function () {
        bioWatchA.lastPlace.should.equal (placeA);
      })

      it ('placeB.getRSSI (bioWatchA) should equal 20', function () {
        placeB.getRSSI (bioWatchA).should.equal (20);
      });

      it ('placeA.getRSSI (bioWatchA) should equal -1', function (){
        placeA.getRSSI (bioWatchA).should.equal (-1);
      });

      it ('placeB.bioWatchList.length should equal 1', function () {
        placeB.bioWatchList.length.should.equal (1);
      });

      it ('placeB.rssiList.length should equal 1', function () {
        placeB.rssiList.length.should.equal (1);
      });
    });

    describe ('bioWatchA (40), bioWatchB (30) walk in placeB, bioWatchC (50) walk in placeA, bioWatchC (40) change to placeB, bioWatchB (20) change to placeA, placeA scan bioWatchA (50)', function () {
      var placeA, placeB, bioWatchA, bioWatchB, bioWatchC;

      beforeEach (function () {
        placeA = new Place ('A');
        placeB = new Place ('B');
        bioWatchA = new BioWatch ('a');
        bioWatchB = new BioWatch ('b');
        bioWatchC = new BioWatch ('c');

        placeB.scannedIn (bioWatchA, 40);
        placeB.scannedIn (bioWatchB, 30);
        placeA.scannedIn (bioWatchC, 50);  

        placeB.scannedIn (bioWatchC, 40);
        placeA.scannedIn (bioWatchB, 20);
        placeA.scannedIn (bioWatchA, 50);
      });

      it ('bioWatchA.currentPlace should equal placeB', function () {
        bioWatchA.currentPlace.should.equal (placeB);
      });

      it ('bioWatchB.currentPlace should equal placeA', function () {
        bioWatchB.currentPlace.should.equal (placeA);
      });

      it ('bioWatchB.lastPlace should equal placeB', function () {
        bioWatchB.lastPlace.should.equal (placeB);
      });

      it ('bioWatchC.currentPlace should equal placeB', function () {
        bioWatchC.currentPlace.should.equal (placeB);
      });

      it ('bioWatchC.lastPlace should equal placeA', function () {
        bioWatchC.lastPlace.should.equal (placeA);
      });

      it ('placeA.getRSSI (bioWatchA) should equal -1', function () {
        placeA.getRSSI (bioWatchA).should.equal (-1);
      });

      it ('placeA.getRSSI (bioWatchB) should equal 20', function () {
        placeA.getRSSI (bioWatchB).should.equal (20);
      });    

      it ('placeA.getRSSI (bioWatchC) should equal -1', function () {
        placeA.getRSSI (bioWatchC).should.equal (-1);
      });

      it ('placeB.getRSSI (bioWatchA) should equal 40', function () {
        placeB.getRSSI (bioWatchA).should.equal (40);
      });

      it ('placeB.getRSSI (bioWatchB) should equal -1', function () {
        placeB.getRSSI (bioWatchB).should.equal (-1);
      });    

      it ('placeB.getRSSI (bioWatchC) should equal 40', function () {
        placeB.getRSSI (bioWatchC).should.equal (40);
      });


      it ('placeA.bioWatchList.length and placeA.rssiList.length should equal 1', function () {
        placeA.bioWatchList.length.should.equal (1);
        placeA.rssiList.length.should.equal (1);
      });
      
      it ('placeB.bioWatchList.length and placeB.rssiList.length should equal 2', function () {
        console.log (placeA);
        console.log (placeB);
        placeB.bioWatchList.length.should.equal (2);
        placeB.rssiList.length.should.equal (2);
      });


    });


  });
});