/**
 * Distractor & Vocabulary Dataset Cleanser Service
 * 
 * Provides clean, genuine distractors and vocabulary extraction
 * strictly using real items from the dataset.
 * 
 * ZERO hardcoded fake fallback words or arrays.
 * 100% Clean UTF-8.
 */

/**
 * Shuffles an array in place using the Fisher-Yates algorithm and returns a new shuffled array.
 * @param {Array} arr - The array to shuffle
 * @returns {Array} Shuffled copy of the array
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
 * Sanitizes a string, trimming whitespace and cleaning placeholder characters.
 * @param {*} val 
 * @returns {string}
 */
export function sanitizeString(val) {
  if (typeof val !== 'string') return '';
  return val.trim();
}

/**
 * Checks if a word or phrase is a valid real vocabulary entry (not a placeholder).
 * @param {string} str 
 * @returns {boolean}
 */
export function isValidVocabularyString(str) {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  if (!trimmed) return false;
  const invalidPlaceholders = new Set([
    '-', '--', '---', 'n/a', 'na', 'none', 'null', 'undefined', 'nil'
  ]);
  if (invalidPlaceholders.has(trimmed.toLowerCase())) return false;
  return true;
}

/**
 * Extracts random genuine distractor meanings from the dataset.
 * Uses ONLY real, genuine meanings present in the provided items.
 * 
 * @param {Array<Object>} allItems - Pool of vocabulary items from the dataset
 * @param {Object} currentItem - The target vocabulary item to exclude
 * @param {number} [count=3] - Number of distractors needed
 * @returns {Array<string>} Array of unique distractor meaning strings
 */
export function getRandomDistractorMeanings(allItems, currentItem, count = 3) {
  if (!Array.isArray(allItems) || allItems.length === 0 || count <= 0) {
    return [];
  }

  const currentMeaning = currentItem && currentItem.meaning ? sanitizeString(currentItem.meaning) : '';
  const currentId = currentItem ? currentItem.id : undefined;
  const currentWord = currentItem && currentItem.word ? sanitizeString(currentItem.word).toLowerCase() : '';

  // Extract distinct valid meanings from other items
  const candidateMeanings = new Set();
  const validCandidates = [];

  for (const item of allItems) {
    if (!item) continue;
    
    // Exclude current item by id, meaning, or word
    if (currentId !== undefined && item.id === currentId) continue;
    if (currentMeaning && sanitizeString(item.meaning) === currentMeaning) continue;
    if (currentWord && sanitizeString(item.word).toLowerCase() === currentWord) continue;

    const meaningStr = sanitizeString(item.meaning);
    if (isValidVocabularyString(meaningStr) && !candidateMeanings.has(meaningStr)) {
      candidateMeanings.add(meaningStr);
      validCandidates.push(meaningStr);
    }
  }

  const shuffled = shuffleArray(validCandidates);
  return shuffled.slice(0, count);
}

/**
 * Extracts random genuine distractor words from the dataset.
 * Uses ONLY real, genuine English words present in the provided items.
 * 
 * @param {Array<Object>} allItems - Pool of vocabulary items from the dataset
 * @param {Object} currentItem - The target vocabulary item to exclude
 * @param {number} [count=3] - Number of distractors needed
 * @returns {Array<string>} Array of unique distractor word strings
 */
export function getRandomDistractorWords(allItems, currentItem, count = 3) {
  if (!Array.isArray(allItems) || allItems.length === 0 || count <= 0) {
    return [];
  }

  const currentWord = currentItem && currentItem.word ? sanitizeString(currentItem.word).toLowerCase() : '';
  const currentId = currentItem ? currentItem.id : undefined;

  // Extract distinct valid words from other items
  const candidateWords = new Set();
  const validCandidates = [];

  for (const item of allItems) {
    if (!item) continue;

    // Exclude current item by id or word
    if (currentId !== undefined && item.id === currentId) continue;
    
    const wordStr = sanitizeString(item.word);
    const lowerWord = wordStr.toLowerCase();
    
    if (currentWord && lowerWord === currentWord) continue;

    if (isValidVocabularyString(wordStr) && !candidateWords.has(lowerWord)) {
      candidateWords.add(lowerWord);
      validCandidates.push(wordStr);
    }
  }

  const shuffled = shuffleArray(validCandidates);
  return shuffled.slice(0, count);
}

/**
 * Parses, cleanses, and returns real synonyms and antonyms from a vocabulary item.
 * Filters out invalid entries, placeholders, empty values, and deduplicates.
 * 
 * @param {Object} currentItem - The vocabulary item
 * @returns {Object} Cleaned synonyms, antonyms, raw strings, and existence flags
 */
export function getRealSynonymsAndAntonyms(currentItem) {
  if (!currentItem || typeof currentItem !== 'object') {
    return {
      synonyms: [],
      antonyms: [],
      rawSynonyms: '',
      rawAntonyms: '',
      hasSynonyms: false,
      hasAntonyms: false
    };
  }

  const currentWordLower = currentItem.word ? sanitizeString(currentItem.word).toLowerCase() : '';

  // Parse synonyms
  let rawSynList = [];
  if (Array.isArray(currentItem.synonyms)) {
    rawSynList = currentItem.synonyms;
  } else if (typeof currentItem.synonyms === 'string') {
    rawSynList = currentItem.synonyms.split(/[,;•\n/]+/);
  } else if (typeof currentItem.raw_synonyms === 'string' && currentItem.raw_synonyms.trim()) {
    rawSynList = currentItem.raw_synonyms.split(/[,;•\n/]+/);
  }

  const synSet = new Set();
  const cleanedSynonyms = [];
  for (const syn of rawSynList) {
    const s = sanitizeString(syn);
    const sLower = s.toLowerCase();
    if (isValidVocabularyString(s) && sLower !== currentWordLower && !synSet.has(sLower)) {
      synSet.add(sLower);
      cleanedSynonyms.push(s);
    }
  }

  // Parse antonyms
  let rawAntList = [];
  if (Array.isArray(currentItem.antonyms)) {
    rawAntList = currentItem.antonyms;
  } else if (typeof currentItem.antonyms === 'string') {
    rawAntList = currentItem.antonyms.split(/[,;•\n/]+/);
  } else if (typeof currentItem.raw_antonyms === 'string' && currentItem.raw_antonyms.trim()) {
    rawAntList = currentItem.raw_antonyms.split(/[,;•\n/]+/);
  }

  const antSet = new Set();
  const cleanedAntonyms = [];
  for (const ant of rawAntList) {
    const a = sanitizeString(ant);
    const aLower = a.toLowerCase();
    if (isValidVocabularyString(a) && aLower !== currentWordLower && !antSet.has(aLower)) {
      antSet.add(aLower);
      cleanedAntonyms.push(a);
    }
  }

  const rawSynonyms = cleanedSynonyms.join(', ');
  const rawAntonyms = cleanedAntonyms.join(', ');

  return {
    synonyms: cleanedSynonyms,
    antonyms: cleanedAntonyms,
    rawSynonyms: rawSynonyms,
    rawAntonyms: rawAntonyms,
    hasSynonyms: cleanedSynonyms.length > 0,
    hasAntonyms: cleanedAntonyms.length > 0
  };
}

/**
 * Universal distractor extractor supporting key = 'meaning' | 'word'.
 * Guaranteed to use only real dataset items with NO fake fallback pools.
 * 
 * @param {Array<Object>} allItems - Pool of vocabulary items
 * @param {Object} currentItem - The target item
 * @param {number} [count=3] - Number of distractors
 * @param {string} [key='meaning'] - 'meaning' or 'word'
 * @returns {Array<string>}
 */
export function getRandomDistractors(allItems, currentItem, count = 3, key = 'meaning') {
  if (key === 'word') {
    return getRandomDistractorWords(allItems, currentItem, count);
  }
  return getRandomDistractorMeanings(allItems, currentItem, count);
}

/**
 * Helper to extract all flat vocabulary items from a levels data structure.
 * @param {Object|Array} levelsData - Parsed JSON object with `.levels` or array of levels
 * @returns {Array<Object>} Flat array of all items
 */
export function extractAllItems(levelsData) {
  if (!levelsData) return [];
  const levels = Array.isArray(levelsData) 
    ? levelsData 
    : (Array.isArray(levelsData.levels) ? levelsData.levels : []);
  
  const items = [];
  for (const lvl of levels) {
    if (lvl && Array.isArray(lvl.items)) {
      for (const it of lvl.items) {
        if (it) items.push(it);
      }
    }
  }
  return items;
}
