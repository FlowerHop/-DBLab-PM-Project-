let AbnormalPulseRateDetector = require ('./AbnormalPulseRateDetector');
let Wear = require ('./Wear');

class Patient {
  constructor (id) {
    const NORMAL = 0;
    const ALARM = 1;
    const WARNING = 2;
    
    this.status = NORMAL;

    this.patientID = id;

    this.bioSignal = null;
    this.wear = new Wear ();
    this.wear.patient = this;

    this.abnormalPulseRateDetector = new AbnormalPulseRateDetector (this);
  }

  inputBioSignal (bioSignal) {
    this.bioSignal = bioSignal;
    abnormalPulseRateDetector.input (this.bioSignal.pulse);
  }

  wearBioWatch (bioWatch) {
    this.wear.wearBioWatch (bioWatch);
  }


  // inputPulse (pulse, dateAndTime = new Date ().getTime ()) {
  //   this.pulse = pulse;
  //   this.dateAndTime = dateAndTime;
  //   abnormalPulseRateDetector.input (pulse);
  // }
}

module.exports = Patient;