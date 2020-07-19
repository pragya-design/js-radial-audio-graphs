

function initBinCanvas() {
    //adding new canvas
    "use strict";
    canvas = document.getElementById("viewAudioCanvas");
    //var svgAudio = document.getElementById('viewAudio');
    //getting context from canvas for drawing
    contextCanvas = canvas.getContext("2d");
  
    contextCanvas.canvas.width = window.innerWidth;
    contextCanvas.canvas.height = window.innerHeight;
  
    // console.log(
    //   "canvas size = ",
    //   contextCanvas.canvas.width,
    //   ",",
    //   contextCanvas.canvas.height
    // );
  
    window.addEventListener("resize", onWindowResize, false); //WHY
  }
  
  function onWindowResize() {
    console.log("window resizing");
    contextCanvas.canvas.width = window.innerWidth;
    contextCanvas.canvas.height = window.innerHeight;
  
  }
  
