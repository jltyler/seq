import Tracker from './tracker.js';

const initialize = () => {
    const context = new AudioContext();
    const numSteps = 32;
    const BPM = 140;
    const tracker = new Tracker(context, numSteps, BPM);

    const buttonPlay = document.getElementById("button-play");
    const buttonStop = document.getElementById("button-stop");

    const tracksContainer = document.getElementById("tracks-container");

    buttonPlay.addEventListener("click", () => {
        tracker.start();
    });

    buttonStop.addEventListener("click", () => {
        tracker.stop();
    })

    const addTrack = (name, buffer) => {
        if (buffer) {
            const i = tracker.addSample(buffer);
            tracker.addSequence(i);
            addTrackElement(name);
        }
    };

    const addTrackElement = (name) => {
        console.log(`Adding track html for "${name}"...`);
        let html = `<div class="track"><h3>${name}</h3>`;
        html += generateMeasuresPlural(numSteps) + "</div>";
        tracksContainer.innerHTML += html;
    };

    attemptLoadAudio(context, './kick.ogg', addTrack);
    attemptLoadAudio(context, './snare1.ogg', addTrack);
    attemptLoadAudio(context, './hat.ogg', addTrack);
    attemptLoadAudio(context, './ice.ogg', addTrack);
    attemptLoadAudio(context, './clap.ogg', addTrack);
    attemptLoadAudio(context, './wood.ogg', addTrack);

    const addBeatEvents = () => {
        const elementTracks = document.getElementsByClassName("track");
        for (let i = 0; i < elementTracks.length; i++) {
            const e = elementTracks.item(i);
            e.querySelectorAll("li").forEach((b,j) => {
                b.addEventListener("click", () => {
                    tracker.getSequence(i).toggle(j);
                    b.className = tracker.getSequence(i).track[j] ? "on" : "off"
                });
            });
        }
    };

    window.setTimeout(addBeatEvents, 2000);
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
        string += "<li class=\"off\">#</li>";
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