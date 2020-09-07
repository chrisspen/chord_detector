var currentChroma = new Float32Array(12)
var currentPitches = new Float32Array(12*2)

var chromaVisualizationCtx;
var pitchVisualizationCtx;
var pitchSum = 0;

const referenceOctave = 3;
const pitchCanvasWidth = 40*12*3;

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
  chromaVisualizationCtx = $('#chroma-visualizer canvas').get(0).getContext('2d');
  const gradient1 = chromaVisualizationCtx.createLinearGradient(0, 0, 0, 512);
  gradient1.addColorStop(1, '#000000');
  gradient1.addColorStop(0.75, '#2ecc71');
  gradient1.addColorStop(0.25, '#f1c40f');
  gradient1.addColorStop(0, '#e74c3c');
  chromaVisualizationCtx.font="20px Georgia";

  $('#pitches-visualizer').html('<canvas width="'+pitchCanvasWidth+'" height="256">');
  pitchVisualizationCtx = $('#pitches-visualizer canvas').get(0).getContext('2d');
  const gradient2 = pitchVisualizationCtx.createLinearGradient(0, 0, 0, 512);
  gradient2.addColorStop(1, '#000000');
  gradient2.addColorStop(0.75, '#2ecc71');
  gradient2.addColorStop(0.25, '#f1c40f');
  gradient2.addColorStop(0, '#e74c3c');
  pitchVisualizationCtx.font="20px Georgia";

  notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  function updateVisualization() {
    requestAnimationFrame(updateVisualization);

    chromaVisualizationCtx.clearRect(0, 0, 480, 250);
    for (let i = 0; i < currentChroma.length; i++) {
      const value = currentChroma[i];
      chromaVisualizationCtx.fillStyle = gradient1;
      // the max value we've seen in a chroma is >50
      chromaVisualizationCtx.fillRect(i * 40, 250, 39, value * -5);
      chromaVisualizationCtx.fillStyle = 'black';
      chromaVisualizationCtx.fillText(notes[i], (i * 40)+3, 250);
    }

    pitchVisualizationCtx.clearRect(0, 0, pitchCanvasWidth, 250);
    //console.log('currentPitches.length:'+currentPitches.length)
    for (let i = 0; i < currentPitches.length; i++) {
      const value = currentPitches[i];
      pitchVisualizationCtx.fillStyle = gradient2;
      // the max value we've seen in a chroma is >50
      pitchVisualizationCtx.fillRect(i * 40, 250, 39, value * -5);
      pitchVisualizationCtx.fillStyle = 'black';
      pitchVisualizationCtx.fillText(notes[i%notes.length] + (referenceOctave + parseInt(i/12)), (i * 40)+3, 250);
    }

  }
  updateVisualization()

  chromagramWorker.addEventListener('message', function (ev) {
    currentChroma = ev.data.currentChroma
    output.html("Is it " + ev.data.rootNote + " " + ev.data.quality + " " + ev.data.intervals + "?")
    console.log('current pitches:')
    currentPitches = ev.data.currentPitches
    //console.log(ev.data.currentPitches)
    pitchSum = currentPitches.reduce(function(a, b){ return a + b; }, 0);
    console.log('pitchSum:'+pitchSum)
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
