class Audio {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.buffers = {}; // Stores loaded audio buffers
    }

    // Load a single audio buffer
    async loadBuffer(url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return this.context.decodeAudioData(arrayBuffer);
    }

    // Load multiple audio buffers
    async loadFiles(bufferMap) {
        for (const [name, url] of Object.entries(bufferMap)) {
            this.buffers[name] = await this.loadBuffer(url);
            console.log(`Loaded audio buffer: ${name}`);
        }
    }

    // Start a buffer at an absolute time
    startBuffer(name, time) {
        if (!this.buffers[name]) {
            console.error(`Audio buffer '${name}' not loaded`);
            return;
        }

        const source = this.context.createBufferSource();
        source.buffer = this.buffers[name];
        source.connect(this.context.destination);
        source.start(time); // Use absolute time to schedule playback

        console.log(`Playing '${name}' buffer at absolute time ${time.toFixed(4)}s`);
        return source;
    }
};

