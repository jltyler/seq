import Sequence from './sequence.js';

let kickSample;
let kickBuffer;

const initialize = () => {
    const context = new AudioContext();
    kickBuffer = context.createBuffer(2, context.sampleRate * 1.5, context.sampleRate);
    const audioKickElement = document.getElementById("audio-sample-0");
    // const kickSample = context.createMediaElementSource(audioKickElement);
    const buttonPlay = document.getElementById("button-play");
    const buttonStop = document.getElementById("button-stop");


    loadKickSample(context);
    const sequence = new Sequence(context, kickBuffer, 16, 0.1153);

    sequence.setStepOn(0);
    sequence.setStepOn(4);
    sequence.setStepOn(8);
    sequence.setStepOn(12);
    sequence.setStepOn(14);

    buttonPlay.addEventListener("click", () => {
        // const buffSource = context.createBufferSource();
        // buffSource.connect(context.destination);
        // buffSource.buffer = kickBuffer;
        // buffSource.start(context.currentTime);
        // buffSource.stop(context.currentTime + 5);

        sequence.startNow();
    });

    buttonStop.addEventListener("click", () => {
        sequence.stopNow();
    })
};

const kickLoadSuccess = (buffer) => {
    if (!buffer) console.error("Success but error during decoding!");
    kickBuffer = buffer;
}

const kickLoadFailure = () => {
    console.error("Failure on decoding!");
}

const loadKickSample = (context) => {
    if (!context) {
        console.error("Invalid AudioContext provided!");
        return;
    }
    const req = new XMLHttpRequest;
    req.open("GET", "./kick.ogg", true);
    req.responseType = "arraybuffer";

    req.onload = () => {
        console.log("Loaded file.\nDecoding...");
        console.log("req:", req);
        context.decodeAudioData(req.response, kickLoadSuccess, kickLoadFailure);
    };

    req.onerror = () => {
        console.log("XHR Error!");
    };

    req.send();
};

export default {
    initialize
};