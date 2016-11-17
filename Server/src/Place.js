let Patient = require ('./Patient');

class Place {
  constructor (id) {
    this.placeID = id;
    this.bioWatchList = [];
    this.rssiList = [];
  }

  scannedIn (bioWatch, rssi) {
  	if (bioWatch.currentPlace == null) { // bioWatch is not in any place
  	  // this.bioWatchMoveIn (bioWatch, rssi);
  	  this.bioWatchList.push (bioWatch);
      this.rssiList.push (rssi);
      bioWatch.updatePlace (this);
  	} else if (bioWatch.currentPlace != this) { // place changing algorithm
      let currentPlace = bioWatch.currentPlace;
      
      if (currentPlace.getRSSI (bioWatch) > rssi) {
      	// currentPlace.bioWatchMoveOut (bioWatch);
      	// this.bioWatchMoveIn (bioWatch, rssi);
      	currentPlace.bioWatchMoveOutList (bioWatch);
      	this.bioWatchList.push (bioWatch);
        this.rssiList.push (rssi);
        bioWatch.updatePlace (this);
      }
  	} else { // update rssi
      this.setRSSI (bioWatch, rssi);
  	}
  }

  bioWatchMoveOutList (bioWatch) {
  	for (let i in this.bioWatchList) {
      if (bioWatch == this.bioWatchList[i]) {
        this.bioWatchList.splice (i, 1);
        this.rssiList.splice (i, 1);
        break;
      }
    }
  }

  // bioWatchMoveInList (bioWatch, rssi) {
  //   for (let i in this.bioWatchList) {
  //     if (bioWatch == this.bioWatchList[i]) {
  //     	return;
  //     }
  //   }

  //   this.bioWatchList.push (bioWatch);
  //   this.rssiList.push (rssi);
  //   bioWatch.updatePlace (this);
  // }

  getRSSI (bioWatch) {
  	for (let i in this.bioWatchList) {
  	  if (bioWatch == this.bioWatchList[i]) {
  	  	return this.rssiList[i];
  	  }
  	}
  	return -1; // no this bioWatch
  }

  setRSSI (bioWatch, rssi) {
    for (let i in this.bioWatchList) {
      if (bioWatch == this.bioWatchList[i]) {
      	this.rssiList[i] = rssi;
      	return;
      }
    }
  }
}

module.exports = Place;