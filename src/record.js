class Record {
    constructor(name, soundName, beatsPerBar, stepsPerBeat, activeSteps = []) {
        this.name = name; // Record name
        this.soundName = soundName; // Name of the sound buffer
        this.beatsPerBar = beatsPerBar;
        this.stepsPerBeat = stepsPerBeat;
        this.activeSteps = activeSteps;
    }

    get totalSteps() {
        return this.beatsPerBar * this.stepsPerBeat;
    }

    getStepState(step) {
        return this.activeSteps.includes(step);
    }

    toggleStep(step) {
        if (this.activeSteps.includes(step)) {
            this.activeSteps = this.activeSteps.filter((s) => s !== step);
        } else {
            this.activeSteps.push(step);
        }
    }
}

