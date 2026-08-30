import { useState, useEffect, useCallback } from 'react';
import { buildLevelStages, STAGE_TYPES } from '../engine/GameEngine.js';
import { sound } from '../audio/SoundSynthesizer.js';

export const TOTAL_STAGES_PER_LEVEL = 10;
export const MASTERY_REQUIRED_STARS = 10;
export const STORAGE_KEY_PROGRESS = 'vocabmaster_progress';
export const STORAGE_KEY_CACHED_LEVELS = 'vocabmaster_cached_levels';

export const DEFAULT_GEMS = 240;
export const DEFAULT_STREAK = 5;
export const DEFAULT_LIVES = 5;
export const MASTERY_BONUS_GEMS = 50;

/**
 * Creates an empty 10-stage star tracking array.
 * @returns {boolean[]} Array of 10 false booleans
 */
export const createInitialStageStars = () => Array(TOTAL_STAGES_PER_LEVEL).fill(false);

/**
 * Custom React Hook to manage vocabulary game state, decoupled progression logic,
 * 10-stage level execution, 10-star mastery rules, mistakes accumulation, and persistence.
 *
 * @param {Object} options Configuration options
 * @param {Object} [options.soundController] Optional sound effect controller
 * @returns {Object} Full game state and action handlers
 */
export function useGameState(options = {}) {
  const soundApi = options.soundController || sound;

  // Levels database
  const [levels, setLevels] = useState([]);
  const [isLoadingLevels, setIsLoadingLevels] = useState(true);

  // Progression & Persistence State
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [levelStars, setLevelStars] = useState({});
  const [streak, setStreak] = useState(DEFAULT_STREAK);
  const [gems, setGems] = useState(DEFAULT_GEMS);
  const [lives, setLives] = useState(DEFAULT_LIVES);

  // Active Level State
  const [currentLevel, setCurrentLevel] = useState(null);
  const [stages, setStages] = useState([]);
  const [stageIndex, setStageIndex] = useState(0);
  const [stageStars, setStageStars] = useState(createInitialStageStars);
  const [stageAttempts, setStageAttempts] = useState(0); // 0 = 1st attempt, 1 = 2nd chance, 2 = failed
  const [mistakes, setMistakes] = useState([]);

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState('path'); // 'path' | 'vocab' | 'ranks' | 'profile'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [revealModalData, setRevealModalData] = useState(null);
  const [completionResult, setCompletionResult] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  /**
   * Loads saved user progress from localStorage
   */
  const loadLocalProgress = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.unlockedLevel === 'number') setUnlockedLevel(parsed.unlockedLevel);
        if (parsed.levelStars && typeof parsed.levelStars === 'object') setLevelStars(parsed.levelStars);
        if (typeof parsed.gems === 'number') setGems(parsed.gems);
        if (typeof parsed.streak === 'number') setStreak(parsed.streak);
        if (typeof parsed.lives === 'number') setLives(parsed.lives);
      }
    } catch (e) {
      console.warn('Failed to load local game progress:', e);
    }
  }, []);

  /**
   * Saves updated progress to localStorage
   */
  const saveProgress = useCallback((newUnlocked, newStars, newGems = gems, currentStreak = streak, currentLives = lives) => {
    try {
      const dataToSave = {
        unlockedLevel: newUnlocked,
        levelStars: newStars,
        gems: newGems,
        streak: currentStreak,
        lives: currentLives,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Failed to save game progress:', e);
    }
  }, [gems, streak, lives]);

  /**
   * Loads levels data instantly from local cache/bundle and silently performs
   * background auto-sync from the GitHub repository.
   */
  const loadLevelsData = useCallback(async () => {
    setIsLoadingLevels(true);

    // 1. Instant local load
    try {
      const cached = localStorage.getItem(STORAGE_KEY_CACHED_LEVELS);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && Array.isArray(parsed.levels) && parsed.levels.length > 0) {
            setLevels(parsed.levels);
            setIsLoadingLevels(false);
          }
        } catch {}
      }

      const localRes = await fetch('/data/levels.json');
      if (localRes.ok) {
        const localData = await localRes.json();
        if (localData.levels && Array.isArray(localData.levels)) {
          setLevels(localData.levels);
        }
      }
    } catch (e) {
      console.warn('Local levels load warning:', e);
    } finally {
      setIsLoadingLevels(false);
    }

    // 2. Silent background auto-sync from GitHub
    try {
      const remoteUrl = 'https://raw.githubusercontent.com/mrahatcreations/VocabMaster/main/data';
      const versionRes = await fetch(`${remoteUrl}/version.json`, { cache: 'no-store' });
      if (versionRes.ok) {
        const levelsRes = await fetch(`${remoteUrl}/levels.json`, { cache: 'no-store' });
        if (levelsRes.ok) {
          const remoteData = await levelsRes.json();
          if (remoteData.levels && Array.isArray(remoteData.levels) && remoteData.levels.length > 0) {
            localStorage.setItem(STORAGE_KEY_CACHED_LEVELS, JSON.stringify(remoteData));
            setLevels(remoteData.levels);
          }
        }
      }
    } catch (err) {
      // Silent catch: offline mode or network error, game continues smoothly
    }
  }, []);

  // Initial mount: load progress and levels
  useEffect(() => {
    loadLocalProgress();
    loadLevelsData();
  }, [loadLocalProgress, loadLevelsData]);

  /**
   * Toast notification helper with auto-dismiss
   */
  const showToast = useCallback((msg, type = 'info', duration = 2200) => {
    setToastMessage({ msg, type });
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, duration);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Starts or restarts a 10-stage level
   */
  const handleStartLevel = useCallback((level, isRetry = false) => {
    if (!level) return false;

    if (lives <= 0) {
      showToast('আপনার কোনো হার্টস অবশিষ্ট নেই! কিছুক্ষণ অপেক্ষা করুন।', 'warning');
      return false;
    }

    const compiledStages = buildLevelStages(level, isRetry);
    setCurrentLevel(level);
    setStages(compiledStages);
    setStageIndex(0);
    setStageStars(createInitialStageStars());
    setStageAttempts(0);
    setMistakes([]);
    setCompletionResult(null);
    setRevealModalData(null);

    return true;
  }, [lives, showToast]);

  /**
   * Handles submission of an answer for the current active stage.
   * Tracks 1st attempt vs 2nd chance, star earning, and mistakes accumulator.
   */
  const handleAnswerSubmit = useCallback((userAnswer) => {
    if (!currentLevel || !stages || stages.length === 0) return;

    const currentStage = stages[stageIndex];
    if (!currentStage) return;

    let isCorrect = false;

    if (currentStage.type === STAGE_TYPES.MATCHING) {
      // MatchingStage verifies pairs internally and passes true when all pairs are matched
      isCorrect = Boolean(userAnswer);
    } else {
      isCorrect = String(userAnswer).trim().toLowerCase() === String(currentStage.correctAnswer).trim().toLowerCase();
    }

    if (isCorrect) {
      soundApi.playCorrect();

      // Star is awarded ONLY on the 1st attempt (stageAttempts === 0)
      if (stageAttempts === 0) {
        setStageStars((prevStars) => {
          const updated = [...prevStars];
          updated[stageIndex] = true;
          return updated;
        });
        showToast('দারুণ উত্তর! (+১ স্টার অর্জিত)', 'success');
      } else {
        showToast('সঠিক উত্তর!', 'success');
      }

      // Automatically proceed to next stage after slight delay for visual satisfaction
      setTimeout(() => {
        proceedNextStage();
      }, 700);
    } else {
      // Record mistake in the mistakes accumulator
      const targetItem = currentStage.item || {};
      const mistakeEntry = {
        id: targetItem.id || stageIndex + 1,
        word: targetItem.word || currentStage.targetWord || 'Unknown Word',
        pos: targetItem.pos || '',
        meaning: targetItem.meaning || '',
        sentence: targetItem.sentence || currentStage.sentenceText || '',
        userAnswer: String(userAnswer),
        correctAnswer: String(currentStage.correctAnswer || ''),
        explanation: currentStage.explanation || '',
        stageIndex: stageIndex,
        stageType: currentStage.type
      };

      setMistakes((prevMistakes) => {
        const existsIndex = prevMistakes.findIndex(
          (m) => String(m.word).toLowerCase() === String(mistakeEntry.word).toLowerCase()
        );
        if (existsIndex >= 0) {
          const updated = [...prevMistakes];
          updated[existsIndex] = mistakeEntry;
          return updated;
        }
        return [...prevMistakes, mistakeEntry];
      });

      if (stageAttempts === 0) {
        // First wrong attempt -> Give 2nd chance
        setStageAttempts(1);
        soundApi.playSecondChance();
        showToast('ভুল উত্তর! ২য় সুযোগে আবার চেষ্টা করুন', 'warning');
      } else {
        // Second wrong attempt -> Stage failed, reveal correct answer modal
        setStageAttempts(2);
        soundApi.playWrong();
        setRevealModalData({
          correctAnswer: currentStage.correctAnswer,
          explanation: currentStage.explanation,
          item: currentStage.item
        });
      }
    }
  }, [currentLevel, stages, stageIndex, stageAttempts, soundApi, showToast]);

  /**
   * Advances to the next stage or triggers level completion if all 10 stages are finished.
   */
  const proceedNextStage = useCallback(() => {
    setStageIndex((prevIndex) => {
      const nextIdx = prevIndex + 1;
      const totalStages = stages.length || TOTAL_STAGES_PER_LEVEL;

      if (nextIdx >= totalStages) {
        finishLevel();
        return prevIndex;
      }

      setStageAttempts(0);
      return nextIdx;
    });
  }, [stages]);

  /**
   * Closes the answer reveal modal and proceeds to the next stage.
   */
  const closeRevealModalAndProceed = useCallback(() => {
    setRevealModalData(null);
    proceedNextStage();
  }, [proceedNextStage]);

  /**
   * Calculates level completion score, applies 10-Star mastery rule (10/10 stars to unlock next level),
   * updates gems and stars, and persists to localStorage.
   */
  const finishLevel = useCallback(() => {
    if (!currentLevel) return;

    setStageStars((currentStars) => {
      const totalStarsEarned = currentStars.filter(Boolean).length;
      const totalStages = stages.length || TOTAL_STAGES_PER_LEVEL;
      const isTenStar = totalStarsEarned === totalStages && totalStarsEarned === MASTERY_REQUIRED_STARS;

      let newUnlocked = unlockedLevel;
      let newGems = gems;
      const previousStars = levelStars[currentLevel.level_id] || 0;
      const bestStars = Math.max(previousStars, totalStarsEarned);
      const updatedLevelStars = { ...levelStars, [currentLevel.level_id]: bestStars };

      if (isTenStar) {
        soundApi.playVictory();
        newGems += MASTERY_BONUS_GEMS;
        setGems(newGems);

        if (currentLevel.level_id >= unlockedLevel) {
          newUnlocked = currentLevel.level_id + 1;
          setUnlockedLevel(newUnlocked);
        }
      }

      setLevelStars(updatedLevelStars);
      saveProgress(newUnlocked, updatedLevelStars, newGems, streak, lives);

      setCompletionResult({
        level: currentLevel,
        totalStars: totalStarsEarned,
        maxStars: totalStages,
        isTenStar: isTenStar,
        isMastered: isTenStar,
        mistakes: mistakes,
        earnedGems: isTenStar ? MASTERY_BONUS_GEMS : 0,
        newUnlockedLevel: newUnlocked
      });

      return currentStars;
    });
  }, [currentLevel, stages.length, unlockedLevel, gems, levelStars, streak, lives, soundApi, saveProgress, mistakes]);

  /**
   * Navigation helper: advances to the next level or returns to map
   */
  const handleNextLevel = useCallback(() => {
    if (!currentLevel) {
      setCurrentLevel(null);
      return;
    }
    const nextLvl = levels.find((l) => l.level_id === currentLevel.level_id + 1);
    if (nextLvl) {
      handleStartLevel(nextLvl, false);
    } else {
      setCurrentLevel(null);
    }
  }, [currentLevel, levels, handleStartLevel]);

  /**
   * Navigation helper: retries the current level with scrambled stage layout
   */
  const handleRetryLevel = useCallback(() => {
    if (currentLevel) {
      handleStartLevel(currentLevel, true);
    }
  }, [currentLevel, handleStartLevel]);

  /**
   * Navigation helper: exits active level and returns to map
   */
  const handleBackToMap = useCallback(() => {
    setCurrentLevel(null);
    setCompletionResult(null);
    setRevealModalData(null);
  }, []);

  /**
   * Resets all game progress back to factory defaults
   */
  const resetAllProgress = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_PROGRESS);
    } catch {}
    setUnlockedLevel(1);
    setLevelStars({});
    setStreak(DEFAULT_STREAK);
    setGems(DEFAULT_GEMS);
    setLives(DEFAULT_LIVES);
    setCurrentLevel(null);
    setCompletionResult(null);
    setRevealModalData(null);
    showToast('সকল প্রগ্রেস রিসেট করা হয়েছে', 'info');
  }, [showToast]);

  const currentStage = stages && stages.length > 0 ? stages[stageIndex] : null;

  return {
    // Levels & Loading
    levels,
    setLevels,
    isLoadingLevels,
    loadLevelsData,

    // Progression State
    unlockedLevel,
    setUnlockedLevel,
    levelStars,
    setLevelStars,
    streak,
    setStreak,
    gems,
    setGems,
    lives,
    setLives,
    loadLocalProgress,
    saveProgress,
    resetAllProgress,

    // Active Level / 10-Stage Session
    currentLevel,
    setCurrentLevel,
    stages,
    stageIndex,
    stageStars,
    stageAttempts,
    currentStage,
    mistakes,
    revealModalData,
    setRevealModalData,
    completionResult,
    setCompletionResult,

    // Actions & Game Logic Handlers
    handleStartLevel,
    handleAnswerSubmit,
    proceedNextStage,
    closeRevealModalAndProceed,
    finishLevel,
    handleNextLevel,
    handleRetryLevel,
    handleBackToMap,

    // Navigation & UI State
    activeTab,
    setActiveTab,
    isSettingsOpen,
    setIsSettingsOpen,
    toastMessage,
    setToastMessage,
    showToast
  };
}

export default useGameState;
