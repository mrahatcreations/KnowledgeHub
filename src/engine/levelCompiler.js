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
  [STAGE_TYPES.FLASHCARD]: 'Flashcard Active Recall',
  [STAGE_TYPES.MATCHING]: 'Left-Right Matching',
  [STAGE_TYPES.DRAG_DROP]: 'Sentence Completion',
  [STAGE_TYPES.TRUE_FALSE]: 'True / False Swipe',
  [STAGE_TYPES.ODD_ONE_OUT]: 'Odd One Out'
};

export const STAGE_INSTRUCTIONS = {
  [STAGE_TYPES.FLASHCARD]: 'Review the word and select the correct meaning',
  [STAGE_TYPES.MATCHING]: 'Match each English word with its correct definition',
  [STAGE_TYPES.DRAG_DROP]: 'Drag or select the correct word to complete the sentence',
  [STAGE_TYPES.TRUE_FALSE]: 'Swipe right for TRUE or left for FALSE',
  [STAGE_TYPES.ODD_ONE_OUT]: 'Identify the odd or antonym word from the choices'
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
 * @param {Array} excludeList - Optional list of values to exclude
 * @returns {string[]} Array of distractor strings
 */
export function getRandomDistractors(allItems, currentItem, count = 3, key = 'meaning', excludeList = []) {
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
  if (Array.isArray(excludeList)) {
    excludeList.forEach(ex => {
      if (ex !== undefined && ex !== null && String(ex).trim().length > 0) {
        seen.add(String(ex).trim().toLowerCase());
      }
    });
  }

  for (const it of shuffled) {
    const val = String(it[key]).trim();
    const valLower = val.toLowerCase();
    if (valLower.length > 0 && !seen.has(valLower)) {
      seen.add(valLower);
      picked.push(val);
      if (picked.length >= count) break;
    }
  }

  const fallbackPools = {
    meaning: [
      'Associate or Connect',
      'Improve or Enhance',
      'Warning or Caution',
      'Evaluation or Assessment',
      'Adaptive or Flexible',
      'Preserve or Protect',
      'Explain or Clarify',
      'Establish or Found',
      'Influence or Impact',
      'Transform or Convert',
      'Encourage or Motivate',
      'Review or Reconsider'
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

  // Guaranteed non-empty fallback if pool was exhausted by high exclusion list
  let synthIdx = 1;
  while (picked.length < count) {
    const synthVal = key === 'word' ? `AlternativeWord${synthIdx++}` : `Alternative Definition ${synthIdx++}`;
    if (!seen.has(synthVal.toLowerCase())) {
      seen.add(synthVal.toLowerCase());
      picked.push(synthVal);
    }
  }

  return picked;
}

export const POS_MAP = {
  n: 'Noun (বিশেষ্য)',
  v: 'Verb (ক্রিয়া)',
  adj: 'Adjective (বিশেষণ)',
  adv: 'Adverb (ক্রিয়া-বিশেষণ)',
  prep: 'Preposition (অব্যয়)',
  phrase: 'Phrase (বাক্যাংশ)',
  idiom: 'Idiom (বাগধারা)'
};

export function formatPoS(pos) {
  if (!pos) return 'Word';
  const clean = String(pos).toLowerCase().trim();
  return POS_MAP[clean] || (clean.charAt(0).toUpperCase() + clean.slice(1));
}

/**
 * 1. Flashcard Stage Generator with Multi-Angle Question Types
 */
export function generateFlashcardStage(item, allItems, stageMeta = {}) {
  const synonyms = extractWordList(item.synonyms, item.raw_synonyms);
  const antonyms = extractWordList(item.antonyms, item.raw_antonyms);
  const stageNum = stageMeta.stageNumber || 1;
  const iteration = stageMeta.iteration || 1;

  let questionType = 'meaning';
  if (iteration === 2 && synonyms.length > 0) {
    questionType = 'synonym';
  } else if (iteration === 2 && antonyms.length > 0) {
    questionType = 'antonym';
  } else if (stageNum % 4 === 0 && item.pos) {
    questionType = 'pos';
  } else if (stageNum % 3 === 0) {
    questionType = 'reverse';
  }

  let question = `What is the correct meaning of "${item.word}"?`;
  let title = 'Flashcard Active Recall';
  let instruction = 'Review the word and select the correct meaning';
  let options = [];
  let correctAnswer = '';
  let explanation = '';

  const synonymsText = synonyms.length > 0 ? ` Synonyms: ${synonyms.join(', ')}` : '';
  const antonymsText = antonyms.length > 0 ? ` | Antonyms: ${antonyms.join(', ')}` : '';

  if (questionType === 'synonym' && synonyms.length > 0) {
    title = 'Synonym Recall Challenge';
    instruction = 'Identify the correct Synonym (সমার্থক শব্দ) for the word';
    question = `Which word is a SYNONYM of "${item.word}"?`;
    correctAnswer = synonyms[0];
    const wordDistractors = getRandomDistractors(allItems, item, 3, 'word');
    options = shuffleArray([correctAnswer, ...wordDistractors]);
    explanation = `Correct! "${correctAnswer}" is a synonym of "${item.word}" (${item.meaning}).`;
  } else if (questionType === 'antonym' && antonyms.length > 0) {
    title = 'Antonym Recall Challenge';
    instruction = 'Identify the correct Opposite / Antonym (বিপরীত শব্দ) for the word';
    question = `Which word is an ANTONYM (opposite) of "${item.word}"?`;
    correctAnswer = antonyms[0];
    const wordDistractors = getRandomDistractors(allItems, item, 3, 'word');
    options = shuffleArray([correctAnswer, ...wordDistractors]);
    explanation = `Correct! "${correctAnswer}" is the antonym (opposite) of "${item.word}" (${item.meaning}).`;
  } else if (questionType === 'pos' && item.pos) {
    title = 'Grammar & Part of Speech';
    instruction = 'Select the correct Part of Speech (পদ) for this word';
    question = `What Part of Speech (Grammar) is "${item.word}"?`;
    correctAnswer = formatPoS(item.pos);
    const standardPosList = ['Noun (বিশেষ্য)', 'Verb (ক্রিয়া)', 'Adjective (বিশেষণ)', 'Adverb (ক্রিয়া-বিশেষণ)', 'Preposition (অব্যয়)'];
    const otherPos = standardPosList.filter(p => p !== correctAnswer);
    options = shuffleArray([correctAnswer, ...shuffleArray(otherPos).slice(0, 3)]);
    explanation = `Correct! "${item.word}" is a ${correctAnswer}. Meaning: "${item.meaning}".`;
  } else if (questionType === 'reverse') {
    title = 'Reverse Word Recall';
    instruction = 'Select the English word matching the Bengali definition';
    question = `Which English word means "${item.meaning}"?`;
    correctAnswer = item.word;
    const wordDistractors = getRandomDistractors(allItems, item, 3, 'word');
    options = shuffleArray([correctAnswer, ...wordDistractors]);
    explanation = `Correct! "${item.word}" means "${item.meaning}".${synonymsText}${antonymsText}`;
  } else {
    // Standard Meaning
    correctAnswer = item.meaning;
    const distractors = getRandomDistractors(allItems, item, 3, 'meaning');
    options = shuffleArray([item.meaning, ...distractors]);
    explanation = `"${item.word}" (${formatPoS(item.pos)}) means: "${item.meaning}".${synonymsText}${antonymsText}`;
  }

  return {
    type: STAGE_TYPES.FLASHCARD,
    questionType: questionType,
    stageNumber: stageNum,
    iteration: iteration,
    title: title,
    instruction: instruction,
    item: item,
    question: question,
    options: options,
    correctAnswer: correctAnswer,
    explanation: explanation
  };
}

export const DEFAULT_MATCHING_FALLBACK_PAIRS = [
  { id: 'fb_m1', word: 'Facilitate', meaning: 'সহজতর করা (To make easier)', synonyms: ['Assist', 'Help'], antonyms: ['Hinder', 'Impede'], pos: 'v' },
  { id: 'fb_m2', word: 'Enhance', meaning: 'উন্নত করা (To improve/increase)', synonyms: ['Improve', 'Boost'], antonyms: ['Diminish', 'Reduce'], pos: 'v' },
  { id: 'fb_m3', word: 'Advocate', meaning: 'সমর্থন করা (To publicly support)', synonyms: ['Champion', 'Support'], antonyms: ['Oppose', 'Condemn'], pos: 'v' },
  { id: 'fb_m4', word: 'Synthesize', meaning: 'একত্রিত করা (To combine together)', synonyms: ['Integrate', 'Unify'], antonyms: ['Separate', 'Divide'], pos: 'v' },
  { id: 'fb_m5', word: 'Clarify', meaning: 'স্পষ্ট করা (To make clear)', synonyms: ['Explain', 'Elucidate'], antonyms: ['Confuse', 'Obscure'], pos: 'v' },
  { id: 'fb_m6', word: 'Pioneer', meaning: 'পথপ্রদর্শক বা অগ্রদূত', synonyms: ['Trailblazer', 'Innovator'], antonyms: ['Follower', 'Imitator'], pos: 'n' },
  { id: 'fb_m7', word: 'Crucial', meaning: 'অত্যন্ত গুরুত্বপূর্ণ বা সংকটপূর্ণ', synonyms: ['Critical', 'Vital'], antonyms: ['Trivial', 'Minor'], pos: 'adj' }
];

/**
 * 2. Multi-Mode Matching Stage Generator (Meaning, Synonym, Antonym, Grammar)
 * 
 * Robust against:
 * - Datasets with < 4-5 words (automatically tops up from curated fallback pool)
 * - Duplicate meanings or duplicate words (strictly deduplicates pairs and IDs)
 * - Null, undefined, or missing values (guarantees clean strings and unique non-null IDs)
 */
export function generateMatchingStage(allItems, stageMeta = {}, targetItem = null) {
  const stageNum = stageMeta.stageNumber || 2;
  const iteration = stageMeta.iteration || 1;

  // 1. Gather raw candidates from allItems or targetItem
  const rawPool = Array.isArray(allItems) && allItems.length > 0
    ? allItems
    : (targetItem ? [targetItem] : []);

  // 2. Clean, validate, and deduplicate candidates by word and meaning
  const validCandidates = [];
  const seenWords = new Set();
  const seenMeanings = new Set();
  const seenIds = new Set();

  for (const item of rawPool) {
    if (!item || typeof item !== 'object') continue;
    const word = String(item.word || '').trim();
    const meaning = String(item.meaning || '').trim();
    if (!word || !meaning) continue;

    const wordLower = word.toLowerCase();
    const meaningLower = meaning.toLowerCase();

    // Prevent duplicate words or duplicate meanings in the candidate pool
    if (seenWords.has(wordLower) || seenMeanings.has(meaningLower)) continue;

    seenWords.add(wordLower);
    seenMeanings.add(meaningLower);

    const safeId = item.id !== undefined && item.id !== null ? String(item.id) : `pair_${validCandidates.length + 1}`;
    seenIds.add(safeId);

    validCandidates.push({
      ...item,
      id: safeId,
      word,
      meaning
    });
  }

  // 3. If candidates < 4 (fewer than 4-5 words), top up from DEFAULT_MATCHING_FALLBACK_PAIRS
  const TARGET_PAIRS_COUNT = 5;
  const pool = [...validCandidates];

  if (pool.length < TARGET_PAIRS_COUNT) {
    for (const fb of DEFAULT_MATCHING_FALLBACK_PAIRS) {
      if (pool.length >= TARGET_PAIRS_COUNT) break;
      const fbWordLower = fb.word.toLowerCase();
      const fbMeaningLower = fb.meaning.toLowerCase();

      if (!seenWords.has(fbWordLower) && !seenMeanings.has(fbMeaningLower)) {
        seenWords.add(fbWordLower);
        seenMeanings.add(fbMeaningLower);
        const fbId = `fb_${pool.length + 1}_${Math.random().toString(36).substring(2, 6)}`;
        seenIds.add(fbId);
        pool.push({
          ...fb,
          id: fbId
        });
      }
    }
  }

  // Select up to 5 items
  const selected = shuffleArray(pool).slice(0, Math.min(pool.length, TARGET_PAIRS_COUNT));

  // 4. Determine appropriate matching mode
  const itemsWithSyn = selected.filter(it => extractWordList(it.synonyms, it.raw_synonyms).length > 0);
  const itemsWithAnt = selected.filter(it => extractWordList(it.antonyms, it.raw_antonyms).length > 0);
  const distinctPoS = new Set(selected.map(it => it.pos).filter(Boolean));

  let mode = 'meaning'; // 'meaning' | 'synonym' | 'antonym' | 'pos'

  if (iteration === 2 && itemsWithSyn.length >= 3) {
    mode = 'synonym';
  } else if (iteration === 2 && itemsWithAnt.length >= 3) {
    mode = 'antonym';
  } else if (stageNum % 3 === 0 && distinctPoS.size >= 3) {
    mode = 'pos';
  } else if (stageNum % 2 === 0 && itemsWithSyn.length >= 3) {
    mode = 'synonym';
  }

  let title = 'Left-Right Matching';
  let instruction = 'Match each English word with its correct definition';
  let leftHeader = 'English Words';
  let leftSub = 'EN';
  let rightHeader = 'Definitions / Meanings';
  let rightSub = 'BN';
  let explanation = 'Match each English word with its corresponding definition.';

  // 5. Build pairs according to mode with guaranteed unique right-column texts
  const pairs = [];
  const usedRightTexts = new Set();

  if (mode === 'synonym') {
    title = 'Synonym Pairs Matching';
    instruction = 'Match each word with its corresponding Synonym (সমার্থক শব্দ)';
    leftHeader = 'Target Words';
    leftSub = 'WORD';
    rightHeader = 'Synonyms';
    rightSub = 'SYN';
    explanation = 'Match each word with its correct synonym to complete the challenge.';

    selected.forEach((it, idx) => {
      const syns = extractWordList(it.synonyms, it.raw_synonyms);
      // Pick a synonym that hasn't been used yet in this stage to avoid collision
      let chosenText = syns.find(s => !usedRightTexts.has(s.toLowerCase())) || syns[0] || it.meaning;
      if (usedRightTexts.has(chosenText.toLowerCase())) {
        chosenText = `${chosenText} (${idx + 1})`;
      }
      usedRightTexts.add(chosenText.toLowerCase());

      pairs.push({
        id: String(it.id),
        left: it.word,
        right: chosenText,
        item: it
      });
    });
  } else if (mode === 'antonym') {
    title = 'Antonym Pairs Matching';
    instruction = 'Match each word with its correct Antonym (বিপরীত শব্দ)';
    leftHeader = 'Target Words';
    leftSub = 'WORD';
    rightHeader = 'Antonyms (Opposites)';
    rightSub = 'ANT';
    explanation = 'Match each word with its correct opposite / antonym.';

    selected.forEach((it, idx) => {
      const ants = extractWordList(it.antonyms, it.raw_antonyms);
      let chosenText = ants.find(a => !usedRightTexts.has(a.toLowerCase())) || ants[0] || `${it.meaning} (Opposite)`;
      if (usedRightTexts.has(chosenText.toLowerCase())) {
        chosenText = `${chosenText} (${idx + 1})`;
      }
      usedRightTexts.add(chosenText.toLowerCase());

      pairs.push({
        id: String(it.id),
        left: it.word,
        right: chosenText,
        item: it
      });
    });
  } else if (mode === 'pos') {
    title = 'Grammar & PoS Matching';
    instruction = 'Match each word with its correct Part of Speech (Noun, Verb, Adjective)';
    leftHeader = 'Vocabulary Words';
    leftSub = 'WORD';
    rightHeader = 'Parts of Speech';
    rightSub = 'POS';
    explanation = 'Match each word with its correct grammatical Part of Speech.';

    selected.forEach((it, idx) => {
      let chosenText = formatPoS(it.pos);
      if (usedRightTexts.has(chosenText.toLowerCase())) {
        chosenText = `${chosenText} (${it.meaning.split(/[,;(]/)[0].trim()})`;
      }
      if (usedRightTexts.has(chosenText.toLowerCase())) {
        chosenText = `${chosenText} #${idx + 1}`;
      }
      usedRightTexts.add(chosenText.toLowerCase());

      pairs.push({
        id: String(it.id),
        left: it.word,
        right: chosenText,
        item: it
      });
    });
  } else {
    // Default: Word <-> Meaning
    selected.forEach((it, idx) => {
      let chosenText = it.meaning;
      if (usedRightTexts.has(chosenText.toLowerCase())) {
        chosenText = `${chosenText} (${idx + 1})`;
      }
      usedRightTexts.add(chosenText.toLowerCase());

      pairs.push({
        id: String(it.id),
        left: it.word,
        right: chosenText,
        item: it
      });
    });
  }

  // 6. Build leftItems and rightItems with guaranteed unique IDs and non-null values
  const leftItems = pairs.map(p => ({
    id: p.id,
    text: p.left
  }));

  const rightItems = pairs.map(p => ({
    id: p.id,
    text: p.right
  }));

  return {
    type: STAGE_TYPES.MATCHING,
    matchingMode: mode,
    subType: mode,
    stageNumber: stageNum,
    iteration: iteration,
    title: title,
    instruction: instruction,
    leftHeader: leftHeader,
    leftSub: leftSub,
    rightHeader: rightHeader,
    rightSub: rightSub,
    item: targetItem || selected[0] || null,
    leftItems: shuffleArray(leftItems),
    rightItems: shuffleArray(rightItems),
    pairs: pairs.map(p => ({ id: p.id, left: p.left, right: p.right })),
    totalPairs: pairs.length,
    correctAnswer: 'MATCH_ALL',
    explanation: explanation
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
    maskedSentence = `Complete the sentence: [_______] means "${item.meaning}".`;
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
    explanation: `Correct answer: "${targetWord}". Meaning: "${item.meaning}".`
  };
}

/**
 * 4. True/False Swipe Stage Generator with Multi-Angle Verification
 */
export function generateTrueFalseStage(item, allItems, stageMeta = {}) {
  const safeItem = item || {};
  const word = String(safeItem.word || 'Vocabulary').trim();
  const meaning = String(safeItem.meaning || 'অর্থ').trim();
  const synonyms = extractWordList(safeItem.synonyms, safeItem.raw_synonyms);
  const antonyms = extractWordList(safeItem.antonyms, safeItem.raw_antonyms);
  const stageNum = stageMeta.stageNumber || 4;
  const iteration = stageMeta.iteration || 1;

  // Expected boolean answer: strictly true or false
  const isTrue = typeof stageMeta.forceAnswer === 'boolean'
    ? stageMeta.forceAnswer
    : (typeof stageMeta.isTrue === 'boolean' ? stageMeta.isTrue : Math.random() >= 0.5);

  let mode = stageMeta.mode || 'meaning';
  if (!stageMeta.mode) {
    if (iteration === 2 && synonyms.length > 0 && Math.random() > 0.3) {
      mode = 'synonym';
    } else if (iteration === 2 && antonyms.length > 0 && Math.random() > 0.3) {
      mode = 'antonym';
    } else if (stageNum % 3 === 0 && safeItem.pos) {
      mode = 'pos';
    }
  }

  let statement = '';
  let displayedMeaning = meaning;
  let explanation = '';

  if (mode === 'synonym' && synonyms.length > 0) {
    let targetSyn = '';
    if (isTrue) {
      targetSyn = synonyms[0] || 'Similar Meaning';
      explanation = `Correct! "${targetSyn}" is indeed a synonym of "${word}" (${meaning}).`;
    } else {
      // FALSE statement: Distractor must NOT be a synonym of word, and must NOT equal word itself!
      const distractorWords = getRandomDistractors(allItems, safeItem, 1, 'word', [word, ...synonyms]);
      targetSyn = distractorWords.length > 0 ? distractorWords[0] : '';
      if (!targetSyn || synonyms.some(s => s.toLowerCase() === targetSyn.toLowerCase()) || targetSyn.toLowerCase() === word.toLowerCase()) {
        targetSyn = (antonyms.length > 0 && !synonyms.includes(antonyms[0])) ? antonyms[0] : 'Unrelated Word';
      }
      explanation = `False! "${targetSyn}" is not a synonym of "${word}" (Synonyms: ${synonyms.join(', ')}).`;
    }
    statement = `Is "${targetSyn}" a SYNONYM of "${word}"?`;
    displayedMeaning = targetSyn;
  } else if (mode === 'antonym' && antonyms.length > 0) {
    let targetAnt = '';
    if (isTrue) {
      targetAnt = antonyms[0] || 'Opposite Meaning';
      explanation = `Correct! "${targetAnt}" is the antonym of "${word}" (${meaning}).`;
    } else {
      // FALSE statement: Distractor must NOT be an antonym, and must NOT equal word itself!
      const distractorWords = getRandomDistractors(allItems, safeItem, 1, 'word', [word, ...antonyms]);
      targetAnt = distractorWords.length > 0 ? distractorWords[0] : '';
      if (!targetAnt || antonyms.some(a => a.toLowerCase() === targetAnt.toLowerCase()) || targetAnt.toLowerCase() === word.toLowerCase()) {
        targetAnt = (synonyms.length > 0 && !antonyms.includes(synonyms[0])) ? synonyms[0] : 'Similar Word';
      }
      explanation = `False! "${targetAnt}" is not the antonym of "${word}" (Antonyms: ${antonyms.join(', ')}).`;
    }
    statement = `Is "${targetAnt}" an OPPOSITE (Antonym) of "${word}"?`;
    displayedMeaning = targetAnt;
  } else if (mode === 'pos' && safeItem.pos) {
    const posList = ['Noun (বিশেষ্য)', 'Verb (ক্রিয়া)', 'Adjective (বিশেষণ)', 'Adverb (ক্রিয়া-বিশেষণ)', 'Preposition (অব্যয়)'];
    const actualPos = formatPoS(safeItem.pos);
    const otherPosList = posList.filter(p => p.toLowerCase() !== actualPos.toLowerCase() && !actualPos.toLowerCase().includes(p.toLowerCase()));
    const fakePos = otherPosList.length > 0 ? otherPosList[0] : (actualPos.includes('Noun') ? 'Verb (ক্রিয়া)' : 'Noun (বিশেষ্য)');
    const displayedPoS = isTrue ? actualPos : fakePos;
    statement = `Is "${word}" a ${displayedPoS} (Part of Speech)?`;
    displayedMeaning = displayedPoS;
    explanation = isTrue
      ? `Correct! "${word}" is a ${actualPos}. Meaning: "${meaning}".`
      : `False! "${word}" is actually a ${actualPos}, not a ${displayedPoS}.`;
  } else {
    // Meaning Mode (Default)
    if (isTrue) {
      displayedMeaning = meaning;
      explanation = `Correct! "${word}" means "${meaning}".`;
    } else {
      // FALSE statement: Distractor meaning MUST NOT be identical to item.meaning, null, or undefined
      const distractors = getRandomDistractors(allItems, safeItem, 1, 'meaning', [meaning]);
      let distractorMeaning = distractors.length > 0 ? distractors[0] : '';

      if (!distractorMeaning || distractorMeaning.trim().toLowerCase() === meaning.toLowerCase()) {
        const fallbacks = [
          'Associate or Connect',
          'Improve or Enhance',
          'Warning or Caution',
          'Evaluation or Assessment',
          'Adaptive or Flexible',
          'Preserve or Protect',
          'Explain or Clarify'
        ];
        distractorMeaning = fallbacks.find(fb => fb.toLowerCase() !== meaning.toLowerCase()) || 'Alternative Definition';
      }
      displayedMeaning = distractorMeaning;
      explanation = `False! "${word}" means "${meaning}" (not "${displayedMeaning}").`;
    }
    statement = `Does "${word}" mean "${displayedMeaning}"?`;
  }

  return {
    type: STAGE_TYPES.TRUE_FALSE,
    stageNumber: stageNum,
    iteration: iteration,
    title: STAGE_TITLES[STAGE_TYPES.TRUE_FALSE] || 'True / False Swipe',
    instruction: STAGE_INSTRUCTIONS[STAGE_TYPES.TRUE_FALSE] || 'Swipe right for TRUE or left for FALSE',
    item: safeItem,
    statement: String(statement),
    displayedMeaning: String(displayedMeaning),
    isTrue: Boolean(isTrue),
    correctAnswer: isTrue ? 'TRUE' : 'FALSE',
    explanation: String(explanation)
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
    categoryTitle = `Which of the following is the antonym or odd word for "${item.word}"?`;
    explanation = `Correct answer: "${oddWord}". It is an antonym, while the others are synonyms of "${item.word}".`;
  } else if (ants.length > 0) {
    oddWord = ants[0];
    const distractorWords = getRandomDistractors(allItems, item, 3, 'word');
    const related = [item.word, ...(syns.length > 0 ? [syns[0]] : []), distractorWords[0] || 'Associate', distractorWords[1] || 'Connect'];
    options = shuffleArray([...related.slice(0, 3), oddWord]);
    categoryTitle = `Which of the following is the antonym or odd word for "${item.word}"?`;
    explanation = `Correct answer: "${oddWord}". It is an antonym, while the other choices are related to "${item.word}".`;
  } else {
    const distractors = getRandomDistractors(allItems, item, 4, 'word');
    oddWord = distractors.length > 0 ? distractors[0] : 'Unrelated';
    const related = [item.word, ...syns.slice(0, 2)];
    let dIdx = 1;
    while (related.length < 3) {
      related.push(distractors[dIdx++] || `RelatedWord_${related.length}`);
    }
    options = shuffleArray([...related.slice(0, 3), oddWord]);
    categoryTitle = `Which word does not belong with "${item.word}"?`;
    explanation = `Correct answer: "${oddWord}". It is unrelated, while the others are connected to "${item.word}".`;
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
  POS_MAP,
  formatPoS,
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
