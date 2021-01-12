import Sequence from './sequence.js';

/**
 * Holds and controls several sequences and samples
 * @member sequences
 */
class Tracker {
    /**
     * Create a new Tracker
     * @param {AudioContext} context AudioContext instance to play sounds into
     * @param {Number} steps The number of steps in a track
     * @param {Number} bpm Beats per minute
     */
    constructor(context, steps, bpm) {
        /**
         * Reference to AudioContext instance
         * @type {AudioContext}
         */
        this.context = context;
        /**
         * @type {Sequence[]}
         */
        this.sequences = [];
        /**
         * @type {AudioBuffer[]}
         */
        this.samples = [];
        this.steps = steps;
        this.bpm = bpm;

        // Effects nodes
        // These should probably be moved to their own class
        this.lowpass = context.createBiquadFilter();
        this.lowpass.frequency.value = 300;
        this.lowpass.Q.value = 1.3;
        this.lowpass.connect(context.destination);

        this.crush = new AudioWorkletNode(context, 'bit-crusher-processor');
        this.crush.bitDepth = this.crush.parameters.get("bitDepth");
        this.crush.frequencyReduction = this.crush.parameters.get("frequencyReduction");
        this.crush.bitDepth.value = 8;
        this.crush.frequencyReduction.value = 1 / 20;
        this.crush.connect(context.destination);

        this.effects = {
            lpfilter: this.lowpass,
            crush: this.crush,
        };
    }

    /**
     * Adds a new sequence
     * @param {Number} index Index of sample in sample array
     * @returns {Number} Index of new Sequence in array
     */
    addSequence(index) {
        const sample = this.getSample(index);
        const s = new Sequence(this.context, sample, this.steps, 1 / (this.bpm / 60 ) * 0.25);

        this.sequences.push(s);
        s.setEchoDelay(1 / (this.bpm / 60) * 0.75);
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

    /**
     * Start playing all sequences
     */
    start() {
        for (let i = 0; i < this.sequences.length; i++) {
            const s = this.sequences[i];
            s.startNow();
        }
    }

    /**
     * Stop playing all sequences at the end of the current measure
     */
    stop() {
        for (let i = 0; i < this.sequences.length; i++) {
            const s = this.sequences[i];
            s.stopNow();
        }
    }

    /**
     * Stop playing immediately
     */
    stopNow() {
        for (let i = 0; i < this.sequences.length; i++) {
            const s = this.sequences[i];
            s.stopNow();
            s.stopNow();
        }
    }

    /**
     * Number of sequences in array
     */
    numTracks() {
        return this.sequences.length;
    }

    /**
     * Set a new BPM for all sequences
     * @param {Number} bpm New BPM
     */
    setBPM(bpm) {
        if (isNaN(bpm)) return;
        this.bpm = bpm;
        const length = 1 / (this.bpm / 60) * 0.25;
        const echo = 1 / (this.bpm / 60) * 0.75;
        this.sequences.forEach((s) => {
            s.setStepLength(length);
            s.setEchoDelay(echo);
        });
    }

    /**
     * Sets effect for all output
     * @param {"none"|"lpfilter"} effect
     */
    setEffect(effect) {
        if (effect === "none") {
            this.sequences.forEach((s) => {
                s.setDestination(this.context.destination);
            });
        }
        if (Object.keys(this.effects).includes(effect)) {
            this.sequences.forEach((s) => {
                s.setDestination(this.effects[effect]);
            });
        }

    }

    setFilterFrequency(freq) {
        this.lowpass.frequency.value = freq;
    }

    setFilterQ(q) {
        this.lowpass.Q.value = q;
    }

    setCrusherBitDepth(bits) {
        this.crush.bitDepth.value = bits;
    }

    setCrusherFrequency(freq) {
        this.crush.frequencyReduction.value = 1 / freq;
    }
}

export default Tracker;