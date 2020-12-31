import Sequence from './sequence.js';

/**
 * Holds and controls several sequences and samples
 */
class Tracker {
    /**
     * Create a new BeatSequencer
     * @param {AudioContext} context AudioContext instance to play sounds into
     */
    constructor(context, steps, bpm) {
        this.context = context;
        this.sequences = [];
        this.samples = [];
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

export default Tracker;