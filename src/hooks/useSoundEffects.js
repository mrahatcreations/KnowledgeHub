import { useState, useEffect, useCallback } from 'react';
import { sound } from '../audio/SoundSynthesizer.js';

const STORAGE_KEY_MUTED = 'vocabmaster_audio_muted';

/**
 * Custom React Hook to manage game sound effects and text-to-speech audio.
 * Encapsulates audio mute state, persistence, and Web Audio API synthesizer triggering.
 *
 * @returns {Object} Sound effects controller and playback utilities
 */
export function useSoundEffects() {
  const [isAudioMuted, setIsAudioMutedState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MUTED);
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Sync synthesizer enabled property with mute state
  useEffect(() => {
    sound.enabled = !isAudioMuted;
  }, [isAudioMuted]);

  const setIsAudioMuted = useCallback((muted) => {
    setIsAudioMutedState((prev) => {
      const nextVal = typeof muted === 'function' ? muted(prev) : !!muted;
      sound.enabled = !nextVal;
      try {
        localStorage.setItem(STORAGE_KEY_MUTED, JSON.stringify(nextVal));
      } catch (e) {
        console.warn('Failed to save audio muted preference:', e);
      }
      return nextVal;
    });
  }, []);

  const toggleAudio = useCallback(() => {
    setIsAudioMuted((prev) => !prev);
  }, [setIsAudioMuted]);

  const playClick = useCallback(() => {
    if (!isAudioMuted) sound.playClick();
  }, [isAudioMuted]);

  const playCorrect = useCallback(() => {
    if (!isAudioMuted) sound.playCorrect();
  }, [isAudioMuted]);

  const playWrong = useCallback(() => {
    if (!isAudioMuted) sound.playWrong();
  }, [isAudioMuted]);

  const playSecondChance = useCallback(() => {
    if (!isAudioMuted) sound.playSecondChance();
  }, [isAudioMuted]);

  const playFlip = useCallback(() => {
    if (!isAudioMuted) sound.playFlip();
  }, [isAudioMuted]);

  const playSwipe = useCallback(() => {
    if (!isAudioMuted) sound.playSwipe();
  }, [isAudioMuted]);

  const playVictory = useCallback(() => {
    if (!isAudioMuted) sound.playVictory();
  }, [isAudioMuted]);

  const speak = useCallback((text) => {
    if (!isAudioMuted) sound.speak(text);
  }, [isAudioMuted]);

  return {
    isAudioMuted,
    setIsAudioMuted,
    toggleAudio,
    playClick,
    playCorrect,
    playWrong,
    playSecondChance,
    playFlip,
    playSwipe,
    playVictory,
    speak,
    soundInstance: sound
  };
}

export default useSoundEffects;
