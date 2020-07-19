//@author Pragya Gupta / NBBJ Digital / https://github.com/pragya-design


function updateVisualization() {
    /*
      Based on instructions from 
      https://www.oreilly.com/library/view/web-audio-api/9781449332679/ch05.html
      */
    if (fileChosen) {
      //getting frequency domain of sound
      var dBFreqArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dBFreqArray);
      // console.log("frequency domain array = ", dBFreqArray);
      drawRadialBars(dBFreqArray);
    }
    rAFUpdate = window.requestAnimationFrame(updateVisualization);
  }
  
  function drawRadialBars(dBFreqArray) {
    //width of bar
    var barWidth = 3;
  
    //PREPPING CANVAS
    // clear the current state
    contextCanvas.clearRect(0, 0, viewAudioCanvas.width, viewAudioCanvas.height);
    contextCanvas.save(); //not sure why
    contextCanvas.globalCompositeOperation = "source-over";
    contextCanvas.scale(0.5, 0.5);
    // Remember: origin of canvas is in its center
    // while origin of SVG is 0,0
    contextCanvas.translate(window.innerWidth, window.innerHeight);

    //Syntax: context.createRadialGradient(x0,y0,r0,x1,y1,r1);
    var gradient = contextCanvas.createLinearGradient(0, 0, 0, 170);
    gradient.addColorStop(0, "black");
    gradient.addColorStop(1, "white");
    contextCanvas.fillStyle = gradient;

    // contextCanvas.fillStyle = "#fff"; //light grey
  
    var lowFreqValue = dBFreqArray[1];
    // console.log("draw bars bass = ", bass);
  
    var radius =
      // Width of browser viewport using jQuery
      0.3 * $(window).width() <= 450 //boolean
        ? -(lowFreqValue * 0.25 + 0.2 * $(window).width())
        //changing the multiplier has most effect on radius
        : -(lowFreqValue * 0.25 + 450);
  
    var bar_length_factor = 1;
    if ($(window).width() >= 785) {
      bar_length_factor = 0.75;
    } else {
      bar_length_factor = 1.5;
    }
   
    for (var i = 0; i < dBFreqArray.length; i++) {
      var value = dBFreqArray[i];
      fillCanvas(radius,barWidth, bar_length_factor, value );
      rotateCanvas(180);
    }
    for (var i = 0; i < dBFreqArray.length; i++) {
      var value = dBFreqArray[i];
      rotateCanvas(-180);
      fillCanvas(radius,barWidth, bar_length_factor, value);
    }
    for (var i = 0; i < dBFreqArray.length; i++) {
      var value = dBFreqArray[i];
      rotateCanvas(180);
      fillCanvas(radius,barWidth, bar_length_factor, value);
    }
  
    contextCanvas.restore();
  }
  
  function rotateCanvas(angleDegree) {
    contextCanvas.rotate(((angleDegree / 128) * Math.PI) / 180);
  }
  
  function fillCanvas(radius,barWidth, bar_length_factor, value) {
    contextCanvas.fillRect(
      0,
      radius,
      $(window).width() <= 450 ? barWidth - 1 : barWidth,
      -value / bar_length_factor
    );
  }