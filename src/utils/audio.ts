// Web Audio API Sound Synthesizer for XMA Awards Ceremony
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playVoteChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
    osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3); // D6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  } catch {
    // Graceful fallback
  }
}

export function playFanfare() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [
      { freq: 440, time: 0, dur: 0.18 },      // A4
      { freq: 554.37, time: 0.18, dur: 0.18 }, // C#5
      { freq: 659.25, time: 0.36, dur: 0.22 }, // E5
      { freq: 880, time: 0.58, dur: 0.6 },    // A5
      { freq: 1108.73, time: 0.75, dur: 0.8 } // C#6
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.freq, now + n.time);

      gain.gain.setValueAtTime(0.18, now + n.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  } catch {
    // Graceful fallback
  }
}

export function playEnvelopeUnseal() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch {
    // Graceful fallback
  }
}

export function playClockTick(isTock: boolean = false) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Dual oscillator for rich mechanical clock escapement
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Tick vs Tock subtle frequency difference
    const startFreq = isTock ? 780 : 1050;
    const endFreq = isTock ? 320 : 420;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.04);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // Graceful fallback
  }
}

export function playGrandReveal() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Ascending power sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.8);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 1.2);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 2.0);

    // Followed by fanfare chords
    setTimeout(() => {
      playFanfare();
    }, 400);
  } catch {
    // Graceful fallback
  }
}

export function playSlideWhoosh() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.25);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch {
    // Graceful fallback
  }
}

export function playAdminGavel() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch {
    // Graceful fallback
  }
}

export function playEpicEntranceSequence() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Deep Sub-bass Impact / Braam (0s -> 2.5s)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(110, now);
    subOsc.frequency.exponentialRampToValueAtTime(38, now + 1.2);
    subGain.gain.setValueAtTime(0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 2.5);

    // 2. Ascending Golden Sweeping Arpeggio (0.2s -> 2.0s)
    const sweepNotes = [220, 277.18, 329.63, 440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];
    sweepNotes.forEach((freq, idx) => {
      const noteTime = now + 0.2 + idx * 0.12;
      const noteOsc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      noteOsc.type = 'sine';
      noteOsc.frequency.setValueAtTime(freq, noteTime);
      noteGain.gain.setValueAtTime(0.12, noteTime);
      noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);
      noteOsc.connect(noteGain);
      noteGain.connect(ctx.destination);
      noteOsc.start(noteTime);
      noteOsc.stop(noteTime + 0.35);
    });

    // 3. Laser Beams & Shimmering Sparkles (1.4s -> 3.2s)
    [0, 0.25, 0.5, 0.75].forEach((offset) => {
      const beamTime = now + 1.4 + offset;
      const beamOsc = ctx.createOscillator();
      const beamGain = ctx.createGain();
      beamOsc.type = 'sawtooth';
      beamOsc.frequency.setValueAtTime(1800, beamTime);
      beamOsc.frequency.exponentialRampToValueAtTime(300, beamTime + 0.22);
      beamGain.gain.setValueAtTime(0.1, beamTime);
      beamGain.gain.exponentialRampToValueAtTime(0.001, beamTime + 0.22);
      beamOsc.connect(beamGain);
      beamGain.connect(ctx.destination);
      beamOsc.start(beamTime);
      beamOsc.stop(beamTime + 0.22);
    });

    // 4. Grand Celebratory Fanfare Climax (2.2s -> 4.5s)
    const climaxChords = [
      { freqs: [440, 554.37, 659.25], time: now + 2.2, dur: 0.5 },     // A major
      { freqs: [493.88, 622.25, 739.99], time: now + 2.7, dur: 0.5 },  // B major
      { freqs: [554.37, 698.46, 830.61], time: now + 3.2, dur: 1.4 }   // C# major crescendo
    ];

    climaxChords.forEach((chord) => {
      chord.freqs.forEach((freq) => {
        const chordOsc = ctx.createOscillator();
        const chordGain = ctx.createGain();
        chordOsc.type = 'sine';
        chordOsc.frequency.setValueAtTime(freq, chord.time);
        chordGain.gain.setValueAtTime(0.16, chord.time);
        chordGain.gain.exponentialRampToValueAtTime(0.001, chord.time + chord.dur);
        chordOsc.connect(chordGain);
        chordGain.connect(ctx.destination);
        chordOsc.start(chord.time);
        chordOsc.stop(chord.time + chord.dur);
      });
    });
  } catch {
    // Graceful fallback
  }
}
