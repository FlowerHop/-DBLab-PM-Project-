let Patient;

class AbnormalPulseRateDetector {
  constructor (patient) {
    this.patient = patient;
    this.ppgTimeCounter = 0;
    this.ppgAbnormalCounts = 0;
    this.ppgNormalCounts = 0;

    this.ppgClocker = -1;
    Patient = require ('./Patient');
  }

  input (pr) {
    this.ppgTimeCounter = 0;
    this.patient.status = Patient.NORMAL;

    if (pr <= AbnormalPulseRateDetector.UPPER_PR && pr >= AbnormalPulseRateDetector.BOTTOM_PR) { // normal
      this.normal_counts++;
    } else if (pr >= AbnormalPulseRateDetector.UPPER_PR && pr <= AbnormalPulseRateDetector.BOTTOM_PR) { // abnormal
      this.abnormal_count++;
    }
  }

  startDetect () {
    if (this.ppgClocker == -1) {
      this.ppgClocker = setInterval (this.detectStatus.bind (this), AbnormalPulseRateDetector.DETECT_INTERVAL);  
    }
  }

  stopDetect () {
    if (this.ppgClocker != -1) {
      clearInterval (this.ppgClocker);
      this.ppgClocker = -1;
    }
  }

  detectStatus () {
    this.ppgTimeCounter++;
      if (this.ppgTimeCounter >= 60) {
        // raise warning
        this.patient.status = Patient.WARNING;
      } else {
        if (this.normal_counts > 300) {
          this.patient.status = Patient.NORMAL;
          this.abnormal_counts = this.normal_counts = 0;
        } 

        if (this.abnormal_counts > 180) {
          // raise an alarm
          this.patient.status = Patient.ALARM;
        }
      }

      // if new pulse rate input: 
      //     if abnormal -> abnormal_counts + 1
      //     if normal -> normal_counts + 1
      // if no data input for 10 mins:
      //     raise a warning message
      // if normal_counts > 300 // about 5 mins
      //     abnormal_counts = normal_counts = 0
      // if abnormal_counts > 180
      //     raise an alarm
  }

  static get PPG_SAMPLE_FREQUENCY () {
    return 5;
  }

  static get UPPER_PR () {
    return 120;
  }

  static get BOTTOM_PR () {
    return 60;
  }

  static get DETECT_INTERVAL () {
    return 1000;
  }
}

module.exports = AbnormalPulseRateDetector;