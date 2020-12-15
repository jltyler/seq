import Sequence from './sequence.js';

/**
 * Holds and controls several sequences and samples
 */
class BeatSequencer {
    /**
     * Create a new BeatSequencer
     * @param {AudioContext} context AudioContext instance to play sounds into
     */
    constructor(context, steps, bpm) {
        this.context = context;
        this.sequences = [];
        this.samples = [];
        this.tracks = 0
        this.steps = steps;
        this.bpm = bpm;
    }

    /**
     * Adds a new sequence
     * @param {Number} index Index of sample in sample array
     * @returns {Number} Index of new Sequence in array
     */
    addSequence(index) {
        const sample = this.getSample(index);
        this.sequences.push(new Sequence(this.context, sample, this.steps, 1 / (this.bpm / 60 ) * 0.25));
        this.tracks++;
    }

    /**
     * Return sequence instance
     * @param {Number} index Index of sequence
     * @returns {Sequence} Sequence instance or null
     */
    getSequence(index) {
        return this.sequences[index];
    }

    /**
     * Add a new sample
     * @param {AudioBuffer} sample AudioBuffer to use for sources
     * @returns {Number} Index of new sample
     */
    addSample(sample) {
        this.samples.push(sample);
        return this.samples.length - 1;
    }

    /**
     * Return sample AudioBuffer instance
     * @param {Number} index Index of sample
     * @returns {AudioBuffer} Sample instance or null
     */
    getSample(index) {
        return this.samples[index];
    }

    start() {
        for (let i = 0; i < this.sequences.length; i++) {
            const element = this.sequences[i];
            element.startNow();
        }
    }

    stop() {
        for (let i = 0; i < this.sequences.length; i++) {
            const element = this.sequences[i];
            element.stopNow();
        }
    }
}

const initialize = () => {
    const context = new AudioContext();
    const numSteps = 32;
    const BPM = 140;
    const beats = new BeatSequencer(context, numSteps, BPM);

    const buttonPlay = document.getElementById("button-play");
    const buttonStop = document.getElementById("button-stop");

    buttonPlay.addEventListener("click", () => {
        beats.start();
    });

    buttonStop.addEventListener("click", () => {
        beats.stop();
    })

    const addTrack = (buffer) => {
        if (buffer) {
            const i = beats.addSample(buffer);
            beats.addSequence(i);
        }
    };

    attemptLoadAudio(context, './kick.ogg', addTrack);
    attemptLoadAudio(context, './snare1.ogg', addTrack);
    attemptLoadAudio(context, './hat.ogg', addTrack);
    attemptLoadAudio(context, './ice.ogg', addTrack);
    attemptLoadAudio(context, './clap.ogg', addTrack);
    attemptLoadAudio(context, './wood.ogg', addTrack);

    const elementTracks = document.getElementsByClassName("track-container");
    for (let i = 0; i < elementTracks.length; i++) {
        const e = elementTracks.item(i);
        e.innerHTML = generateMeasuresPlural(numSteps);
        e.querySelectorAll("li").forEach((b,j) => {
            b.addEventListener("click", () => {
                beats.getSequence(i).toggle(j);
                b.className = beats.getSequence(i).track[j] ? "on" : "off"
            });
        });
    }
};

const generateHTML = (beat) => {

};

const generateMeasuresPlural = (total) => {
    let string = "";
    for (let i = 0; i < total / 4; i++) {
        string += generateMeasure();
    }
    return string;
};

const generateMeasure = (num = 4) => {
    let string = "<ul class=\"measure\">";
    while(num-- > 0) {
        string += "<li class=\"off\">[ ]</li>";
    }
    string += "</ul>";
    return string;
}

/**
 * Attempts to laod a file asynchronously and place it into an AudioBuffer
 * @param {AudioContext} context AudioContext instance
 * @param {String} filename File name of sound
 * @param {Function} onsuccess Callback with AudioBuffer parameter on successful load
 * @param {Function} onerror Callback with String parameter on error
 */
const attemptLoadAudio = (context, filename, onsuccess, onerror) => {
    const req = new XMLHttpRequest;
    req.open("GET", filename, true);
    req.responseType = "arraybuffer";

    req.onload = () => {
        context.decodeAudioData(req.response, onsuccess, onerror);
    };

    req.onerror = () => {
        if (onerror) onerror("XHR Error!");
    };

    req.send();
};

export default {
    initialize
};