"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LiveIn = function () {
  function LiveIn() {
    _classCallCheck(this, LiveIn);

    this.patient = null;
    this.place = null;
  }

  _createClass(LiveIn, [{
    key: "liveIn",
    value: function liveIn(place) {
      this.place = null;
      this.patient.liveIn = this;
    }
  }]);

  return LiveIn;
}();