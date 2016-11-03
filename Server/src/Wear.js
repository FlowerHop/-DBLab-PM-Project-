class Wear {
  constructor () {
    this.patient = null;
    this.bioWatch = null;
  }

  wearBioWatch (bioWatch) {
  	bioWatch.wear.bioWatch = null;
    this.bioWatch = bioWatch;
    this.bioWatch.wear = this;
  }

  woreByPatient (patient) {
  	patient.wear.patient = null;
    this.patient = patient;
    this.patient.wear = this;
  }
}

module.exports = Wear;