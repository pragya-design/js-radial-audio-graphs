//@author Pragya Gupta / NBBJ Digital / https://github.com/pragya-design


function setupAudioNodes() {
    /*
    The AnalyserNode interface represents a node 
    able to provide real-time frequency and 
    time-domain analysis information. 
    It is an AudioNode that passes the audio stream
    unchanged from the input to the output, 
    but allows you to take the generated data, 
    process it, and create audio visualizations.
    */
    // initializing analyser node
    analyser = contextAudio.createAnalyser();
    // hooking a buffer source node
    sourceNode = contextAudio.createBufferSource();
    //connect source to analyser as link
    sourceNode.connect(analyser);
    // and connect source to destination so that
    // sound will produce visuals
    sourceNode.connect(contextAudio.destination);
  }
  
  function playAudio(buffer) {
    // when the audio is decoded play the sound
    // Syntax: AudioBufferSourceNode.start([when][, offset][, duration]);
    sourceNode.buffer = buffer;
    sourceNode.start(0);
  }
