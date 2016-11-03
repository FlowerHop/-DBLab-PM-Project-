class AbnormalPulseRateDetector {
  constructor (patient) {
    const PPG_SAMPLE_FREQUENCY = 5; // s
    const UPPER_PR = 120;
    const BOTTOM_PR = 60;
    const DETECT_INTERVAL = 1000;

    this.patient = patient;
    this.ppgTimeCounter = 0;
    this.ppgAbnormalCounts = 0;
    this.ppgNormalCounts = 0;

    this.ppgClocker = -1;
  }

  input (pr) {
    this.ppgTimeCounter = 0;

    if (pr <= UPPER_PR && pr >= BOTTOM_PR) { // normal
      this.normal_counts++;
    } else if (pr >= UPPER_PR && pr <= BOTTOM_PR) { // abnormal
      this.abnormal_count++;
    }
  }

  startDetect () {
    if (this.ppgClocker == -1) {
      this.ppgClocker = setInterval (detectStatus, AbnormalPulseRateDetector.DETECT_INTERVAL);  
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
      if (this.ppgTimeCounter >= 600000) {
        // raise warning
        this.setStatus (Patient.WARNING);
      } else {
        if (normal_counts > 300000) {
          this.setStatus (Patient.NORMAL);
          abnormal_counts = normal_counts = 0;
        } 

        if (abnormal_counts > 180000) {
          // raise an alarm
          this.setStatus (Patient.ALARM);
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
}

module.exports = AbnormalPulseRateDetector;