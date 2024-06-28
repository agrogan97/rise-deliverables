

var audio_ctx = new(window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext);

function audioBeep(duration, frequency, finishedCallback) {
  var audio_osc = audio_ctx.createOscillator();
  audio_osc.connect(audio_ctx.destination);

  if (typeof finishedCallback != "function") {
    finishedCallback = function () {};
  }
  audio_osc.frequency.value = frequency;
  audio_osc.noteOn(0);

  setTimeout(
    function () {
      audio_osc.noteOff(0);
      finishedCallback();
    },
    duration
  );
};

function audioLow(finishedCallback) {
  audioBeep(100,400),finishedCallback;
};

function audioHigh(finishedCallback) {
  audioBeep(100,1200,finishedCallback);
};
