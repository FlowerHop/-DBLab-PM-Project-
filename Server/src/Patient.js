let AbnormalPulseRateDetector = require ('./AbnormalPulseRateDetector');
let Wear = require ('./Wear');

class Patient {
  constructor (id) {
    this.status = Patient.NORMAL;

    this.patientID = id;

    this.bioSignal = null;
    this.wear = new Wear ();
    this.wear.patient = this;

    this.abnormalPulseRateDetector = new AbnormalPulseRateDetector (this);
    this.abnormalPulseRateDetector.startDetect ();
  }

  inputBioSignal (bioSignal) {
    this.bioSignal = bioSignal;
    this.abnormalPulseRateDetector.input (this.bioSignal.pulse);
  }

  wearBioWatch (bioWatch) {
    this.wear.wearBioWatch (bioWatch);
  }

  static get NORMAL () {
    return 0;
  }

  static get ALARM () {
    return 1;
  }

  static get WARNING () {
    return 2;
  }

  // inputPulse (pulse, dateAndTime = new Date ().getTime ()) {
  //   this.pulse = pulse;
  //   this.dateAndTime = dateAndTime;
  //   abnormalPulseRateDetector.input (pulse);
  // }
}

module.exports = Patient;