/**
 * A class that can schedule starting and stopping source nodes with a rhythm.
 */
class Sequence {
    /**
     * Create a new sequence
     * @param {AudioContext} context Context to play audio through
     * @param {AudioBuffer} source Source buffer to play
     * @param {Number} steps Number of steps in sequence
     * @param {Number} stepLength Length of each step
     */
    constructor(context, source, steps, stepLength) {
        this.context = context;
        this.source = source;
        this.steps = steps;
        this.stepLength = stepLength;
        this.destination = context.destination;

        this.measureLength = stepLength * steps;
        // Boolean array
        this.track = new Array(this.steps).map(() => false);
        // this.retriggers = Array(this.steps).map(() => false);
        /**
         * @type {AudioBufferSourceNode[]}
         */
        this.currentSources = new Array(this.steps);
        /**
         * @type {AudioBufferSourceNode[]}
         */
        this.previousSources = [];

        this.bufferTime = 0.5;
        this.running = false;
        this.currIndex = 0;
        this.scheduleInterval = 400;
        this.gate = 1.0;
        this.speed = 1.0;
        this.gain = 1.0;

        // Echo
        this.delay = context.createDelay(2.0);
        this.delayDecay = context.createGain();

        this.delay.delayTime.value = 1.0;
        this.delayDecay.gain.value = 0.0;

        this.delay.connect(this.delayDecay).connect(this.delay);
        this.delayDecay.connect(context.destination);

        // This method is used in events
        this.schedule = this.schedule.bind(this);
    }

    /**
     * Start playing the sequence immediately
     */
    startNow() {
        this.startTime = this.context.currentTime;
        this.running = true;
        this.schedule();
    }

    /**
     * As long as running is true, continuously schedules entire measure if at or approaching next measure.
     */
    schedule() {
        if (!this.running) return;
        if (this.context.currentTime > this.startTime - this.bufferTime) {
            this.previousSources = this.currentSources.slice();
            for (let i = 0; i < this.track.length; i++) {
                if (this.track[i]) {
                    const s = this.context.createBufferSource();
                    s.buffer = this.source;
                    const g = this.context.createGain();
                    g.gain.value = this.gain;
                    s.connect(g).connect(this.destination);
                    g.connect(this.delay);
                    s.start(this.startTime + this.stepLength * i);
                    s.playbackRate.value = this.speed;
                    s.stop(this.startTime + this.stepLength * i + this.gate * this.source.duration);
                    this.currentSources[i] = s;
                }
            }
            // Next startTime is at the end of the current measure
            this.startTime += this.measureLength;
        }
        // if (this.running) {
        setTimeout(this.schedule, this.scheduleInterval);
        // }
    }

    /**
     * If running, stops. If not running, force stops all sources in array.
     */
    stopNow() {
        if (!this.running) {
            for (let i = 0; i < this.currentSources.length; i++) {
                if (this.currentSources[i]) {
                    this.currentSources[i].stop();
                    this.currentSources[i] = null;
                }
                if (this.previousSources[i]) {
                    this.previousSources[i].stop();
                    this.previousSources[i] = null;
                }
            }
            return;
        }
        this.running = false;
        this.currIndex = 0;
    }

    setStepOn(index) {
        if (index >= this.track.length) return;
        this.track[index] = true;
    }

    setStepOff(index) {
        if (index >= this.track.length) return;
        this.track[index] = false;
    }

    toggle(index) {
        if (index >= this.track.length) return;
        this.track[index] = !this.track[index];
    }

    toggleAll() {
        for (let i = 0; i < this.track.length; i++) {
            this.track[i] = !this.track[i];
        }
    }

    /**
     * Change the audio buffer to be played by the source nodes
     * @param {AudioBuffer} newBuffer New AudioBuffer instance
     */
    setBuffer(newBuffer) {
        this.source = newBuffer;
    }

    /**
     * Set all beats to provided value
     * @param {Boolean} value On or off
     */
    setAll(value) {
        for (let i = 0; i < this.track.length; i++) {
            this.track[i] = value;
        }
    }

    /**
     * Set nth indexes on and all others off
     * @param {Number} n Number
     * @param {Number} shift Modulo value
     * @param {Number} start Starting index
     * @param {Number} stop Stopping index
     */
    nthOn(n, shift = 0, start = 0, stop = -1) {
        if (stop === -1) stop = this.track.length;
        if (shift >= n) shift = shift % n;
        for (let i = start; i < stop; i++) {
            this.track[i] = (i % n == shift);
        }
    }

    /**
     * Sets new step length AKA seconds per beat
     * @param {Number} newStepLength new step length in seconds
     */
    setStepLength(newStepLength) {
        this.stepLength = newStepLength;
        this.measureLength = newStepLength * this.steps;
    }

    setEchoDelay(newDelay) {
        this.delay.delayTime.value = newDelay;
    }

    setEchoGain(newGain) {
        this.delayDecay.gain.value = newGain;
    }

    setDestination(newDestination) {
        this.destination = newDestination;
        this.delayDecay.disconnect();
        this.delayDecay.connect(this.delay);
        this.delayDecay.connect(newDestination);
    }
}

export default Sequence;