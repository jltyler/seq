import Animator from './animator.js';
import Tracker from './tracker.js';

const initialize = () => {
    const context = new AudioContext();
    const numSteps = 32;
    const BPM = 140;
    const tracker = new Tracker(context, numSteps, BPM);
    const animator = new Animator(context);

    const buttonPlay = document.getElementById("button-play");
    const buttonStop = document.getElementById("button-stop");

    const tracksContainer = document.getElementById("tracks-container");

    const addTrack = (name, buffer) => {
        if (buffer) {
            const i = tracker.addSample(buffer);
            tracker.addSequence(i);
            addTrackElement(name);
        }
    };

    const addTrackElement = (name) => {
        console.log(`Adding track html for "${name}"...`);
        const trackId = tracker.numTracks() - 1;
        let html = `<div class="track" data-id="${trackId}">`;
        html += `<div><h3>${name}</h3>`;
        html += `<input type="range" min="0.01" max="1.0" value="1.0" step="0.01" class="gain-slider" data-id="${trackId}">`;
        html += `<input type="range" min="0.01" max="3.0" value="1.0" step="0.01" class="speed-slider" data-id="${trackId}">`;
        html += `<input type="range" min="0.01" max="1.0" value="1.0" step="0.01" class="gate-slider" data-id="${trackId}">`;
        html += `</div>`;
        html += "<div>" + generateMeasuresPlural(numSteps) + "</div></div>";
        tracksContainer.innerHTML += html;
    };

    attemptLoadAudio(context, './kick.ogg', addTrack);
    attemptLoadAudio(context, './snare1.ogg', addTrack);
    attemptLoadAudio(context, './hat.ogg', addTrack);
    attemptLoadAudio(context, './ice.ogg', addTrack);
    attemptLoadAudio(context, './clap.ogg', addTrack);
    attemptLoadAudio(context, './wood.ogg', addTrack);

    buttonPlay.disabled = true;
    buttonStop.disabled = true;
    // Add events for beat elements... after a short time
    const initializeDOMStuff = () => {
        buttonPlay.disabled = false;
        buttonStop.disabled = false;
        animator.init(tracksContainer, tracker.getSequence(0));
        const elementTracks = document.getElementsByClassName("track");
        for (let i = 0; i < elementTracks.length; i++) {
            const e = elementTracks.item(i);
            e.querySelector("input.gain-slider").addEventListener("input", (e) => {
                tracker.getSequence(i).gain = parseFloat(e.target.value);
            });
            e.querySelector("input.speed-slider").addEventListener("input", (e) => {
                tracker.getSequence(i).speed = parseFloat(e.target.value);
            });
            e.querySelector("input.gate-slider").addEventListener("input", (e) => {
                tracker.getSequence(i).gate = parseFloat(e.target.value);
            });
            e.querySelectorAll("li").forEach((b,j) => {
                b.addEventListener("click", () => {
                    tracker.getSequence(i).toggle(j);
                    b.className = tracker.getSequence(i).track[j] ? "on" : "off";
                });
            });

        }
    };



    window.setTimeout(initializeDOMStuff, 2000);

    buttonPlay.addEventListener("click", () => {
        const s = tracker.getSequence(0);
        if (!s.running) tracker.start();
        animator.start();
    });

    buttonStop.addEventListener("click", () => {
        tracker.stop();
        tracker.stop();
        animator.stop();
    });

    document.getElementById("bpm-input").addEventListener("input", (e) => {
        tracker.setBPM(parseFloat(e.target.value));
    });

    document.getElementById("effect-selector").addEventListener("change", (e) => {
        console.log('e.target.value:', e.target.value);
        tracker.setEffect(e.target.value);
    });
};

/**
 * Generates and returns measures (plural) as an html string
 * @param {Number} num Number of measures
 * @returns {String} HTML
 */
const generateMeasuresPlural = (total) => {
    let string = "";
    for (let i = 0; i < total / 4; i++) {
        string += generateMeasure(4, i * 4);
    }
    return string;
};

/**
 * Generates and returns a measure as an html string
 * @param {Number} num Number of beats
 * @param {Number} index Starting id for
 * @returns {String} HTML
 */
const generateMeasure = (num = 4, index = 0) => {
    let string = "<ul class=\"measure\">";
    for (let i = 0; i < num; ++i) {
        string += `<li class="off" data-id="${index + i}">#</li>`;
    }
    string += "</ul>";
    return string;
}

/**
 * Returns filename string sans path and extension
 * @param {String} filename Name to trim
 * @returns {String} Trimmed name
 */
const trimName = (filename) => {
    const f = filename.slice(filename.lastIndexOf("/") + 1).split(".")[0];
    return f[0].toUpperCase() + f.slice(1);
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
        context.decodeAudioData(req.response, onsuccess.bind(null, trimName(filename)), onerror);
    };

    req.onerror = () => {
        if (onerror) onerror("XHR Error!");
    };

    req.send();
};

export default {
    initialize
};