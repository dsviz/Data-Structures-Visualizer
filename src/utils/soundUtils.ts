
// Simple Web Audio API wrapper for generating sounds

let audioCtx: AudioContext | null = null;
let gainNode: GainNode | null = null;

const initAudio = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNode = audioCtx.createGain();
        gainNode.connect(audioCtx.destination);
    }
};

export const playNote = (frequency: number, type: OscillatorType = 'sine', duration: number = 0.1, volume: number = 0.1) => {
    try {
        if (!audioCtx) initAudio();
        if (!audioCtx || !gainNode) return;

        // Resume context if suspended (browser autoplay policy)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const oscillator = audioCtx.createOscillator();
        const noteGain = audioCtx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

        // Envelop to avoid clicking
        noteGain.gain.setValueAtTime(0, audioCtx.currentTime);
        noteGain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.01);
        noteGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        oscillator.connect(noteGain);
        noteGain.connect(gainNode);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);

        // Cleanup
        setTimeout(() => {
            oscillator.disconnect();
            noteGain.disconnect();
        }, duration * 1000 + 100);

    } catch (e) {
        console.error("Audio playback error", e);
    }
};

export const playSortingSound = (value: number, min: number = 0, max: number = 100) => {
    // Map value to frequency (e.g., 200Hz to 800Hz)
    // Logarithmic mapping usually sounds better for pitch
    const minFreq = 200;
    const maxFreq = 600;

    // Normalize value 0-1
    const normalized = (value - min) / (max - min);

    const frequency = minFreq + (normalized * (maxFreq - minFreq));

    playNote(frequency, 'sine', 0.1, 0.05);
};

export const setMasterVolume = (val: number) => {
    if (gainNode) {
        gainNode.gain.setValueAtTime(val, audioCtx?.currentTime || 0);
    }
};
