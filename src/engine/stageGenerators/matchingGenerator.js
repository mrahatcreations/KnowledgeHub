/**
 * Matching Stage Generator (Universal Game Engine)
 * Modular generator for Left-Right Pair Matching stages.
 * 
 * Supports:
 * 1. Word-Meaning Matching (English Word <-> Bengali Meaning)
 * 2. Synonym Pair Matching (Word <-> Synonym)
 * 3. Antonym Pair Matching (Word <-> Antonym)
 * 
 * Features:
 * - Independent Fisher-Yates shuffling for left and right columns
 * - Accurate totalPairs tracking and dynamic Bengali explanations
 * - Pristine UTF-8 Bengali typography
 */

export const MATCHING_SUBTYPES = {
  WORD_MEANING: 'word_meaning',
  SYNONYM: 'synonym',
  ANTONYM: 'antonym',
  AUTO: 'auto'
};

/**
 * Fisher-Yates array shuffler (pure function, returns new array)
 * @param {Array} arr
 * @returns {Array} Shuffled copy
 */
export function shuffleArray(arr) {
  if (!Array.isArray(arr) || arr.length <= 1) return arr ? [...arr] : [];
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}


/**
 * Clean and normalize string
 * @param {string} str 
 * @returns {string}
 */
function cleanText(str) {
  if (str === null || str === undefined) return '';
  return String(str).trim();
}

/**
 * Extracts a list of clean synonyms from item
 * @param {Object} item 
 * @returns {string[]}
 */
export function extractSynonyms(item) {
  if (!item) return [];
  const results = [];
  
  if (Array.isArray(item.synonyms)) {
    item.synonyms.forEach(s => {
      const clean = cleanText(s);
      if (clean && !results.includes(clean)) results.push(clean);
    });
  }

  if (item.raw_synonyms && typeof item.raw_synonyms === 'string') {
    item.raw_synonyms.split(/[,;|/]/).forEach(s => {
      const clean = cleanText(s);
      if (clean && !results.includes(clean)) results.push(clean);
    });
  }

  return results;
}

/**
 * Extracts a list of clean antonyms from item
 * @param {Object} item 
 * @returns {string[]}
 */
export function extractAntonyms(item) {
  if (!item) return [];
  const results = [];

  if (Array.isArray(item.antonyms)) {
    item.antonyms.forEach(a => {
      const clean = cleanText(a);
      if (clean && !results.includes(clean)) results.push(clean);
    });
  }

  if (item.raw_antonyms && typeof item.raw_antonyms === 'string') {
    item.raw_antonyms.split(/[,;|/]/).forEach(a => {
      const clean = cleanText(a);
      if (clean && !results.includes(clean)) results.push(clean);
    });
  }

  return results;
}

/**
 * Fallback items pool if provided level items are insufficient
 */
const DEFAULT_FALLBACK_PAIRS = [
  { id: 'fb_1', word: 'Facilitate', meaning: 'To make easier or assist' },
  { id: 'fb_2', word: 'Enhance', meaning: 'To improve or increase quality' },
  { id: 'fb_3', word: 'Advocate', meaning: 'To publicly recommend or support' },
  { id: 'fb_4', word: 'Synthesize', meaning: 'To combine into a coherent whole' },
  { id: 'fb_5', word: 'Clarify', meaning: 'To make clear or easy to understand' }
];

/**
 * Generates Word-Meaning pairs
 * @param {Array} items 
 * @param {number} maxPairs 
 * @returns {Array<{ id: any, left: string, right: string, item: Object }>}
 */
export function generateWordMeaningPairs(items = [], maxPairs = 5) {
  const validItems = (items || []).filter(
    it => it && cleanText(it.word) && cleanText(it.meaning)
  );

  const selected = shuffleArray(validItems).slice(0, maxPairs);

  if (selected.length < 3) {
    // Top up with fallback items if needed
    for (const fb of DEFAULT_FALLBACK_PAIRS) {
      if (selected.length >= maxPairs) break;
      if (!selected.some(s => s.word.toLowerCase() === fb.word.toLowerCase())) {
        selected.push({ ...fb, id: `fb_${Math.random().toString(36).substring(2, 7)}` });
      }
    }
  }

  return selected.map((it, idx) => ({
    id: it.id !== undefined && it.id !== null ? it.id : `wm_pair_${idx + 1}`,
    left: cleanText(it.word),
    right: cleanText(it.meaning),
    item: it
  }));
}

/**
 * Generates Synonym pairs when available
 * @param {Array} items 
 * @param {number} maxPairs 
 * @returns {Array<{ id: any, left: string, right: string, item: Object }>}
 */
export function generateSynonymPairs(items = [], maxPairs = 5) {
  const validItems = (items || []).filter(it => {
    if (!it || !cleanText(it.word)) return false;
    const syns = extractSynonyms(it);
    return syns.length > 0;
  });

  const selected = shuffleArray(validItems).slice(0, maxPairs);

  return selected.map((it, idx) => {
    const syns = extractSynonyms(it);
    const chosenSynonym = syns[Math.floor(Math.random() * syns.length)];
    return {
      id: it.id !== undefined && it.id !== null ? it.id : `syn_pair_${idx + 1}`,
      left: cleanText(it.word),
      right: chosenSynonym,
      item: it
    };
  });
}

/**
 * Generates Antonym pairs when available
 * @param {Array} items 
 * @param {number} maxPairs 
 * @returns {Array<{ id: any, left: string, right: string, item: Object }>}
 */
export function generateAntonymPairs(items = [], maxPairs = 5) {
  const validItems = (items || []).filter(it => {
    if (!it || !cleanText(it.word)) return false;
    const ants = extractAntonyms(it);
    return ants.length > 0;
  });

  const selected = shuffleArray(validItems).slice(0, maxPairs);

  return selected.map((it, idx) => {
    const ants = extractAntonyms(it);
    const chosenAntonym = ants[Math.floor(Math.random() * ants.length)];
    return {
      id: it.id !== undefined && it.id !== null ? it.id : `ant_pair_${idx + 1}`,
      left: cleanText(it.word),
      right: chosenAntonym,
      item: it
    };
  });
}

/**
 * Generates a full Matching stage payload.
 * 
 * @param {Array} allItems - Level items
 * @param {Object} [options={}] - Configuration options
 * @param {string} [options.mode='auto'] - 'auto' | 'word_meaning' | 'synonym' | 'antonym'
 * @param {number} [options.maxPairs=5] - Maximum pairs to include (default: 5)
 * @param {number} [options.minPairs=3] - Minimum pairs required
 * @returns {Object} Matching stage payload compatible with MatchingStage.jsx
 */
export function generateMatchingStage(allItems = [], options = {}) {
  const {
    mode = MATCHING_SUBTYPES.AUTO,
    maxPairs = 5,
    minPairs = 3
  } = options;

  let selectedSubtype = mode;
  let pairs = [];

  // Determine subtype if AUTO
  if (selectedSubtype === MATCHING_SUBTYPES.AUTO) {
    const synonymPairs = generateSynonymPairs(allItems, maxPairs);
    const antonymPairs = generateAntonymPairs(allItems, maxPairs);

    const eligibleModes = [MATCHING_SUBTYPES.WORD_MEANING, MATCHING_SUBTYPES.WORD_MEANING]; // weighted towards word-meaning

    if (synonymPairs.length >= minPairs) {
      eligibleModes.push(MATCHING_SUBTYPES.SYNONYM);
    }
    if (antonymPairs.length >= minPairs) {
      eligibleModes.push(MATCHING_SUBTYPES.ANTONYM);
    }

    selectedSubtype = eligibleModes[Math.floor(Math.random() * eligibleModes.length)];

    if (selectedSubtype === MATCHING_SUBTYPES.SYNONYM) {
      pairs = synonymPairs;
    } else if (selectedSubtype === MATCHING_SUBTYPES.ANTONYM) {
      pairs = antonymPairs;
    } else {
      pairs = generateWordMeaningPairs(allItems, maxPairs);
    }
  } else if (selectedSubtype === MATCHING_SUBTYPES.SYNONYM) {
    pairs = generateSynonymPairs(allItems, maxPairs);
    if (pairs.length < minPairs) {
      // Fallback to word-meaning if not enough synonyms
      selectedSubtype = MATCHING_SUBTYPES.WORD_MEANING;
      pairs = generateWordMeaningPairs(allItems, maxPairs);
    }
  } else if (selectedSubtype === MATCHING_SUBTYPES.ANTONYM) {
    pairs = generateAntonymPairs(allItems, maxPairs);
    if (pairs.length < minPairs) {
      // Fallback to word-meaning if not enough antonyms
      selectedSubtype = MATCHING_SUBTYPES.WORD_MEANING;
      pairs = generateWordMeaningPairs(allItems, maxPairs);
    }
  } else {
    selectedSubtype = MATCHING_SUBTYPES.WORD_MEANING;
    pairs = generateWordMeaningPairs(allItems, maxPairs);
  }

  // Ensure pairs are not empty
  if (!pairs || pairs.length === 0) {
    pairs = generateWordMeaningPairs(DEFAULT_FALLBACK_PAIRS, maxPairs);
    selectedSubtype = MATCHING_SUBTYPES.WORD_MEANING;
  }

  // Shuffle Left and Right columns INDEPENDENTLY
  const leftItems = shuffleArray(
    pairs.map(p => ({
      id: p.id,
      text: p.left
    }))
  );

  const rightItems = shuffleArray(
    pairs.map(p => ({
      id: p.id,
      text: p.right
    }))
  );

  // Configure Title, Instruction, and Explanation based on Subtype
  let title = 'Left-Right Matching';
  let instruction = 'Match each English word with its correct definition';
  let pairRelationSymbol = '=';
  let explanationHeader = `Match all ${pairs.length} pairs correctly:`;

  if (selectedSubtype === MATCHING_SUBTYPES.SYNONYM) {
    title = 'Synonym Matching';
    instruction = 'Match each word with its corresponding synonym';
    pairRelationSymbol = '↔';
    explanationHeader = `Match all ${pairs.length} synonym pairs correctly:`;
  } else if (selectedSubtype === MATCHING_SUBTYPES.ANTONYM) {
    title = 'Antonym Matching';
    instruction = 'Match each word with its corresponding antonym';
    pairRelationSymbol = '≠';
    explanationHeader = `Match all ${pairs.length} antonym pairs correctly:`;
  }

  // Generate detailed pair list for explanation
  const pairsExplanation = pairs
    .map(p => `• ${p.left} ${pairRelationSymbol} ${p.right}`)
    .join('\n');

  const detailedExplanation = `${explanationHeader}\n\nCorrect Pairs:\n${pairsExplanation}`;

  return {
    type: 'matching',
    subType: selectedSubtype,
    title,
    instruction,
    leftItems,
    rightItems,
    totalPairs: pairs.length,
    pairs: pairs.map(p => ({ id: p.id, left: p.left, right: p.right })),
    explanation: detailedExplanation
  };
}

export default generateMatchingStage;
