import Sequence from './sequence.js';

/**
 * Animates the playback position on the html elements
 */
class Animator {
    /**
     * @param {AudioContext} context AudioContext instance
     */
    constructor(context) {
        this.context = context;
        this.running = false;
        this.currentPosition = 0;
        this.lastPosition = 0;
        this.elementGrid = [];
        this.sequence = null;
        this.update = this.update.bind(this);
    }

    /**
     * Initialize the animator. The parameter is the track container element.
     * Stores all beat Element into elementGrid
     * @param {Element} trackContainer Track container HTML element
     * @param {Sequence} sequence One of the playing Sequences
     */
    init(trackContainer, sequence) {
        this.sequence = sequence;
        this.elementGrid = new Array(sequence.steps);
        for(let i = 0; i < sequence.steps; ++i) {
            trackContainer.querySelectorAll(`li[data-id="${i}"]`).forEach((e) => {
                if (!this.elementGrid[i]) this.elementGrid[i] = [];
                this.elementGrid[i].push(e);
            });
        }
    }

    /**
     * Start animating. Does nothing if already running
     */
    start() {
        if (this.running) return;
        this.running = true;
        this.lastPosition = 0;
        this.update();
    }

    /**
     * Stop animating and clear
     */
    stop() {
        this.running = false;
        this.elementGrid[this.lastPosition].forEach((e) => e.classList.remove("highlight"));
    }

    /**
     * Update the elements if necessary. Requests another animation
     * frame with update as long as running is truthy
     */
    update() {
        const s = this.sequence;
        // Divide the current time position by the length to get the current index in the sequence
        let position = ((s.measureLength - (s.startTime - this.context.currentTime)) / s.stepLength);
        if (position < 0) position += s.steps;
        position = Math.trunc(position);
        if (position !== this.lastPosition) {
            this.elementGrid[position].forEach((e) => e.classList.add("highlight"));
            this.elementGrid[this.lastPosition].forEach((e) => e.classList.remove("highlight"));
            this.lastPosition = position;
        }
        if (this.running) window.requestAnimationFrame(this.update);
    }
}

export default Animator;