import { useState, useEffect, useCallback, useRef } from 'react';
import { buildLevelStages, STAGE_TYPES } from '../engine/GameEngine.js';
import { sound } from '../audio/SoundSynthesizer.js';
import confetti from 'canvas-confetti';
import { defaultLevelsData } from '../data/defaultLevels.js';
import { mistakeManager } from '../utils/mistakeManager.js';

export const TOTAL_STAGES_PER_LEVEL = 10;
export const STARS_PER_STAGE = 0.5;
export const MAX_STARS_PER_LEVEL = 5.0;
export const MASTERY_REQUIRED_STARS = 5.0;
export const STORAGE_KEY_PROGRESS = 'vocabmaster_progress';
export const STORAGE_KEY_CACHED_LEVELS = 'vocabmaster_cached_levels_v2_1';

export const DEFAULT_GEMS = 240;
export const DEFAULT_STREAK = 5;
export const DEFAULT_LIVES = 5;
export const MASTERY_BONUS_GEMS = 50;

/**
 * Bulletproof normalizer for level schemas from GitHub CDN or local storage.
 * Ensures consistent item arrays, sentences, synonyms, antonyms, and level IDs.
 */
export function normalizeLevelsData(rawLevels) {
  if (!Array.isArray(rawLevels)) return [];
  return rawLevels.map((lvl, lIdx) => {
    const levelId = Number(lvl.level_id || lvl.id || (lIdx + 1));
    const items = Array.isArray(lvl.items)
      ? lvl.items.map((item, iIdx) => {
          const word = String(item.word || '').trim();
          const meaning = String(item.meaning || '').trim();

          let synonyms = [];
          if (Array.isArray(item.synonyms)) {
            synonyms = item.synonyms.map(s => String(s).trim()).filter(Boolean);
          } else if (typeof item.synonyms === 'string') {
            synonyms = item.synonyms.split(/[,;|]+/).map(s => s.trim()).filter(Boolean);
          } else if (typeof item.raw_synonyms === 'string') {
            synonyms = item.raw_synonyms.split(/[,;|]+/).map(s => s.trim()).filter(Boolean);
          }

          let antonyms = [];
          if (Array.isArray(item.antonyms)) {
            antonyms = item.antonyms.map(a => String(a).trim()).filter(Boolean);
          } else if (typeof item.antonyms === 'string') {
            antonyms = item.antonyms.split(/[,;|]+/).map(a => a.trim()).filter(Boolean);
          } else if (typeof item.raw_antonyms === 'string') {
            antonyms = item.raw_antonyms.split(/[,;|]+/).map(a => a.trim()).filter(Boolean);
          }

          const sentence = String(item.sentence || '').trim() || `The word "${word}" means ${meaning}.`;

          return {
            id: item.id || `lvl_${levelId}_item_${iIdx + 1}`,
            word: word || `Word ${iIdx + 1}`,
            meaning: meaning || 'অর্থ উপলব্ধ নয়',
            pos: String(item.pos || 'n').toLowerCase(),
            synonyms,
            antonyms,
            raw_synonyms: item.raw_synonyms || synonyms.join(', '),
            raw_antonyms: item.raw_antonyms || antonyms.join(', '),
            sentence,
            category: item.category || lvl.category || 'Vocabulary',
            unit: item.unit || lvl.unit || `Unit ${levelId}`
          };
        })
      : [];

    return {
      ...lvl,
      level_id: levelId,
      title: lvl.title || `Level ${levelId}: ${lvl.category || 'Vocabulary'}`,
      unit: lvl.unit || `Image ${levelId}: Vocabulary`,
      category: lvl.category || 'Vocabulary',
      items
    };
  });
}

/**
 * Creates an empty 10-stage star tracking array.
 * @returns {boolean[]} Array of 10 false booleans
 */
export const createInitialStageStars = () => Array(TOTAL_STAGES_PER_LEVEL).fill(false);

/**
 * Custom React Hook to manage vocabulary game state, decoupled progression logic,
 * 10-stage level execution, 5-star mastery rules (0.5 star per stage), mistakes accumulation, and persistence.
 *
 * @param {Object} options Configuration options
 * @param {Object} [options.soundController] Optional sound effect controller
 * @returns {Object} Full game state and action handlers
 */
export function useGameState(options = {}) {
  const soundApi = options.soundController || sound;

  // Levels database - Synchronous instant initialization for 100% offline cold-start resiliency
  const [levels, setLevels] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_CACHED_LEVELS);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.levels) && parsed.levels.length > 0) {
          return parsed.levels;
        }
      }
    } catch (e) {}
    return defaultLevelsData?.levels || [];
  });
  const [isLoadingLevels, setIsLoadingLevels] = useState(false);

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
  const [stageCelebration, setStageCelebration] = useState(null);

  /**
   * Loads saved user progress from localStorage
   */
  const loadLocalProgress = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.unlockedLevel === 'number') setUnlockedLevel(parsed.unlockedLevel);
        if (parsed.levelStars && typeof parsed.levelStars === 'object') {
          const normalized = {};
          Object.entries(parsed.levelStars).forEach(([lvlId, starVal]) => {
            const num = Number(starVal) || 0;
            normalized[lvlId] = num > 5 ? Number((num * 0.5).toFixed(1)) : num;
          });
          setLevelStars(normalized);
        }
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
   * Loads fresh levels & learning data from GitHub CDN with instant local cache and offline fallback
   */
  const loadLevelsData = useCallback(async () => {
    // 1. Instant Cache Hydration: Render immediately if cached
    try {
      const cached = localStorage.getItem(STORAGE_KEY_CACHED_LEVELS);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.levels) && parsed.levels.length > 0) {
          setLevels(normalizeLevelsData(parsed.levels));
          setIsLoadingLevels(false);
        }
      }
    } catch (e) {}

    const GITHUB_LEVELS_URL = 'https://raw.githubusercontent.com/mrahatcreations/KnowledgeHub/main/public/data/levels.json';

    try {
      // 2. Fetch latest data from GitHub Cloud CDN
      let dataLoaded = false;
      try {
        const remoteRes = await fetch(`${GITHUB_LEVELS_URL}?v=${Date.now()}`, { cache: 'no-cache' });
        if (remoteRes.ok) {
          const remoteData = await remoteRes.json();
          if (remoteData.levels && Array.isArray(remoteData.levels) && remoteData.levels.length > 0) {
            const normalized = normalizeLevelsData(remoteData.levels);
            localStorage.setItem(STORAGE_KEY_CACHED_LEVELS, JSON.stringify({ ...remoteData, levels: normalized }));
            setLevels(normalized);
            dataLoaded = true;
          }
        }
      } catch (networkErr) {
        // Network offline or GitHub unreachable
      }

      // 3. If remote failed and not yet loaded, try local bundle fallback
      if (!dataLoaded) {
        const localRes = await fetch('/data/levels.json?v=' + Date.now(), { cache: 'no-cache' });
        if (localRes.ok) {
          const localData = await localRes.json();
          if (localData.levels && Array.isArray(localData.levels)) {
            const normalized = normalizeLevelsData(localData.levels);
            localStorage.setItem(STORAGE_KEY_CACHED_LEVELS, JSON.stringify({ ...localData, levels: normalized }));
            setLevels(normalized);
          }
        }
      }
    } catch (e) {
      console.warn('Game data sync note:', e);
    } finally {
      setIsLoadingLevels(false);
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

  const stageStarsRef = useRef(createInitialStageStars());
  const mistakesRef = useRef([]);

  /**
   * Calculates level completion score, applies 5-Star mastery rule,
   * updates gems and stars, and persists to localStorage.
   */
  const finishLevel = useCallback((overrideStars = null, overrideMistakes = null) => {
    if (!currentLevel) return;

    const starsToUse = overrideStars || stageStarsRef.current || stageStars;
    const mistakesToUse = overrideMistakes || mistakesRef.current || mistakes;
    const correctStagesCount = (starsToUse || []).filter(Boolean).length;
    const totalStarsEarned = Number((correctStagesCount * 0.5).toFixed(1));
    const totalStages = stages.length || TOTAL_STAGES_PER_LEVEL;
    
    // Unlock rule: >= 3.5 Stars (70%+) unlocks the next level!
    // 5.0 Stars awards Perfect Mastery Bonus (+50 Gems)
    const isPassed = totalStarsEarned >= 3.5;
    const isFiveStar = totalStarsEarned >= MASTERY_REQUIRED_STARS;

    let newUnlocked = unlockedLevel;
    let newGems = gems;
    const previousStars = levelStars[currentLevel.level_id] || 0;
    const normalizedPrev = previousStars > 5 ? Number((previousStars * 0.5).toFixed(1)) : previousStars;
    const bestStars = Math.max(normalizedPrev, totalStarsEarned);
    const updatedLevelStars = { ...levelStars, [currentLevel.level_id]: bestStars };

    if (isFiveStar) {
      soundApi.playVictory();
      newGems += MASTERY_BONUS_GEMS;
      setGems(newGems);
    } else if (isPassed) {
      soundApi.playLevelComplete?.() || soundApi.playVictory();
    }

    if (isPassed && currentLevel.level_id >= unlockedLevel) {
      newUnlocked = currentLevel.level_id + 1;
      setUnlockedLevel(newUnlocked);
    }

    setLevelStars(updatedLevelStars);
    saveProgress(newUnlocked, updatedLevelStars, newGems, streak, lives);

    setCompletionResult({
      level: currentLevel,
      totalStars: totalStarsEarned,
      maxStars: 5,
      totalStages: totalStages,
      correctStagesCount: correctStagesCount,
      isPassed: isPassed,
      isFiveStar: isFiveStar,
      isMastered: isFiveStar,
      mistakes: mistakesToUse,
      earnedGems: isFiveStar ? MASTERY_BONUS_GEMS : 0,
      newUnlockedLevel: newUnlocked
    });
  }, [currentLevel, stageStars, mistakes, stages.length, unlockedLevel, gems, levelStars, streak, lives, soundApi, saveProgress]);

  /**
   * Advances to the next stage or triggers level completion if all 10 stages are finished.
   */
  const proceedNextStage = useCallback((overrideStars = null) => {
    setRevealModalData(null);
    setStageCelebration(null);
    setStageAttempts(0);

    setStageIndex((prevIndex) => {
      const nextIdx = prevIndex + 1;
      const totalStages = stages.length || TOTAL_STAGES_PER_LEVEL;

      if (nextIdx >= totalStages) {
        finishLevel(overrideStars);
        return prevIndex;
      }

      return nextIdx;
    });
  }, [stages.length, finishLevel]);

  /**
   * Closes the answer reveal modal and proceeds to the next stage.
   */
  const closeRevealModalAndProceed = useCallback(() => {
    setRevealModalData(null);
    proceedNextStage();
  }, [proceedNextStage]);

  /**
   * Starts or restarts a 10-stage level
   */
  const handleStartLevel = useCallback((levelInput, isRetry = false) => {
    if (!levelInput) return false;

    if (lives <= 0) {
      showToast('You are out of lives! Please wait a moment.', 'warning');
      return false;
    }

    // Resolve levelInput whether it is a number id or object
    let targetLevel = levelInput;
    if (typeof levelInput === 'number') {
      targetLevel = levels.find((l) => l.level_id === levelInput) || levels[0];
    }

    if (!targetLevel || !Array.isArray(targetLevel.items) || targetLevel.items.length === 0) {
      console.warn('Target level items missing, using fallback level');
      targetLevel = levels[0] || defaultLevelsData?.levels?.[0];
    }

    const compiledStages = buildLevelStages(targetLevel, isRetry);
    const initialStars = createInitialStageStars();
    stageStarsRef.current = initialStars;
    mistakesRef.current = [];
    setCurrentLevel(targetLevel);
    setStages(compiledStages);
    setStageIndex(0);
    setStageStars(initialStars);
    setStageAttempts(0);
    setMistakes([]);
    setCompletionResult(null);
    setRevealModalData(null);

    return true;
  }, [lives, levels, showToast]);

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

      let nextStars = stageStarsRef.current;
      // Star is awarded ONLY on the 1st attempt without any mistakes (stageAttempts === 0)
      if (stageAttempts === 0) {
        nextStars = [...stageStarsRef.current];
        nextStars[stageIndex] = true;
        stageStarsRef.current = nextStars;
        setStageStars(nextStars);

        // Trigger rich micro-celebration animation on 1st attempt!
        setStageCelebration({
          starsEarned: 0.5,
          title: 'Perfect! +0.5 ⭐',
          subtitle: 'Flawless 1st attempt!',
          stageIndex: stageIndex
        });

        try {
          confetti({
            particleCount: 55,
            spread: 70,
            origin: { y: 0.65 },
            colors: ['#fbbf24', '#34d399', '#818cf8', '#f472b6', '#38bdf8']
          });
        } catch (e) {}

        showToast('Perfect! +0.5 Star ⭐', 'success');
      } else {
        showToast('Correct! (2nd Chance)', 'success');
      }

      // Automatically proceed to next stage after celebration delay
      setTimeout(() => {
        setStageCelebration(null);
        proceedNextStage(nextStars);
      }, stageAttempts === 0 ? 850 : 650);
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

      const prevMistakes = mistakesRef.current;
      const existsIndex = prevMistakes.findIndex(
        (m) => String(m.word).toLowerCase() === String(mistakeEntry.word).toLowerCase()
      );
      const updatedMistakes = existsIndex >= 0 
        ? prevMistakes.map((m, idx) => idx === existsIndex ? mistakeEntry : m)
        : [...prevMistakes, mistakeEntry];
      mistakesRef.current = updatedMistakes;
      setMistakes(updatedMistakes);

      // Persist to unified mistake history across entire app
      try {
        mistakeManager.recordMistake({
          id: `vocab_${String(mistakeEntry.word).toLowerCase()}`,
          source: 'vocab_game',
          subject: 'Vocabulary',
          subTitle: `Level ${currentLevel}: Vocabulary`,
          questionText: mistakeEntry.word,
          userAnswer: mistakeEntry.userAnswer,
          correctAnswer: mistakeEntry.correctAnswer || mistakeEntry.meaning,
          explanation: mistakeEntry.meaning 
            ? `অর্থ: ${mistakeEntry.meaning}${mistakeEntry.sentence ? `\nউদাহরণ: ${mistakeEntry.sentence}` : ''}`
            : mistakeEntry.explanation
        });
      } catch (err) {
        console.warn('Failed to record mistake in unified manager:', err);
      }

      if (stageAttempts === 0) {
        // First wrong attempt -> Give 2nd chance
        setStageAttempts(1);
        soundApi.playSecondChance();
        showToast('Incorrect! Try again on your 2nd chance', 'warning');
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
  }, [currentLevel, stages, stageIndex, stageAttempts, soundApi, showToast, proceedNextStage]);

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
    showToast('All progress has been reset', 'info');
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
    showToast,
    stageCelebration
  };
}

export default useGameState;
