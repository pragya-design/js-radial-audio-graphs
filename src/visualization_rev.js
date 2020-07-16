var fileChosen = false;

var rAFID = null;
var analyser = null;
var sourceNode;

//var audioBuffer;

var microphone = null;
var hasSetupUserMedia = false;

var canvas = null;
var canvasContext = null;

//creating the audio context.
var AudioContext = AudioContext || webkitAudioContext;
//supporting webkitAudioContext because Safari still uses it
var context = new AudioContext();

//using requestAnimationFrame
if (!window.requestAnimationFrame)
  window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (f) {
      return setTimeout(f, 1000 / 60);
    };

$(function () {
  "use strict";
  initBinCanvas();
});

function playSample() {
  // #TODO change to the record input
  fileChosen = true;
  setupAudioNodes();

  var request = new XMLHttpRequest();
  /* 
  This enables a Web page to update just part of a page 
  without disrupting what the user is doing
  */

  //progress events - printing feedback on file opening status
  request.addEventListener("progress", updateProgress);
  request.addEventListener("load", transferComplete);
  request.addEventListener("error", transferFailed);
  request.addEventListener("abort", transferCanceled);

  // #TODO change to the record input
  request.open("GET", "src/sample-cello-sound.mp3", true);

  request.responseType = "arraybuffer";

  // When loaded - decoding the data
  request.onload = function () {

    onWindowResize();

    // decode the data
    context.decodeAudioData(
      request.response,
      function (buffer) {
        // when the audio is decoded play the sound
        sourceNode.buffer = buffer;
        sourceNode.start(0);
        $("#freqBars, body").addClass("animateHue");
        //on error
      },
      function (err) {
        //on error
        console.log(err);
      }
    );
  };

  request.send();

  $("button, input").prop("disabled", true);
}

var sourceNode;
function setupAudioNodes() {
/*
This piece analyzes the input audio to create visualization 
and collects time domain data repeatedly to draw an 
"oscilloscope style" output of the current audio input
Using HTML 5 Web Audio API - for audio processing in browser
*/
  // setup a analyser
  analyser = context.createAnalyser();
  // create a buffer source node
  sourceNode = context.createBufferSource();
  //connect source to analyser as link
  sourceNode.connect(analyser);
  // and connect source to destination
  sourceNode.connect(context.destination);
  //start updating
  rAFID = window.requestAnimationFrame(updateVisualization);
}

function updateVisualization() {
  if (fileChosen) {
    var array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);

    drawBars(array);
  }
  // setTextAnimation(array);
  rAFID = window.requestAnimationFrame(updateVisualization);
}

function drawBars(array) {
  //just show bins with a value over the treshold
  var threshold = 0;
  // clear the current state
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  //the max count of bins for the visualization
  var maxBinCount = array.length;
  //space between bins
  var space = 3;

  canvasContext.save();

  canvasContext.globalCompositeOperation = "source-over";

  canvasContext.scale(0.5, 0.5);
  canvasContext.translate(window.innerWidth, window.innerHeight);
  canvasContext.fillStyle = "#fff"; //light grey

  var bass = Math.floor(array[1]); //1 Hz Frequency
  var radius =
    0.3 * $(window).width() <= 450
      ? -(bass * 0.25 + 0.45 * $(window).width())
      : -(bass * 0.25 + 450);

  var bar_length_factor = 1;
  if ($(window).width() >= 785) {
    bar_length_factor = 1.0;
  } else if ($(window).width() < 785) {
    bar_length_factor = 1.5;
  } else if ($(window).width() < 500) {
    bar_length_factor = 20.0;
  }
  console.log("window resize width when drawing bars " + $(window).width());
  
  //go over each bin
  for (var i = 0; i < maxBinCount; i++) {
    var value = array[i];
    if (value >= threshold) {
      canvasContext.fillRect(
        0,
        radius,
        $(window).width() <= 450 ? 2 : 3,
        -value / bar_length_factor
      );
      canvasContext.rotate(((180 / 128) * Math.PI) / 180);
    }
  }

  for (var i = 0; i < maxBinCount; i++) {
    var value = array[i];
    if (value >= threshold) {
      canvasContext.rotate((-(180 / 128) * Math.PI) / 180);
      canvasContext.fillRect(
        0,
        radius,
        $(window).width() <= 450 ? 2 : 3,
        -value / bar_length_factor
      );
    }
  }

  for (var i = 0; i < maxBinCount; i++) {
    var value = array[i];
    if (value >= threshold) {
      canvasContext.rotate(((180 / 128) * Math.PI) / 180);
      canvasContext.fillRect(
        0,
        radius,
        $(window).width() <= 450 ? 2 : 3,
        -value / bar_length_factor
      );
    }
  }

  canvasContext.restore();
}

function initBinCanvas() {
  //adding new canvas
  "use strict";
  canvas = document.getElementById("freqBars");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  //getting context from canvas for drawing
  canvasContext = canvas.getContext("2d");

  canvasContext.canvas.width = window.innerWidth;
  canvasContext.canvas.height = window.innerHeight;

  window.addEventListener("resize", onWindowResize, false);

  //create gradient for the bins
  var gradient = canvasContext.createLinearGradient(
    0,
    canvas.height - 300,
    0,
    window.innerHeight - 25
  );
  gradient.addColorStop(1, "#00f"); //black
  gradient.addColorStop(0.75, "#f00"); //red
  gradient.addColorStop(0.25, "#f00"); //yellow
  gradient.addColorStop(0, "#ffff00"); //white

  canvasContext.fillStyle = "#9c0001";
}

function onWindowResize() {
  canvasContext.canvas.width = window.innerWidth;
  canvasContext.canvas.height = window.innerHeight;

  var containerHeight = $("#song_info_wrapper").height();
  var topVal = $(window).height() / 2 - containerHeight / 2;
  $("#song_info_wrapper").css("top", topVal);
  console.log("window resize top value " + topVal);


}

// Progress updates for playSample event
function updateProgress(oEvent) {
  if (oEvent.lengthComputable) {
    $("button, input").prop("disabled", true);
    var percentComplete = oEvent.loaded / oEvent.total;
    console.log(
      "Loading music file... " + Math.floor(percentComplete * 100) + "%"
    );
    $("#loading").html("Loading... " + Math.floor(percentComplete * 100) + "%");
  } else {
    // Unable to compute progress information since the total size is unknown
    console.log("Unable to compute progress info.");
  }
}

function transferComplete(evt) {
  console.log("The transfer is complete.");
  $("#loading").html("");
  //$("button, input").prop("disabled",false);
}

function transferFailed(evt) {
  console.log("An error occurred while transferring the file.");
  $("#loading").html("Loading failed.");
  $("button, input").prop("disabled", false);
}

function transferCanceled(evt) {
  console.log("The transfer has been canceled by the user.");
  $("#loading").html("Loading canceled.");
}
