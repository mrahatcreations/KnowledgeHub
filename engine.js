/**
 * UNIVERSAL VOCABULARY & LEARNING GAME ENGINE ("THE BLENDER")
 * Features:
 * - 5 Distinct Educational Stages (Flash Card, Matching, Drag & Drop, True/False Swipe, Odd One Out)
 * - Pure Procedural Web Audio API sound effects (No external audio files required)
 * - Strict Zero-Emoji Educational SVG Visuals
 * - Second-Chance Mistake Handling & Correct Answer Reveal
 * - 5-Star Level Mastery with Cross-Stage Randomization ("The Blender")
 * - Dynamic JSON Data Adapter (Works for English, Science, GK, etc.)
 */

// ==========================================
// 1. PROCEDURAL WEB AUDIO SYNTHESIZER
// ==========================================
class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

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
        gain.gain.setValueAtTime(0, now + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.3);
      });
    } catch (e) {}
  }

  playWrong() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.25);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  playSecondChance() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(660, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  playFlip() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  playSwipe() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0.25, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.45);
      });
    } catch (e) {}
  }

  speak(text) {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[^a-zA-Z\s-]/g, '');
      if (!cleanText) return;
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }
}

// ==========================================
// 2. HELPER UTILITIES
// ==========================================
function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getRandomDistractors(allItems, currentItem, count = 3, key = 'meaning') {
  const others = allItems.filter(item => item.id !== currentItem.id && item[key]);
  const shuffled = shuffleArray(others);
  return shuffled.slice(0, count).map(it => it[key]);
}

// ==========================================
// 3. THE BLENDER (UNIVERSAL STAGE GENERATOR)
// ==========================================
const STAGE_TYPES = {
  FLASHCARD: 'flashcard',
  MATCHING: 'matching',
  DRAG_DROP: 'drag_drop',
  TRUE_FALSE: 'true_false',
  ODD_ONE_OUT: 'odd_one_out'
};

class GameEngine {
  constructor() {
    this.sound = new SoundSynthesizer();
    this.currentLevel = null;
    this.stageIndex = 0;
    this.stages = [];
    this.stageStars = [false, false, false, false, false];
    this.stageAttempts = 0; // 0: 1st chance, 1: 2nd chance, 2: failed
    this.allLevels = [];
    this.progress = {
      unlockedLevel: 1,
      levelStars: {}
    };
    this.loadProgress();
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem('edu_vocab_game_progress');
      if (saved) {
        this.progress = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Progress load failed:', e);
    }
  }

  saveProgress() {
    try {
      localStorage.setItem('edu_vocab_game_progress', JSON.stringify(this.progress));
    } catch (e) {
      console.warn('Progress save failed:', e);
    }
  }

  setLevels(levelsData) {
    this.allLevels = levelsData;
  }

  /**
   * The Blender: Compiles a 5-stage level with cross-stage randomization
   * @param {Object} level - The level data object with 5 raw items
   * @param {boolean} isRetry - True if retrying (triggers cross-stage shuffle)
   */
  buildLevelStages(level, isRetry = false) {
    this.currentLevel = level;
    this.stageIndex = 0;
    this.stageStars = [false, false, false, false, false];
    this.stageAttempts = 0;

    const items = [...level.items];
    while (items.length < 5) {
      items.push({ ...items[items.length % items.length], id: Math.random() });
    }

    // Default stage order: Flashcard -> Matching -> DragDrop -> TrueFalse -> OddOneOut
    let stageTypes = [
      STAGE_TYPES.FLASHCARD,
      STAGE_TYPES.MATCHING,
      STAGE_TYPES.DRAG_DROP,
      STAGE_TYPES.TRUE_FALSE,
      STAGE_TYPES.ODD_ONE_OUT
    ];

    if (isRetry) {
      // Cross-stage randomization on retry
      stageTypes = shuffleArray(stageTypes);
    }

    // Generate each stage payload dynamically
    this.stages = stageTypes.map((type, idx) => {
      const item = items[idx % items.length];
      const allLevelItems = level.items;

      switch (type) {
        case STAGE_TYPES.FLASHCARD:
          return this.generateFlashcardStage(item, allLevelItems);
        case STAGE_TYPES.MATCHING:
          return this.generateMatchingStage(allLevelItems);
        case STAGE_TYPES.DRAG_DROP:
          return this.generateDragDropStage(item, allLevelItems);
        case STAGE_TYPES.TRUE_FALSE:
          return this.generateTrueFalseStage(item, allLevelItems);
        case STAGE_TYPES.ODD_ONE_OUT:
          return this.generateOddOneOutStage(item, allLevelItems);
        default:
          return this.generateFlashcardStage(item, allLevelItems);
      }
    });

    return this.stages;
  }

  // Stage 1: Flashcard Generator
  generateFlashcardStage(item, allItems) {
    const distractors = getRandomDistractors(allItems, item, 3, 'meaning');
    const options = shuffleArray([item.meaning, ...distractors]);
    return {
      type: STAGE_TYPES.FLASHCARD,
      title: 'ফ্ল্যাশ কার্ড ও স্মৃতি পরীক্ষা (Flash Card & Active Recall)',
      instruction: 'কার্ডটি ফ্লিপ করে অর্থ দেখুন এবং সঠিক বিকল্পটি নির্বাচন করুন',
      item: item,
      question: `"${item.word}" শব্দটির সঠিক বাংলা অর্থ কোনটি?`,
      options: options,
      correctAnswer: item.meaning,
      explanation: `"${item.word}" (${item.pos || 'Word'}) এর বাংলা অর্থ: "${item.meaning}"। ${item.raw_synonyms ? 'সমার্থক শব্দ: ' + item.raw_synonyms : ''}`
    };
  }

  // Stage 2: Matching Generator
  generateMatchingStage(allItems) {
    const selected = shuffleArray(allItems).slice(0, 4);
    const leftItems = selected.map(it => ({ id: it.id, text: it.word }));
    const rightItems = shuffleArray(selected.map(it => ({ id: it.id, text: it.meaning })));

    return {
      type: STAGE_TYPES.MATCHING,
      title: 'বাম-ডান জোড়া মেলানো (Left-Right Matching)',
      instruction: 'বাম পাশের ইংরেজি শব্দের সাথে ডান পাশের সঠিক বাংলা অর্থ মিলিয়ে জোড়া তৈরি করুন',
      leftItems: shuffleArray(leftItems),
      rightItems: rightItems,
      totalPairs: selected.length,
      explanation: 'সকল ইংরেজি শব্দ ও তাদের বাংলা অর্থ সঠিকভাবে মেলানো হয়েছে!'
    };
  }

  // Stage 3: Drag & Drop Generator
  generateDragDropStage(item, allItems) {
    let sentence = item.sentence;
    let targetWord = item.word;

    let maskedSentence = '';
    if (sentence && sentence.toLowerCase().includes(targetWord.toLowerCase())) {
      const reg = new RegExp(`\\b${targetWord}\\b`, 'gi');
      maskedSentence = sentence.replace(reg, '_______');
    } else {
      maskedSentence = `সঠিক শব্দ বসান: [_______] যার অর্থ "${item.meaning}"।`;
    }

    const distractors = getRandomDistractors(allItems, item, 3, 'word');
    const options = shuffleArray([targetWord, ...distractors]);

    return {
      type: STAGE_TYPES.DRAG_DROP,
      title: 'বাক্যের শূন্যস্থান পূরণ (Drag & Drop Fill-in)',
      instruction: 'নিচের বিকল্পগুলো থেকে উপযুক্ত শব্দটি বেছে ফাঁকা জায়গায় বসান',
      item: item,
      sentenceText: maskedSentence,
      targetWord: targetWord,
      options: options,
      correctAnswer: targetWord,
      explanation: `সঠিক উত্তর: "${targetWord}"। এর বাংলা অর্থ "${item.meaning}"।`
    };
  }

  // Stage 4: True/False Swipe Generator
  generateTrueFalseStage(item, allItems) {
    const isTrue = Math.random() >= 0.5;
    let displayedMeaning = item.meaning;

    if (!isTrue) {
      const distractors = getRandomDistractors(allItems, item, 1, 'meaning');
      displayedMeaning = distractors.length > 0 ? distractors[0] : 'ভুল অর্থ';
    }

    return {
      type: STAGE_TYPES.TRUE_FALSE,
      title: 'সত্য না মিথ্যা যাচাই (True/False Swipe)',
      instruction: 'বিবৃতিটি সঠিক হলে ডানে সোয়াইপ করুন / True চাপুন, ভুল হলে বামে সোয়াইপ করুন / False চাপুন',
      item: item,
      statement: `"${item.word}" শব্দটির বাংলা অর্থ হলো "${displayedMeaning}"।`,
      displayedMeaning: displayedMeaning,
      isTrue: isTrue,
      correctAnswer: isTrue ? 'TRUE' : 'FALSE',
      explanation: isTrue 
        ? `সঠিক! "${item.word}" এর আসল অর্থ "${item.meaning}"।` 
        : `ভুল! "${item.word}" এর প্রকৃত অর্থ "${item.meaning}"।`
    };
  }

  // Stage 5: Odd One Out Generator
  generateOddOneOutStage(item, allItems) {
    let syns = (item.synonyms && item.synonyms.length >= 2) ? item.synonyms.slice(0, 3) : [];
    let oddWord = '';
    let categoryTitle = '';

    if (syns.length >= 2 && item.antonyms && item.antonyms.length > 0) {
      oddWord = item.antonyms[0];
      const choices = shuffleArray([item.word, ...syns.slice(0, 2), oddWord]);
      categoryTitle = `"${item.word}" এর সমার্থক শব্দগুলোর মধ্যে বেমানান/বিপরীত শব্দটি চিহ্নিত করুন:`;
      return {
        type: STAGE_TYPES.ODD_ONE_OUT,
        title: 'বেমানান শব্দ বাছাই (Odd One Out)',
        instruction: 'নিচের চারটি শব্দের মধ্যে কোনটি বেমানান, অর্থাৎ অন্য শব্দগুলোর সাথে মিলছে না তা নির্বাচন করুন',
        categoryTitle: categoryTitle,
        options: choices,
        correctAnswer: oddWord,
        explanation: `সঠিক উত্তর: "${oddWord}"। এটি বিপরীত শব্দ (Antonym), পক্ষান্তরে অন্যগুলো "${item.word}" এর সমার্থক শব্দ (Synonyms)।`
      };
    } else {
      const distractors = getRandomDistractors(allItems, item, 1, 'word');
      oddWord = distractors.length > 0 ? distractors[0] : 'Unrelated';
      const related = [item.word, ...(item.synonyms || []).slice(0, 2)];
      while (related.length < 3) {
        related.push(item.meaning || 'Meaning');
      }
      const choices = shuffleArray([...related.slice(0, 3), oddWord]);
      return {
        type: STAGE_TYPES.ODD_ONE_OUT,
        title: 'বেমানান শব্দ বাছাই (Odd One Out)',
        instruction: 'প্রদত্ত তালিকা থেকে বেমানান (Odd) শব্দটি বেছে বের করুন',
        categoryTitle: `"${item.word}" শব্দের সাথে অর্থগতভাবে সম্পর্কিত নয় এমন শব্দ:`,
        options: choices,
        correctAnswer: oddWord,
        explanation: `সঠিক উত্তর: "${oddWord}"। এটি অন্য শব্দগুলোর সাথে প্রাসঙ্গিক নয়।`
      };
    }
  }

  getCurrentStage() {
    return this.stages[this.stageIndex];
  }

  handleAnswerSubmission(userAnswer, onResult) {
    const stage = this.getCurrentStage();
    let isCorrect = false;

    if (stage.type === STAGE_TYPES.MATCHING) {
      isCorrect = true;
    } else {
      isCorrect = (String(userAnswer).trim().toLowerCase() === String(stage.correctAnswer).trim().toLowerCase());
    }

    if (isCorrect) {
      if (this.stageAttempts === 0) {
        this.stageStars[this.stageIndex] = true;
      }
      this.sound.playCorrect();
      onResult({
        status: 'CORRECT',
        starEarned: this.stageAttempts === 0,
        explanation: stage.explanation
      });
    } else {
      if (this.stageAttempts === 0) {
        this.stageAttempts = 1;
        this.stageStars[this.stageIndex] = false;
        this.sound.playSecondChance();
        onResult({
          status: 'SECOND_CHANCE',
          starEarned: false,
          message: 'ভুল উত্তর! দ্বিতীয় সুযোগে পুনরায় চেষ্টা করুন।'
        });
      } else {
        this.stageAttempts = 2;
        this.stageStars[this.stageIndex] = false;
        this.sound.playWrong();
        onResult({
          status: 'FAILED',
          starEarned: false,
          correctAnswer: stage.correctAnswer,
          explanation: stage.explanation
        });
      }
    }
  }

  nextStage() {
    this.stageIndex++;
    this.stageAttempts = 0;
    if (this.stageIndex >= this.stages.length) {
      return this.evaluateLevelCompletion();
    }
    return { isLevelComplete: false, stage: this.getCurrentStage() };
  }

  evaluateLevelCompletion() {
    const totalStars = this.stageStars.filter(Boolean).length;
    const isFiveStar = (totalStars === 5);

    if (isFiveStar) {
      this.sound.playVictory();
      if (this.currentLevel.level_id >= this.progress.unlockedLevel) {
        this.progress.unlockedLevel = this.currentLevel.level_id + 1;
      }
      this.progress.levelStars[this.currentLevel.level_id] = 5;
      this.saveProgress();
    }

    return {
      isLevelComplete: true,
      totalStars: totalStars,
      isFiveStar: isFiveStar,
      unlockedNext: isFiveStar
    };
  }
}

window.GameEngine = GameEngine;
window.STAGE_TYPES = STAGE_TYPES;