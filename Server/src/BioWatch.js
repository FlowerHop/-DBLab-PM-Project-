let Wear = require ('./Wear');

class BioWatch {
  constructor (id) {
    this.bioWatchID = id;
    // this.place = null;
    this.currentPlace = null;
    this.lastPlace = null;
    this.wear = new Wear ();
    this.wear.bioWatch = this;
  }

  woreByPatient (patient) {
    this.wear.woreByPatient (patient);
  }

  updatePlace (place) {
  	this.lastPlace = this.currentPlace;
  	this.currentPlace = place;
  }
}

module.exports = BioWatch;