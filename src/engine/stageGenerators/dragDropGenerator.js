/**
 * DRAG & DROP STAGE GENERATOR MODULARIZER
 * Generates interactive sentence fill-in (Drag & Drop) stages for vocabulary mastery.
 *
 * Features:
 * - Masked sentence with target word slot (e.g. _______ or [_______])
 * - Contextual Bengali definition fallback template when full sentence is absent
 * - Distractor words picked strictly from real dataset items & validated fallback pools
 * - Rigorously shuffled options
 * - Pristine UTF-8 Bengali educational typography
 */

export const DRAG_DROP_STAGE_TYPE = 'drag_drop';

// Fallback pool strictly comprising real vocabulary words from the dataset
export const REAL_DATASET_WORD_POOL = [
  'Incorporate', 'Automate', 'Repetitive', 'Feedback', 'Edtech',
  'Instant', 'Tailored', 'Assignment', 'Quiz', 'Grade',
  'Adaptive', 'Constructive', 'Unique', 'Redundant', 'Enhance',
  'Advocate', 'Synthesize', 'Clarify', 'Facilitate', 'Generate',
  'Accomplish', 'Acknowledge', 'Allocate', 'Anticipate', 'Articulate',
  'Benchmark', 'Collaborate', 'Comprehensive', 'Demonstrate', 'Evaluate'
];

/**
 * Shuffles an array immutably using the Fisher-Yates algorithm.
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
 * Escapes regex special characters in a string.
 * @param {string} str - Raw string
 * @returns {string} Regex-escaped string
 */
function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Masks the target word in a sentence or generates a contextual definition template.
 *
 * @param {string|null|undefined} sentence - The original sentence
 * @param {string} targetWord - The target word to mask
 * @param {string} fallbackMeaning - Bengali meaning of the target word
 * @param {string} [pos] - Part of speech (e.g., 'v', 'n', 'adj')
 * @returns {string} Masked sentence string containing [_______] or _______
 */
export function maskSentence(sentence, targetWord, fallbackMeaning = '', pos = '') {
  const word = (targetWord || '').trim();
  const rawSentence = (sentence || '').trim();

  // If sentence exists and contains the target word (case-insensitive)
  if (rawSentence && word && rawSentence.toLowerCase().includes(word.toLowerCase())) {
    const escaped = escapeRegExp(word);
    
    // First try word boundary replacement
    const wordBoundaryRegex = new RegExp(`\\b${escaped}\\b`, 'gi');
    if (wordBoundaryRegex.test(rawSentence)) {
      return rawSentence.replace(wordBoundaryRegex, '_______');
    }
    
    // Fallback if word boundary fails due to punctuation/quotes
    const directRegex = new RegExp(escaped, 'gi');
    return rawSentence.replace(directRegex, '_______');
  }

  // Fallback: Contextual definition template
  const meaningText = fallbackMeaning ? fallbackMeaning.trim() : 'Meaning';
  const posTag = pos ? ` (${pos})` : '';
  return `Complete the sentence: [_______]${posTag} means "${meaningText}".`;
}

/**
 * Picks distractor words strictly from the dataset items or real dataset word pool.
 *
 * @param {Array} allItems - Pool of all vocabulary items (e.g. from current level or entire dataset)
 * @param {Object} currentItem - The target word item
 * @param {number} [count=3] - Number of distractors needed
 * @returns {Array<string>} Array of unique distractor words
 */
export function getDragDropDistractors(allItems, currentItem, count = 3) {
  const currentWord = currentItem && currentItem.word ? String(currentItem.word).trim() : '';
  const currentId = currentItem ? currentItem.id : null;
  const pickedWords = [];
  const seenLower = new Set();

  if (currentWord) {
    seenLower.add(currentWord.toLowerCase());
  }

  // 1. Gather valid candidate words from allItems
  if (Array.isArray(allItems)) {
    const candidateItems = allItems.filter(it => {
      if (!it || !it.word) return false;
      const w = String(it.word).trim();
      if (!w) return false;
      if (currentId !== null && currentId !== undefined && it.id === currentId) return false;
      return !seenLower.has(w.toLowerCase());
    });

    const shuffledCandidates = shuffleArray(candidateItems);
    for (const item of shuffledCandidates) {
      const w = String(item.word).trim();
      const lower = w.toLowerCase();
      if (!seenLower.has(lower)) {
        seenLower.add(lower);
        pickedWords.push(w);
        if (pickedWords.length >= count) {
          break;
        }
      }
    }
  }

  // 2. If still insufficient, fill from REAL_DATASET_WORD_POOL
  if (pickedWords.length < count) {
    const shuffledPool = shuffleArray(REAL_DATASET_WORD_POOL);
    for (const poolWord of shuffledPool) {
      const lower = poolWord.toLowerCase();
      if (!seenLower.has(lower)) {
        seenLower.add(lower);
        pickedWords.push(poolWord);
        if (pickedWords.length >= count) {
          break;
        }
      }
    }
  }

  return pickedWords.slice(0, count);
}

/**
 * Generates a Drag & Drop sentence fill-in stage payload.
 *
 * @param {Object} item - The current target vocabulary item
 * @param {Array} [allItems=[]] - All items in the current level/dataset for distractor picking
 * @param {Object} [config={}] - Optional stage configuration
 * @returns {Object} Complete Drag & Drop stage payload
 */
export function generateDragDropStage(item, allItems = [], config = {}) {
  const safeItem = item || {};
  const targetWord = safeItem.word ? String(safeItem.word).trim() : 'Vocabulary';
  const meaning = safeItem.meaning ? String(safeItem.meaning).trim() : '';
  const sentence = safeItem.sentence ? String(safeItem.sentence).trim() : '';
  const pos = safeItem.pos ? String(safeItem.pos).trim() : '';

  // Generate masked sentence or contextual definition template
  const sentenceText = maskSentence(sentence, targetWord, meaning, pos);

  // Distractors strictly picked from real dataset
  const distractorCount = config.distractorCount || 3;
  const distractors = getDragDropDistractors(allItems, safeItem, distractorCount);

  // Combine and shuffle options
  const options = shuffleArray([targetWord, ...distractors]);

  // Clean Explanation
  let explanation = `Correct answer: "${targetWord}". Meaning: "${meaning}".`;
  if (safeItem.raw_synonyms && String(safeItem.raw_synonyms).trim()) {
    explanation += ` Synonyms: ${String(safeItem.raw_synonyms).trim()}`;
  }
  if (safeItem.raw_antonyms && String(safeItem.raw_antonyms).trim()) {
    explanation += ` | Antonyms: ${String(safeItem.raw_antonyms).trim()}`;
  }

  return {
    type: DRAG_DROP_STAGE_TYPE,
    title: 'Sentence Completion',
    instruction: 'Drag or select the correct word to complete the sentence',
    item: safeItem,
    sentenceText: sentenceText,
    targetWord: targetWord,
    options: options,
    correctAnswer: targetWord,
    explanation: explanation
  };
}

export default generateDragDropStage;
