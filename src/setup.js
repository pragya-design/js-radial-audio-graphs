/*
@author Pragya Gupta / NBBJ Digital / https://github.com/pragya-design

This section of the Urban Harmony app uses the HTML 5 Web Audio API 
- which enables audio processing in browser
The Web Audio API is a simple API that takes input sources
and connects those sources to nodes which can process the 
audio data and ultimately to a speaker so that the user can hear it.

This file is based on instructions from
https://www.oreilly.com/library/view/web-audio-api/9781449332679/
and explanation from
https://www.youtube.com/watch?v=xmGv_Schm5U
 */

var fileChosen = false;
var rAFUpdate = null;
var contextAudio = null;

var canvas = null;
var contextCanvas = null;

var sourceNode;
var analyser = null;

var dBFreqArray = null;

// INITIALIZING AUDIO CONTEXT
/*
The audio context is a directed graph of audio nodes that defines 
how the audio stream flows from its source (audio file) 
to its destination (peakers). 
As audio passes through each node, 
its properties can be modified or inspected.
*/
// supporting webkitAudioContext because Safari still uses it
var AudioContext =
  window.AudioContext ||
  window.webkitAudioContext ||
  window.mozAudioContext ||
  window.oAudioContext ||
  window.msAudioContext;
if (AudioContext) {
  // Web Audio API is available
  var contextAudio = new AudioContext();
} else {
  // Web Audio API is not available. Asking the user to use a supported browser
  alert(
    "This functionality is not supported in your browser, " +
      "please use Chrome, Firefox, Safari or Edge"
  );
}

//SUPPORTING requestAnimationFrame
if (!window.requestAnimationFrame)
  window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      return setTimeout(callback, 1000 / 60);
    };

// INITIALIZING CANVAS
$(function () {
  "use strict";
  initBinCanvas();
});

function playAll() {
  /*
  This function:
  1. sets up the audio nodes (for analysis and playback)
  2. opens the audio file and stores response as arraybuffer 'audioData'
  3. plays the audio
  4. updates animation frame
  */
  
  
  fileChosen = true;

  //SETTING UP AUDIO NODES
  setupAudioNodes();

  /* 
  LOADING THE AUDIO FILE
  We are using an XMLHttpRequest and 
  processing the results with context.decodeAudioData
  
  XMLHttpRequest enables a Web page to update just part of a page 
  without disrupting what the user is doing.
  */
  var request = new XMLHttpRequest();
  
  //progress events - printing feedback on file opening status
  request.addEventListener("progress", updateProgress);
  request.addEventListener("load", transferComplete);
  request.addEventListener("error", transferFailed);
  request.addEventListener("abort", transferCanceled);

  // #TODO change input source
  request.open("GET", "src/sample-cello-sound.mp3", true);
  request.responseType = "arraybuffer";

  request.onload = function () {
    var audioData = request.response;
    // console.log("audio arraybuffer = ", audioData)
    onWindowResize();
    /*
    The decoded AudioBuffer is resampled to the AudioContext's sampling rate, 
    then passed to a callback or promise.
    Syntax:
    baseAudioContext.decodeAudioData(ArrayBuffer, successCallback, errorCallback);
    */
    contextAudio.decodeAudioData(audioData, playAudio, function (err) {
      console.log(err);
    });
  };

  request.send();

  $("button, input").prop("disabled", true); //Maybe not needed

  //START UPDATING CANVAS WITH VISUALIZATION
  rAFUpdate = window.requestAnimationFrame(updateVisualization);
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





