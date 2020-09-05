var currentChroma = new Float32Array(12)

var webworkify = require('webworkify');
var chromagramWorker = webworkify(require('./worker.js'))

$(function() {
  let audioCtx;// = new AudioContext();
  let source;
  let processor;

  var output = $('#chord-detection')

  const player = document.getElementById('player');


  //$('audio').on('play', function(event) {
    //// pause and reset other elements
    //$('audio').each((idx, el) => {
      //if (el == this) return
      //el.pause()
      //el.currentTime = 0
    //})

    //source = audioCtx.createMediaElementSource(this)
    //$(this).on('ended', () => {
      //currentChroma.fill(0)
      //source.disconnect()
      //this.currentTime = 0
    //})
    //source.connect(scriptNode)
    //source.connect(audioCtx.destination)
  //})


  $('#chroma-visualizer').html('<canvas width="800" height="256">');
  visualizationCtx = $('#chroma-visualizer canvas').get(0).getContext('2d');
  const gradient = visualizationCtx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(1, '#000000');
  gradient.addColorStop(0.75, '#2ecc71');
  gradient.addColorStop(0.25, '#f1c40f');
  gradient.addColorStop(0, '#e74c3c');
  visualizationCtx.font="20px Georgia";
  notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  function updateVisualization() {
    requestAnimationFrame(updateVisualization);

    visualizationCtx.clearRect(0, 0, 480, 250);

    for (let i = 0; i < currentChroma.length; i++) {
      const value = currentChroma[i];
      visualizationCtx.fillStyle = gradient;
      // the max value we've seen in a chroma is >50
      visualizationCtx.fillRect(i * 40, 250, 39, value * -5);

      visualizationCtx.fillStyle = 'black';
      visualizationCtx.fillText(notes[i], (i * 40)+3, 250);
    }
  }
  updateVisualization()

  chromagramWorker.addEventListener('message', function (ev) {
    currentChroma = ev.data.currentChroma
    output.html("Is it " + ev.data.rootNote + " " + ev.data.quality + " " + ev.data.intervals + "?")
  })

  const handleSuccess = function(stream) {

    audioCtx = new AudioContext();
    source = audioCtx.createMediaStreamSource(stream);
    processor = audioCtx.createScriptProcessor(1024, 1, 1);

    source.connect(processor);
    processor.connect(audioCtx.destination);
    
    processor.onaudioprocess = function(event) {
      var audioData = event.inputBuffer.getChannelData(0)
      chromagramWorker.postMessage({audioData: audioData, sentAt: performance.now()})
    }
    processor.connect(audioCtx.destination)
  
  };
  navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(handleSuccess);

})
