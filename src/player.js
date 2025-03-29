class Player {
    constructor(bpm, record, containerSelector, audio) {
        this.bpm = bpm;
        this.record = record;
        this.noteInterval = this.calculateNoteInterval();
        this.audio = audio;
        this.lastStartStep = 0;
        this.lastStartTime = 0.0;
        this.currentStep = 0;
        this.nextNoteTime = 0.0;
        this.isPlaying = false;
        this.isPaused = false;
        this.pauseOffset = 0.0;
        this.scheduleTimeouts = [];
        this.scheduledAudioNodes = [];
        this.intervalId = null;

        // Set the container for the player
        this.container = document.querySelector(containerSelector);
        if (!this.container) {
            throw new Error(`Container '${containerSelector}' not found.`);
        }

        // Create the grid and controls
        this.createGrid();
        this.createControls();
        this.showRecordName(); // Show the record name in the UI
    }

    calculateNoteInterval() {
        return (60.0 / this.bpm) / this.record.stepsPerBeat;
    }

    // Display the record name in the UI
    showRecordName() {
        const nameElement = document.createElement("div");
        nameElement.className = "record-name";
        nameElement.innerText = `Record: ${this.record.name}`;
        this.container.prepend(nameElement);
    }

    createGrid() {
        this.container.innerHTML = ""; // Clear any existing content
        const gridContainer = document.createElement("div");
        gridContainer.className = "grid-container";

        for (let i = 0; i < this.record.totalSteps; i++) {
            const cell = document.createElement("div");
            cell.classList.add("grid-cell");
            if (this.record.getStepState(i)) {
                cell.classList.add("active");
                cell.style.backgroundColor = "#4caf50"; // Active color
            }
            cell.style.width = `${100 / this.record.stepsPerBeat}%`; // Adjust width based on steps per beat
            cell.classList.add("grid-cell");
            cell.dataset.index = i;
            cell.addEventListener("click", () => this.toggleCell(i, cell));
            gridContainer.appendChild(cell);
        }

        this.container.appendChild(gridContainer);
    }

    createControls() {
        const controlsContainer = document.createElement("div");
        controlsContainer.className = "controls-container";

        this.playPauseBtn = document.createElement("button");
        this.playPauseBtn.innerText = "Play";
        this.playPauseBtn.addEventListener("click", () => this.togglePlayPause());

        this.stopBtn = document.createElement("button");
        this.stopBtn.innerText = "Stop";
        this.stopBtn.addEventListener("click", () => this.stop());

        this.bpmInput = document.createElement("input");
        this.bpmInput.type = "number";
        this.bpmInput.value = this.bpm;
        this.bpmInput.min = 30;
        this.bpmInput.max = 300;
        this.bpmInput.addEventListener("input", (e) => this.changeBPM(parseInt(e.target.value, 10)));

        controlsContainer.appendChild(this.playPauseBtn);
        controlsContainer.appendChild(this.stopBtn);
        controlsContainer.appendChild(this.bpmInput);
        this.container.appendChild(controlsContainer);
    }

    changeBPM(newBPM) {
        if (newBPM < 30 || newBPM > 300) return;

        console.log(`Changing BPM to ${newBPM}`);
        let was_playing = false;
        if (this.isPlaying) {
            this.pause();
            was_playing = true;
        }

        this.bpm = newBPM;
        this.noteInterval = this.calculateNoteInterval();

        if (was_playing) {
            this.start();
        }
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
            this.playPauseBtn.innerText = "Play";
        } else {
            this.start();
            this.playPauseBtn.innerText = "Pause";
        }
    }

    toggleCell(step, cell) {
        this.record.toggleStep(step);
        cell.classList.toggle("active");
        cell.style.backgroundColor = this.record.getStepState(step) ? "#4caf50" : "#333";
    }

    start() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.nextNoteTime = this.audio.context.currentTime + this.pauseOffset * this.noteInterval;
        this.pauseOffset = 0.0;

        this.scheduleNextNotes();
        this.intervalId = setInterval(() => this.scheduleNextNotes(), 25);
    }

    pause() {
        if (!this.isPlaying) return;

        clearInterval(this.intervalId);
        this.isPlaying = false;
        this.isPaused = true;

        const elapsedTime = this.audio.context.currentTime - this.lastStartTime;
        this.pauseOffset = (this.nextNoteTime - this.audio.context.currentTime) / this.noteInterval;

        this.clearScheduledNotes();
    }

    stop() {
        clearInterval(this.intervalId);
        this.isPlaying = false;
        this.isPaused = false;
        this.currentStep = 0;
        this.pauseOffset = 0.0;
        this.playPauseBtn.innerText = "Play";

        this.clearScheduledNotes();
        this.highlightStep(-1);
    }

    scheduleNextNotes() {
        while (this.nextNoteTime < this.audio.context.currentTime + 0.1) {
            if (this.record.getStepState(this.currentStep)) {
                this.playNote(this.currentStep, this.nextNoteTime);
            }
            this.nextNoteTime += this.noteInterval;
            this.currentStep = (this.currentStep + 1) % this.record.totalSteps;
        }
    }

    playNote(step, time) {
        if (this.record.getStepState(step)) {
            // Use record.soundName to choose the buffer dynamically
            const source = this.audio.startBuffer(this.record.soundName, time);
            this.scheduledAudioNodes.push(source);

            // Schedule visual update at the correct time
            const visualTimeout = setTimeout(() => {
                this.highlightStep(step);
            }, (time - this.audio.context.currentTime) * 1000);

            this.scheduleTimeouts.push(visualTimeout);
        }
    }

    highlightStep(step) {
        const cells = this.container.querySelectorAll(".grid-cell");
        cells.forEach((cell, i) => {
            cell.style.backgroundColor =
                i === step ? "#ffeb3b" : this.record.getStepState(i) ? "#4caf50" : "#333";
        });
    }

    clearScheduledNotes() {
        this.scheduledAudioNodes.forEach((node) => {
            try {
                node.stop();
                node.disconnect();
            } catch (e) {
                console.error("Error stopping audio:", e);
            }
        });
        this.scheduledAudioNodes = [];

        this.scheduleTimeouts.forEach((id) => clearTimeout(id));
        this.scheduleTimeouts = [];
    }
}

