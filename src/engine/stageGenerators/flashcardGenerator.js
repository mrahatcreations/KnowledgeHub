/**
 * Flashcard Stage Generator (Modular Universal Stage Generator)
 * 
 * Generates flashcard active-recall challenges:
 * - Standard Recall: English word -> Select correct Bengali meaning
 * - Reverse Recall: Bengali meaning -> Select correct English word
 * - Dynamic distractor sampling via distractorService
 * - Fisher-Yates option shuffling
 * - Clean UTF-8 Bengali instructions, titles, and explanations
 */

import { getRandomDistractors, shuffleArray } from '../distractorService.js';

export const FLASHCARD_STAGE_TYPE = 'flashcard';

export const FLASHCARD_MODES = {
  STANDARD: 'standard', // Word -> Meaning
  REVERSE: 'reverse',   // Meaning -> Word
  RANDOM: 'random'      // Randomly picks standard or reverse
};

/**
 * Maps English part of speech abbreviations to friendly bilingual labels.
 * 
 * @param {string} pos - Part of speech string (e.g. 'n', 'v', 'adj', 'noun', 'verb')
 * @returns {string} Clean formatted POS label
 */
export function formatPartOfSpeech(pos) {
  if (!pos || typeof pos !== 'string') return 'Word / শব্দ';

  const p = pos.toLowerCase().trim();
  if (p === 'n' || p.startsWith('noun')) return 'Noun (বিশেষ্য)';
  if (p === 'v' || p.startsWith('verb')) return 'Verb (ক্রিয়া)';
  if (p === 'adj' || p.startsWith('adject')) return 'Adjective (বিশেষণ)';
  if (p === 'adv' || p.startsWith('adverb')) return 'Adverb (ভাববিশেষণ)';
  if (p === 'prep' || p.startsWith('prepos')) return 'Preposition (পদান্বয়ী অব্যয়)';
  if (p === 'conj' || p.startsWith('conjunc')) return 'Conjunction (সংযোজক অব্যয়)';
  if (p === 'pron' || p.startsWith('pronoun')) return 'Pronoun (সর্বনাম)';

  return pos.toUpperCase();
}

/**
 * Safely extracts a clean list of words from an array or comma-separated string.
 * 
 * @param {Array|string} list - Word list array or raw string
 * @param {string} raw - Fallback raw string
 * @returns {Array<string>} Clean array of terms
 */
export function extractList(list, raw) {
  if (Array.isArray(list) && list.length > 0) {
    return list.map(w => String(w).trim()).filter(Boolean);
  }
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.split(/[,;|]+/).map(w => w.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Builds a rich, clean UTF-8 Bengali educational explanation.
 * 
 * @param {Object} item - Vocabulary item
 * @param {string} mode - 'standard' or 'reverse'
 * @returns {string} Comprehensive Bengali explanation
 */
export function buildExplanation(item, mode = FLASHCARD_MODES.STANDARD) {
  if (!item) return 'সঠিক উত্তর নির্বাচন সম্পন্ন হয়েছে।';

  const word = item.word || 'শব্দ';
  const meaning = item.meaning || 'অর্থ';
  const posLabel = formatPartOfSpeech(item.pos);

  const synonyms = extractList(item.synonyms, item.raw_synonyms);
  const antonyms = extractList(item.antonyms, item.raw_antonyms);

  let explanation = `"${word}" (${posLabel}) এর সঠিক অর্থ: "${meaning}"।`;

  if (synonyms.length > 0) {
    explanation += ` সমার্থক শব্দ (Synonyms): ${synonyms.slice(0, 3).join(', ')}।`;
  }

  if (antonyms.length > 0) {
    explanation += ` বিপরীত শব্দ (Antonyms): ${antonyms.slice(0, 3).join(', ')}।`;
  }

  if (item.sentence && typeof item.sentence === 'string' && item.sentence.trim().length > 0) {
    explanation += ` বাক্যে প্রয়োগ: "${item.sentence.trim()}"`;
  }

  return explanation;
}

/**
 * Generates a Standard Recall Flashcard Stage:
 * Displays the English word -> User must identify the correct Bengali meaning.
 * 
 * @param {Object} item - Target vocabulary item
 * @param {Array} allItems - All level items for distractor sampling
 * @param {Object} [config={}] - Optional configuration overrides
 * @returns {Object} Standard flashcard stage payload
 */
export function generateStandardFlashcardStage(item, allItems = [], config = {}) {
  const distractorCount = config.distractorCount ?? 3;
  const distractors = getRandomDistractors(allItems, item, distractorCount, 'meaning');
  const options = shuffleArray([item.meaning, ...distractors]);

  return {
    type: FLASHCARD_STAGE_TYPE,
    mode: FLASHCARD_MODES.STANDARD,
    title: 'ফ্ল্যাশ কার্ড ও স্মরণ পরীক্ষা (Flash Card)',
    instruction: 'শব্দটি দেখুন এবং সঠিক বাংলা অর্থ নির্বাচন করুন',
    item: item,
    targetWord: item.word,
    question: `"${item.word}" শব্দটির সঠিক বাংলা অর্থ কোনটি?`,
    options: options,
    correctAnswer: item.meaning,
    explanation: buildExplanation(item, FLASHCARD_MODES.STANDARD)
  };
}

/**
 * Generates a Reverse Recall Flashcard Stage:
 * Displays the Bengali meaning -> User must identify the correct English word.
 * 
 * @param {Object} item - Target vocabulary item
 * @param {Array} allItems - All level items for distractor sampling
 * @param {Object} [config={}] - Optional configuration overrides
 * @returns {Object} Reverse flashcard stage payload
 */
export function generateReverseFlashcardStage(item, allItems = [], config = {}) {
  const distractorCount = config.distractorCount ?? 3;
  const distractors = getRandomDistractors(allItems, item, distractorCount, 'word');
  const options = shuffleArray([item.word, ...distractors]);

  return {
    type: FLASHCARD_STAGE_TYPE,
    mode: FLASHCARD_MODES.REVERSE,
    title: 'বিপরীত স্মরণ পরীক্ষা (Reverse Recall Flash Card)',
    instruction: 'বাংলা অর্থটি দেখুন এবং সঠিক ইংরেজি শব্দটি নির্বাচন করুন',
    item: item,
    targetWord: item.word,
    question: `"${item.meaning}" অর্থটির জন্য সঠিক ইংরেজি শব্দ কোনটি?`,
    options: options,
    correctAnswer: item.word,
    explanation: buildExplanation(item, FLASHCARD_MODES.REVERSE)
  };
}

/**
 * Universal Flashcard Stage Generator.
 * Supports standard recall, reverse recall, or dynamic random selection.
 * 
 * @param {Object} item - Target vocabulary item
 * @param {Array} allItems - All level items for distractor sampling
 * @param {Object} [options={}] - Options object: { mode: 'standard' | 'reverse' | 'random', distractorCount: 3 }
 * @returns {Object} Flashcard stage payload
 */
export function generateFlashcardStage(item, allItems = [], options = {}) {
  if (!item) {
    throw new Error('generateFlashcardStage requires a valid target item.');
  }

  let mode = options.mode || FLASHCARD_MODES.STANDARD;

  if (mode === FLASHCARD_MODES.RANDOM) {
    mode = Math.random() >= 0.5 ? FLASHCARD_MODES.STANDARD : FLASHCARD_MODES.REVERSE;
  }

  if (mode === FLASHCARD_MODES.REVERSE) {
    return generateReverseFlashcardStage(item, allItems, options);
  }

  return generateStandardFlashcardStage(item, allItems, options);
}

export const flashcardGenerator = {
  STAGE_TYPE: FLASHCARD_STAGE_TYPE,
  MODES: FLASHCARD_MODES,
  generateFlashcardStage,
  generateStandardFlashcardStage,
  generateReverseFlashcardStage,
  formatPartOfSpeech,
  extractList,
  buildExplanation
};

export default generateFlashcardStage;
