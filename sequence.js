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
        this.measureLength = stepLength * steps;
        this.track = new Array(this.steps).map(() => false);

        this.bufferTime = 0.5;
        this.running = false;
        this.currIndex = 0;
    }

    /**
     * Start playing the sequence immediately
     */
    startNow() {
        this.startTime = this.context.currentTime;
        console.log("Sequence starting at: " + this.startTime);
        this.running = true;
        this.schedule();
    }

    schedule() {
        const currTime = this.context.currentTime;
        if (currTime > this.startTime - this.bufferTime) {
            for (let i = 0; i < this.track.length; i++) {
                const b = this.track[i];
                if (b) {
                    const s = this.context.createOscillator();
                    s.frequency.value = 110;
                    s.type = "sawtooth";
                    s.connect(this.context.destination);
                    s.start(this.startTime + this.stepLength * i);
                    s.stop(this.startTime + this.stepLength * (i + 1));
                }
            }
            this.startNow += this.measureLength;
        }
    }

    // schedule() {
    //     if (!this.running) return;
    //     const currTime = this.context.currentTime;
    //     console.log("I'm checking...");
    //     console.log("time: " + currTime.toFixed(2));
    //     const c = (currTime + this.bufferTime - this.startTime) / this.stepLength;
    //     while(c >= this.currIndex) {
    //         if (this.track[this.currIndex % this.steps]) {
    //             console.log('c:', c);
    //             console.log("I want to play step " + this.currIndex + " of " + this.steps);
    //             // const s = this.context.createBufferSource();
    //             // s.buffer = this.source;
    //             const s = this.context.createOscillator();
    //             s.frequency.value = 110;
    //             s.type = "sawtooth";
    //             s.connect(this.context.destination);
    //             s.start(currTime + this.stepLength * this.currIndex);
    //             s.stop(currTime + this.stepLength * (this.currIndex + 1));
    //             console.log("startTime: " + (currTime + this.stepLength * this.currIndex).toFixed(2));
    //         }
    //         this.currIndex++;
    //     }

    //     setTimeout(this.schedule.bind(this), 200);
    // }

    stopNow() {
        console.log("Sequence stopping at: " + this.context.currentTime);
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

    /**
     * Change the audio buffer to be played by the source nodes
     * @param {AudioBuffer} newBuffer New AudioBuffer instance
     */
    setBuffer(newBuffer) {
        this.source = newBuffer;
    }
}

export default Sequence;