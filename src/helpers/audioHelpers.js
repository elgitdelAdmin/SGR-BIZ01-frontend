export const playNotificationSound = () => {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        const startSound = () => {
            // Primer tono (Do6 - 1046.50Hz)
            const osc1 = audioCtx.createOscillator();
            const gain1 = audioCtx.createGain();
            osc1.connect(gain1);
            gain1.connect(audioCtx.destination);

            osc1.type = 'square';
            osc1.frequency.setValueAtTime(1046.50, audioCtx.currentTime);
            gain1.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);

            osc1.start();
            osc1.stop(audioCtx.currentTime + 0.15);

            // Segundo tono (Mi6 - 1318.51Hz)
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);

            osc2.type = 'square';
            osc2.frequency.setValueAtTime(1318.51, audioCtx.currentTime + 0.15);
            gain2.gain.setValueAtTime(0.15, audioCtx.currentTime + 0.15);
            gain2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);

            osc2.start(audioCtx.currentTime + 0.15);
            osc2.stop(audioCtx.currentTime + 0.3);

            // Tercer tono (Sol6 - 1567.98Hz)
            const osc3 = audioCtx.createOscillator();
            const gain3 = audioCtx.createGain();
            osc3.connect(gain3);
            gain3.connect(audioCtx.destination);

            osc3.type = 'square';
            osc3.frequency.setValueAtTime(1567.98, audioCtx.currentTime + 0.3);
            gain3.gain.setValueAtTime(0.15, audioCtx.currentTime + 0.3);
            gain3.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);

            osc3.start(audioCtx.currentTime + 0.3);
            osc3.stop(audioCtx.currentTime + 0.6);
        };

        if (audioCtx.state === 'suspended') {
            const resumeAndPlay = () => {
                audioCtx.resume().then(() => {
                    startSound();
                }).catch(err => console.error("Error resuming AudioContext:", err))
                    .finally(() => {
                        window.removeEventListener('click', resumeAndPlay);
                        window.removeEventListener('keydown', resumeAndPlay);
                    });
            };
            window.addEventListener('click', resumeAndPlay);
            window.addEventListener('keydown', resumeAndPlay);
        } else {
            startSound();
        }
    } catch (e) {
        console.error("Audio Context error:", e);
    }
};

let loopingInterval = null;

export const startLoopingNotificationSound = () => {
    // Si ya está sonando, no hacemos nada
    if (loopingInterval) return;

    // Reproducimos una vez inmediatamente
    playNotificationSound();

    // Y luego lo repetimos cada 3 segundos
    loopingInterval = setInterval(() => {
        playNotificationSound();
    }, 3000);
};

export const stopLoopingNotificationSound = () => {
    if (loopingInterval) {
        clearInterval(loopingInterval);
        loopingInterval = null;
    }
};
