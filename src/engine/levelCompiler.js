/**
 * 10-STAGE LEVEL COMPILER & GAME ENGINE ("THE BLENDER")
 * 
 * Generates exactly 10 dynamic educational stages per level:
 * - Iteration 1: Stages 1-5 covering Words 1-5 across the 5 core game modes.
 * - Iteration 2: Stages 6-10 covering Words 1-5 with swapped game modes for reinforced active recall.
 * - Full cross-stage randomization on retry (isRetry = true).
 * 
 * Core Game Modes:
 * 1. Flashcard (Active Recall Quiz + 3D Card Face)
 * 2. Left-Right Matching (Interactive Pair Connection)
 * 3. Drag & Drop Fill-in (Contextual Sentence Completion)
 * 4. True/False Swipe (Binary Fact Verification)
 * 5. Odd One Out (Synonym / Antonym Discrimination)
 */

export const STAGE_TYPES = {
  FLASHCARD: 'flashcard',
  MATCHING: 'matching',
  DRAG_DROP: 'drag_drop',
  TRUE_FALSE: 'true_false',
  ODD_ONE_OUT: 'odd_one_out'
};

export const CORE_STAGE_MODES = [
  STAGE_TYPES.FLASHCARD,
  STAGE_TYPES.MATCHING,
  STAGE_TYPES.DRAG_DROP,
  STAGE_TYPES.TRUE_FALSE,
  STAGE_TYPES.ODD_ONE_OUT
];

export const STAGE_TITLES = {
  [STAGE_TYPES.FLASHCARD]: 'ফ্ল্যাশ কার্ড ও স্মরণ পরীক্ষা (Flash Card)',
  [STAGE_TYPES.MATCHING]: 'বাম-ডান মিলকরণ (Left-Right Matching)',
  [STAGE_TYPES.DRAG_DROP]: 'শূন্যস্থান পূরণ (Drag & Drop Fill-in)',
  [STAGE_TYPES.TRUE_FALSE]: 'সত্য/মিথ্যা যাচাই (True/False Swipe)',
  [STAGE_TYPES.ODD_ONE_OUT]: 'বেমানান শব্দ বাছাই (Odd One Out)'
};

export const STAGE_INSTRUCTIONS = {
  [STAGE_TYPES.FLASHCARD]: 'শব্দটি দেখুন এবং সঠিক বাংলা অর্থ নির্বাচন করুন',
  [STAGE_TYPES.MATCHING]: 'বাম পাশের ইংরেজি শব্দের সাথে ডান পাশের সঠিক বাংলা অর্থ মেলাও',
  [STAGE_TYPES.DRAG_DROP]: 'সঠিক শব্দটি টেনে খালি বক্সে বসাও বা ক্লিক করে নির্বাচন করো',
  [STAGE_TYPES.TRUE_FALSE]: 'বিবৃতিটি সত্য হলে TRUE অথবা মিথ্যা হলে FALSE নির্বাচন করুন',
  [STAGE_TYPES.ODD_ONE_OUT]: 'চারটি বিকল্পের মধ্য থেকে বেমানান বা বিপরীত (Odd) শব্দটি বেছে নাও'
};

/**
 * Pure Fisher-Yates array shuffle. Returns a new shuffled copy.
 * @param {Array} arr 
 * @returns {Array} Shuffled array
 */
export function shuffleArray(arr) {
  if (!Array.isArray(arr)) return [];
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Safely extracts a clean list of string words from an array or comma/semicolon delimited string.
 * @param {Array|string} list 
 * @param {string} raw 
 * @returns {string[]}
 */
export function extractWordList(list, raw) {
  if (Array.isArray(list) && list.length > 0) {
    return list.filter(w => typeof w === 'string' && w.trim().length > 0).map(w => w.trim());
  }
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.split(/[,;|]+/).map(w => w.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Selects random distractors from other level items, with comprehensive fallback pools.
 * @param {Array} allItems - All items in the level
 * @param {Object} currentItem - Current target item
 * @param {number} count - Desired number of distractors
 * @param {string} key - Item property key ('meaning' or 'word')
 * @returns {string[]} Array of distractor strings
 */
export function getRandomDistractors(allItems, currentItem, count = 3, key = 'meaning') {
  const currentId = currentItem ? currentItem.id : null;
  const currentTargetVal = (currentItem && currentItem[key]) ? String(currentItem[key]).trim().toLowerCase() : '';

  const others = (allItems || []).filter(
    item => item && item.id !== currentId && item[key] && String(item[key]).trim().length > 0
  );

  const shuffled = shuffleArray(others);
  const picked = [];
  const seen = new Set();
  if (currentTargetVal) {
    seen.add(currentTargetVal);
  }

  for (const it of shuffled) {
    const val = String(it[key]).trim();
    const valLower = val.toLowerCase();
    if (!seen.has(valLower)) {
      seen.add(valLower);
      picked.push(val);
      if (picked.length >= count) break;
    }
  }

  const fallbackPools = {
    meaning: [
      'সম্পর্কযুক্ত করা',
      'উন্নতি সাধন',
      'সতর্কীকরণ',
      'মূল্যায়ন',
      'পরিবর্তনশীল',
      'সংরক্ষণ করা',
      'ব্যাখ্যা করা',
      'প্রতিষ্ঠা করা',
      'প্রভাব বিস্তার করা',
      'রূপান্তর করা',
      'উৎসাহিত করা',
      'পুনর্বিবেচনা করা'
    ],
    word: [
      'Facilitate',
      'Enhance',
      'Advocate',
      'Synthesize',
      'Clarify',
      'Generate',
      'Transform',
      'Reinforce',
      'Evaluate',
      'Establish',
      'Implement',
      'Coordinate'
    ]
  };

  const fallback = fallbackPools[key] || fallbackPools.meaning;
  let fallbackIdx = 0;
  while (picked.length < count && fallbackIdx < fallback.length) {
    const fb = fallback[fallbackIdx++];
    const fbLower = fb.toLowerCase();
    if (!seen.has(fbLower)) {
      seen.add(fbLower);
      picked.push(fb);
    }
  }

  return picked;
}

/**
 * 1. Flashcard Stage Generator
 */
export function generateFlashcardStage(item, allItems, stageMeta = {}) {
  const distractors = getRandomDistractors(allItems, item, 3, 'meaning');
  const options = shuffleArray([item.meaning, ...distractors]);

  const synonyms = extractWordList(item.synonyms, item.raw_synonyms);
  const antonyms = extractWordList(item.antonyms, item.raw_antonyms);

  const synonymsText = synonyms.length > 0 ? ` সমার্থক শব্দ: ${synonyms.join(', ')}` : '';
  const antonymsText = antonyms.length > 0 ? ` | বিপরীত শব্দ: ${antonyms.join(', ')}` : '';

  return {
    type: STAGE_TYPES.FLASHCARD,
    stageNumber: stageMeta.stageNumber || 1,
    iteration: stageMeta.iteration || 1,
    title: STAGE_TITLES[STAGE_TYPES.FLASHCARD],
    instruction: STAGE_INSTRUCTIONS[STAGE_TYPES.FLASHCARD],
    item: item,
    question: `"${item.word}" শব্দটির সঠিক বাংলা অর্থ কোনটি?`,
    options: options,
    correctAnswer: item.meaning,
    explanation: `"${item.word}" (${item.pos || 'Word'}) এর অর্থ: "${item.meaning}"।${synonymsText}${antonymsText}`
  };
}

/**
 * 2. Matching Stage Generator
 */
export function generateMatchingStage(allItems, stageMeta = {}, targetItem = null) {
  const sourceItems = Array.isArray(allItems) && allItems.length > 0 ? allItems : (targetItem ? [targetItem] : []);
  const selected = shuffleArray(sourceItems).slice(0, Math.min(sourceItems.length, 5));

  const leftItems = selected.map(it => ({ id: it.id, text: it.word }));
  const rightItems = shuffleArray(selected.map(it => ({ id: it.id, text: it.meaning })));

  return {
    type: STAGE_TYPES.MATCHING,
    stageNumber: stageMeta.stageNumber || 2,
    iteration: stageMeta.iteration || 1,
    title: STAGE_TITLES[STAGE_TYPES.MATCHING],
    instruction: STAGE_INSTRUCTIONS[STAGE_TYPES.MATCHING],
    item: targetItem || selected[0] || null,
    leftItems: shuffleArray(leftItems),
    rightItems: rightItems,
    totalPairs: selected.length,
    correctAnswer: 'MATCH_ALL',
    explanation: 'প্রতিটি ইংরেজি শব্দের জন্য সঠিক বাংলা অর্থ মিলিয়ে পূর্ণ জোড়া তৈরি করুন।'
  };
}

/**
 * 3. Drag & Drop Fill-in Stage Generator
 */
export function generateDragDropStage(item, allItems, stageMeta = {}) {
  const sentence = item.sentence || '';
  const targetWord = item.word || '';

  let maskedSentence = '';
  if (sentence && targetWord && sentence.toLowerCase().includes(targetWord.toLowerCase())) {
    const escapedTarget = targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      maskedSentence = sentence.replace(new RegExp('\\b' + escapedTarget + '\\b', 'gi'), '_______');
    } catch (e) {
      maskedSentence = '';
    }
    if (!maskedSentence || !maskedSentence.includes('_______')) {
      try {
        maskedSentence = sentence.replace(new RegExp(escapedTarget, 'i'), '_______');
      } catch (e) {
        maskedSentence = '';
      }
    }
  }

  if (!maskedSentence || !maskedSentence.includes('_______')) {
    maskedSentence = `বাক্যটি সম্পূর্ণ করো: [_______] শব্দটির বাংলা অর্থ হলো "${item.meaning}"।`;
  }

  const distractors = getRandomDistractors(allItems, item, 3, 'word');
  const options = shuffleArray([targetWord, ...distractors]);

  return {
    type: STAGE_TYPES.DRAG_DROP,
    stageNumber: stageMeta.stageNumber || 3,
    iteration: stageMeta.iteration || 1,
    title: STAGE_TITLES[STAGE_TYPES.DRAG_DROP],
    instruction: STAGE_INSTRUCTIONS[STAGE_TYPES.DRAG_DROP],
    item: item,
    sentenceText: maskedSentence,
    targetWord: targetWord,
    options: options,
    correctAnswer: targetWord,
    explanation: `সঠিক উত্তর: "${targetWord}"। এর অর্থ: "${item.meaning}"।`
  };
}

/**
 * 4. True/False Swipe Stage Generator
 */
export function generateTrueFalseStage(item, allItems, stageMeta = {}) {
  const isTrue = Math.random() >= 0.5;
  let displayedMeaning = item.meaning;

  if (!isTrue) {
    const distractors = getRandomDistractors(allItems, item, 1, 'meaning');
    displayedMeaning = distractors.length > 0 ? distractors[0] : 'ভিন্ন অর্থ';
  }

  return {
    type: STAGE_TYPES.TRUE_FALSE,
    stageNumber: stageMeta.stageNumber || 4,
    iteration: stageMeta.iteration || 1,
    title: STAGE_TITLES[STAGE_TYPES.TRUE_FALSE],
    instruction: STAGE_INSTRUCTIONS[STAGE_TYPES.TRUE_FALSE],
    item: item,
    statement: `"${item.word}" শব্দটির অর্থ কি "${displayedMeaning}"?`,
    displayedMeaning: displayedMeaning,
    isTrue: isTrue,
    correctAnswer: isTrue ? 'TRUE' : 'FALSE',
    explanation: isTrue 
      ? `সঠিক! "${item.word}" এর প্রকৃত অর্থ "${item.meaning}"।` 
      : `ভুল! "${item.word}" এর সঠিক অর্থ হলো "${item.meaning}" (প্রদর্শিত অর্থ "${displayedMeaning}" সঠিক নয়)।`
  };
}

/**
 * 5. Odd One Out Stage Generator
 */
export function generateOddOneOutStage(item, allItems, stageMeta = {}) {
  const syns = extractWordList(item.synonyms, item.raw_synonyms);
  const ants = extractWordList(item.antonyms, item.raw_antonyms);

  let oddWord = '';
  let categoryTitle = '';
  let options = [];
  let explanation = '';

  if (syns.length >= 2 && ants.length > 0) {
    oddWord = ants[0];
    const related = [item.word, syns[0], syns[1]];
    options = shuffleArray([...related, oddWord]);
    categoryTitle = `"${item.word}" এর সাথে নিচের কোনটি বেমানান বা বিপরীত শব্দ (Antonym)?`;
    explanation = `সঠিক উত্তর: "${oddWord}"। এটি বিপরীত শব্দ (Antonym), বাকিগুলো "${item.word}" এর সমার্থক (Synonyms)।`;
  } else if (ants.length > 0) {
    oddWord = ants[0];
    const distractorWords = getRandomDistractors(allItems, item, 2, 'word');
    const related = [item.word, ...(syns.length > 0 ? [syns[0]] : [distractorWords[0] || 'Related']), item.meaning || 'Meaning'];
    options = shuffleArray([...related.slice(0, 3), oddWord]);
    categoryTitle = `"${item.word}" এর সাথে নিচের কোনটি বেমানান বা বিপরীত শব্দ (Antonym)?`;
    explanation = `সঠিক উত্তর: "${oddWord}"। এটি বিপরীত শব্দ (Antonym), বাকিগুলো "${item.word}" সম্পর্কিত।`;
  } else {
    const distractors = getRandomDistractors(allItems, item, 1, 'word');
    oddWord = distractors.length > 0 ? distractors[0] : 'Unrelated';
    const related = [item.word, ...syns.slice(0, 2)];
    while (related.length < 3) {
      related.push(item.meaning || 'Meaning');
    }
    options = shuffleArray([...related.slice(0, 3), oddWord]);
    categoryTitle = `"${item.word}" সম্পর্কিত তালিকার বাইরে কোনটি?`;
    explanation = `সঠিক উত্তর: "${oddWord}"। এটি ভিন্ন শব্দ, বাকিগুলো "${item.word}" সম্পর্কিত।`;
  }

  return {
    type: STAGE_TYPES.ODD_ONE_OUT,
    stageNumber: stageMeta.stageNumber || 5,
    iteration: stageMeta.iteration || 1,
    title: STAGE_TITLES[STAGE_TYPES.ODD_ONE_OUT],
    instruction: STAGE_INSTRUCTIONS[STAGE_TYPES.ODD_ONE_OUT],
    item: item,
    categoryTitle: categoryTitle,
    options: options,
    correctAnswer: oddWord,
    explanation: explanation
  };
}

/**
 * Dispatcher helper to build any stage by type name.
 */
export function buildStageByType(type, item, allItems, stageMeta = {}) {
  switch (type) {
    case STAGE_TYPES.FLASHCARD:
      return generateFlashcardStage(item, allItems, stageMeta);
    case STAGE_TYPES.MATCHING:
      return generateMatchingStage(allItems, stageMeta, item);
    case STAGE_TYPES.DRAG_DROP:
      return generateDragDropStage(item, allItems, stageMeta);
    case STAGE_TYPES.TRUE_FALSE:
      return generateTrueFalseStage(item, allItems, stageMeta);
    case STAGE_TYPES.ODD_ONE_OUT:
      return generateOddOneOutStage(item, allItems, stageMeta);
    default:
      return generateFlashcardStage(item, allItems, stageMeta);
  }
}

/**
 * Compiles a 10-Stage level for the game (2 iterations across the 5 words using 5 core modes).
 * 
 * - Iteration 1: Stages 1-5 covering Words 1-5 across the 5 core game modes.
 * - Iteration 2: Stages 6-10 covering Words 1-5 with swapped game modes.
 * - Full cross-stage randomization on retry (isRetry = true).
 * 
 * @param {Object} level - The level object containing raw items
 * @param {boolean} isRetry - Whether this is a retry attempt (triggers full cross-stage shuffle)
 * @returns {Array} Array of exactly 10 dynamic stage payloads
 */
export function buildLevelStages(level, isRetry = false) {
  if (!level || !level.items || !level.items.length) {
    return [];
  }

  const rawItems = [...level.items];
  const words = [...rawItems];
  while (words.length < 5) {
    words.push({
      ...words[words.length % rawItems.length],
      id: `synth_${words.length + 1}_${Math.random().toString(36).substring(2, 7)}`
    });
  }
  const levelWords = words.slice(0, 5);
  const allLevelItems = level.items;

  // Base 5 distinct modes
  const standardModes = [
    STAGE_TYPES.FLASHCARD,
    STAGE_TYPES.MATCHING,
    STAGE_TYPES.DRAG_DROP,
    STAGE_TYPES.TRUE_FALSE,
    STAGE_TYPES.ODD_ONE_OUT
  ];

  // Always dynamically randomize word order and stage modes on every play/retry
  const iter1Words = shuffleArray(levelWords);
  const iter1Modes = shuffleArray(standardModes);

  // Track mode assigned to each word in Iteration 1
  const wordIter1ModeMap = new Map();
  iter1Words.forEach((w, idx) => {
    wordIter1ModeMap.set(w.id, iter1Modes[idx]);
  });

  // Iteration 2: Re-shuffle words and shift modes so every word is tested with a different mode
  const iter2Words = shuffleArray(levelWords);
  const randomShift = 1 + Math.floor(Math.random() * 4); // 1, 2, 3, or 4

  const iter2Modes = iter2Words.map(w => {
    const prevMode = wordIter1ModeMap.get(w.id);
    const prevIndex = standardModes.indexOf(prevMode);
    const newIndex = (prevIndex + randomShift) % standardModes.length;
    return standardModes[newIndex];
  });

  // Compile Iteration 1 (Stages 1 to 5)
  const stagesIter1 = iter1Modes.map((mode, idx) => {
    const item = iter1Words[idx];
    const stageMeta = { stageNumber: idx + 1, iteration: 1 };
    return buildStageByType(mode, item, allLevelItems, stageMeta);
  });

  // Compile Iteration 2 (Stages 6 to 10)
  const stagesIter2 = iter2Modes.map((mode, idx) => {
    const item = iter2Words[idx];
    const stageMeta = { stageNumber: idx + 6, iteration: 2 };
    return buildStageByType(mode, item, allLevelItems, stageMeta);
  });

  return [...stagesIter1, ...stagesIter2];
}

/**
 * Convenient alias for buildLevelStages
 */
export const compileLevel = buildLevelStages;

export default {
  STAGE_TYPES,
  CORE_STAGE_MODES,
  STAGE_TITLES,
  STAGE_INSTRUCTIONS,
  shuffleArray,
  extractWordList,
  getRandomDistractors,
  generateFlashcardStage,
  generateMatchingStage,
  generateDragDropStage,
  generateTrueFalseStage,
  generateOddOneOutStage,
  buildStageByType,
  buildLevelStages,
  compileLevel
};
