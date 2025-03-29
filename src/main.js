document.addEventListener("DOMContentLoaded", async () => {
    // Create audio instance and load sound files
    const audio = new Audio();
    await audio.loadFiles({
        shake: "assets/shake.mp3",
        sangban: "assets/sangban.mp3",
        kenkeni: "assets/kenkeni.mp3",
    });

    // Create Records with names, sound names, and Players
    const record1 = new Record("Groove 1", "shake", 4, 4, [0, 4, 8, 12]);
    const player1 = new Player(120, record1, "#player-container-1", audio);

    const record2 = new Record("Groove 2", "sangban", 3, 4, [0, 3, 6, 9]);
    const player2 = new Player(100, record2, "#player-container-2", audio);

    const record3 = new Record("Groove 3", "kenkeni", 4, 4, [2, 6, 10, 14]);
    const player3 = new Player(140, record3, "#player-container-3", audio);
});
