class LiveIn {
  constructor () {
  	this.patient = null;
    this.place = null;
  }

  liveIn (place) {
    this.place = null;
    this.patient.liveIn = this;
  }
}