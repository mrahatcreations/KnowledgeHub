// Procedural Sound Synthesizer via Web Audio API
class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this._attachUserGestureUnlock();
  }

  _attachUserGestureUnlock() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      this.init();
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('click', unlock, { passive: true, once: true });
    window.addEventListener('touchstart', unlock, { passive: true, once: true });
    window.addEventListener('keydown', unlock, { passive: true, once: true });
  }

  init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Subtle, crisp UI click sound
   */
  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.04);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  /**
   * Pleasant ascending major arpeggio / chord for correct answer
   */
  playCorrect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        gain.gain.setValueAtTime(0.001, now + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.18, now + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.32);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.32);
      });
    } catch (e) {}
  }

  /**
   * Dissonant low buzz sound for wrong answer
   */
  playWrong() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [180, 172].forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(freq * 0.6, now + 0.24);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.24);
      });
    } catch (e) {}
  }

  /**
   * Attention-grabbing 2nd Chance ping/chime
   */
  playSecondChance() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [440, 659.25, 880]; // A4, E5, A5
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.16, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch (e) {}
  }

  /**
   * Card flip whoosh
   */
  playFlip() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  /**
   * Swipe whoosh effect
   */
  playSwipe() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  /**
   * Triumphant 5-star victory fanfare
   */
  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const fanfare = [
        { freq: 523.25, time: 0.00, dur: 0.15 },
        { freq: 659.25, time: 0.12, dur: 0.15 },
        { freq: 783.99, time: 0.24, dur: 0.18 },
        { freq: 1046.50, time: 0.40, dur: 0.25 },
        { freq: 1318.51, time: 0.55, dur: 0.28 },
        { freq: 1567.98, time: 0.72, dur: 0.55 }
      ];

      fanfare.forEach((note) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, now + note.time);
        gain.gain.setValueAtTime(0.001, now + note.time);
        gain.gain.linearRampToValueAtTime(0.2, now + note.time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + note.time);
        osc.stop(now + note.time + note.dur);
      });
    } catch (e) {}
  }

  /**
   * Text-to-Speech English Pronunciation
   */
  speak(text) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const clean = String(text || '').replace(/[^a-zA-Z\s-]/g, '').trim();
      if (!clean) return;
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }
}

export const sound = new SoundSynthesizer();