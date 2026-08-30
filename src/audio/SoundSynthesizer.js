import { audioPackManager } from './AudioPackManager.js';

class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this._audioManifest = null;
    this._loadAudioManifest();
    this._attachUserGestureUnlock();
  }

  async _loadAudioManifest() {
    if (typeof window === 'undefined') return;
    this._audioManifest = await audioPackManager.getManifest();
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
   * Text-to-Speech & Studio Native Human Pronunciation
   * 100% Crystal-Clear Studio Human Vocal Engine for All Words, Phrases & Sentences
   */
  _log(msg) {
    if (typeof window !== 'undefined') {
      try {
        fetch('/__log_audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ msg })
        }).catch(() => {});
      } catch (e) {}
    }
  }

  speak(text) {
    if (typeof window === 'undefined') return;
    const clean = String(text || '')
      .replace(/[\u0980-\u09FF]/g, '')
      .replace(/[-_/]+/g, ' ')
      .replace(/["“”'’`]/g, '')
      .replace(/[^a-zA-Z0-9\s.,?!]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean) return;

    this.init();

    // 1. Cancel any active playback
    if (this._currentAudio) {
      try {
        this._currentAudio.pause();
        this._currentAudio.currentTime = 0;
      } catch (e) {}
      this._currentAudio = null;
    }
    if (this._currentSourceNode) {
      try {
        this._currentSourceNode.stop();
        this._currentSourceNode.disconnect();
      } catch (e) {}
      this._currentSourceNode = null;
    }
    if (this._sequenceTimer) {
      clearTimeout(this._sequenceTimer);
      this._sequenceTimer = null;
    }
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    const words = clean.split(/\s+/).filter(Boolean);

    // 2. Offline Audio Pack / Local Cache / Edge Neural / CDN
    const key = clean.toLowerCase();
    const manifestFile = this._audioManifest && this._audioManifest[key];

    const isProxy = typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port === '5173');

    // Async audio dispatch
    (async () => {
      let targetUrl = null;
      if (manifestFile) {
        targetUrl = await audioPackManager.getAudioUrl(manifestFile);
      }
      if (!targetUrl) {
        targetUrl = isProxy
          ? `/__edge_tts?text=${encodeURIComponent(clean)}`
          : `https://raw.githubusercontent.com/mrahatcreations/VocabMaster/main/public/audio/${manifestFile || ''}`;
      }

      const isLocalBlob = targetUrl && (targetUrl.startsWith('blob:') || targetUrl.startsWith('data:'));
      const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;

      if (isLocalBlob || isOnline) {
        this._log(`🎙️ Playing Voice for: "${clean}" (${isLocalBlob ? 'Local Offline Cache' : 'Cloud CDN'})`);
        
        const audio = new Audio(targetUrl);
        audio.playbackRate = 0.95;
        this._currentAudio = audio;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this._log(`✅ Audio Playing successfully: "${clean}"`);
            })
            .catch((err) => {
              this._log(`⚠️ Playback error, trying live fallback: ${err?.message || err}`);
              if (isProxy && !isLocalBlob) {
                const liveAudio = new Audio(`/__edge_tts?text=${encodeURIComponent(clean)}`);
                this._currentAudio = liveAudio;
                liveAudio.play().catch(() => this._fallbackTTS(clean));
              } else {
                this._fallbackTTS(clean);
              }
            });
        }
        return;
      }

      // 3. Fallback to Slow, Clear Speech Synthesis
      this._fallbackTTS(clean);
    })();
  }

  async _playGaplessStudioSequence(words, fullText) {
    if (!words || words.length === 0) return;
    this.init();

    if (!this.ctx) {
      this._fallbackTTS(fullText);
      return;
    }

    this._log(`🎙️ Preloading ${words.length} words for seamless studio playback: "${words.join(' ')}"`);

    try {
      if (!this._bufferCache) this._bufferCache = new Map();

      // Step 1: Preload & decode all words in parallel
      const bufferPromises = words.map(async (w) => {
        const cleanW = w.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().trim();
        if (!cleanW) return null;

        if (this._bufferCache.has(cleanW)) {
          return this._bufferCache.get(cleanW);
        }

        const isProxy = typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port === '5173');
        const url = isProxy
          ? `/__tts_word?w=${encodeURIComponent(cleanW)}`
          : `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanW)}&type=2`;

        try {
          const resp = await fetch(url);
          if (!resp.ok) return null;
          const arrayBuffer = await resp.arrayBuffer();
          const decoded = await this.ctx.decodeAudioData(arrayBuffer.slice(0));
          this._bufferCache.set(cleanW, decoded);
          return decoded;
        } catch (e) {
          return null;
        }
      });

      const decodedBuffers = (await Promise.all(bufferPromises)).filter(Boolean);

      if (decodedBuffers.length === 0) {
        this._fallbackTTS(fullText);
        return;
      }

      // Step 2: Trim leading & trailing silence from each word buffer for tight human flow
      const sampleRate = this.ctx.sampleRate;
      const trimmedItems = decodedBuffers.map(buf => {
        const numCh = buf.numberOfChannels;
        const len = buf.length;
        const threshold = 0.008;

        let start = 0;
        let end = len - 1;

        // Find sound start
        outerStart: for (let i = 0; i < len; i++) {
          for (let ch = 0; ch < numCh; ch++) {
            if (Math.abs(buf.getChannelData(ch)[i]) > threshold) {
              start = Math.max(0, i - Math.floor(sampleRate * 0.005)); // 5ms buffer
              break outerStart;
            }
          }
        }

        // Find sound end
        outerEnd: for (let i = len - 1; i >= start; i--) {
          for (let ch = 0; ch < numCh; ch++) {
            if (Math.abs(buf.getChannelData(ch)[i]) > threshold) {
              end = Math.min(len - 1, i + Math.floor(sampleRate * 0.008)); // 8ms buffer
              break outerEnd;
            }
          }
        }

        const trimmedLen = Math.max(1, end - start + 1);
        return { buf, start, trimmedLen };
      });

      // Step 3: Seamlessly stitch trimmed words with tight 15ms conversational pause
      const tightGapSamples = Math.floor(sampleRate * 0.015); // 15ms tight natural speech gap
      const totalLength = trimmedItems.reduce((acc, item) => acc + item.trimmedLen + tightGapSamples, 0);
      const numChannels = Math.max(...decodedBuffers.map(b => b.numberOfChannels));

      const mergedBuffer = this.ctx.createBuffer(numChannels, totalLength, sampleRate);

      let offset = 0;
      for (const item of trimmedItems) {
        for (let ch = 0; ch < numChannels; ch++) {
          const srcChannel = item.buf.getChannelData(Math.min(ch, item.buf.numberOfChannels - 1));
          const dstChannel = mergedBuffer.getChannelData(ch);
          // Copy only the non-silent audio slice
          for (let i = 0; i < item.trimmedLen; i++) {
            dstChannel[offset + i] = srcChannel[item.start + i];
          }
        }
        offset += item.trimmedLen + tightGapSamples;
      }

      // Step 4: Instantaneous seamless playback of the tightly merged studio buffer
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      const source = this.ctx.createBufferSource();
      source.buffer = mergedBuffer;
      source.playbackRate.value = 1.0; // Smooth natural pace
      source.connect(this.ctx.destination);
      this._currentSourceNode = source;

      source.onended = () => {
        this._currentSourceNode = null;
        this._log(`✅ Tight Seamless Studio Playback Completed: "${words.join(' ')}"`);
      };

      source.start(0);
      this._log(`✅ Seamless Studio Track Playing (${words.length} words tightly united): "${words.join(' ')}"`);
    } catch (err) {
      this._log(`⚠️ Gapless stream failed, fallback to TTS: ${err?.message || err}`);
      this._fallbackTTS(fullText);
    }
  }

  _fallbackTTS(clean) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'en-US';

      // Slower educational articulation and warm natural pitch
      const isSentence = clean.includes(' ') && clean.length > 20;
      utterance.rate = isSentence ? 0.76 : 0.70;
      utterance.pitch = 0.95;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
      let selectedVoice = null;

      if (voices && voices.length > 0) {
        // Exclude robotic legacy voices (e.g. Microsoft David Desktop) and pick neural/natural voices
        const naturalVoices = voices.filter(v => 
          !v.name.includes('David') && 
          !v.name.includes('Desktop') &&
          (v.lang === 'en-US' || v.lang === 'en-GB' || v.lang.startsWith('en'))
        );

        selectedVoice = naturalVoices.find(v => 
          v.name.includes('Google') || 
          v.name.includes('Natural') || 
          v.name.includes('Jenny') || 
          v.name.includes('Guy') || 
          v.name.includes('Aria') || 
          v.name.includes('Samantha') || 
          v.name.includes('Daniel') ||
          v.name.includes('Zira')
        ) || naturalVoices[0] || voices.find(v => !v.name.includes('David') && v.lang.startsWith('en')) || voices[0];

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      this._log(`🔊 WebSpeech fallback for: "${clean}" | Voice: "${selectedVoice ? selectedVoice.name : 'Default System Voice'}" | Rate: ${utterance.rate} | Pitch: ${utterance.pitch}`);

      this.currentUtterance = utterance;
      utterance.onend = () => {
        this.currentUtterance = null;
      };
      utterance.onerror = (e) => {
        this._log(`❌ WebSpeech Error for "${clean}": ${e?.message || e}`);
        this.currentUtterance = null;
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      this._log(`Speech synthesis error: ${e?.message || e}`);
    }
  }
}

export const sound = new SoundSynthesizer();