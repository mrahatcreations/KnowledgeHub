/**
 * True/False Swipe Stage Generator
 * Modular stage generator for English-Bengali vocabulary True/False swipe challenges.
 */

export const STAGE_TYPE = 'true_false';

/**
 * Fisher-Yates array shuffle helper
 */
export function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Normalizes synonym/antonym fields into an array of clean strings.
 */
function normalizeWordList(val) {
  if (Array.isArray(val)) {
    return val.map(s => String(s).trim()).filter(Boolean);
  }
  if (typeof val === 'string') {
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Fallback distractor pools for resilient generation
 */
const FALLBACK_MEANINGS = [
  'To connect or associate',
  'To improve or enhance',
  'To warn or caution',
  'To evaluate or assess',
  'Flexible or adaptable',
  'To preserve or protect',
  'To implement or execute',
  'To suspend or delay',
  'To approve or authorize',
  'To encourage or motivate',
  'To facilitate or assist',
  'To shorten or condense',
  'To clarify or explain',
  'To resist or prevent',
  'To repeat or duplicate'
];

const FALLBACK_WORDS = [
  'Facilitate',
  'Enhance',
  'Advocate',
  'Synthesize',
  'Clarify',
  'Generate',
  'Terminate',
  'Disrupt',
  'Complicate',
  'Diminish',
  'Replicate',
  'Preserve'
];

/**
 * Retrieves a genuine distractor meaning from the provided item pool.
 */
export function getRandomMeaningDistractor(allItems = [], currentItem = {}) {
  const currentMeaning = (currentItem?.meaning || '').trim();
  const validOthers = (allItems || []).filter(it => {
    if (!it || it.id === currentItem.id) return false;
    const m = (it.meaning || '').trim();
    return m.length > 0 && m !== currentMeaning;
  });

  if (validOthers.length > 0) {
    const picked = validOthers[Math.floor(Math.random() * validOthers.length)];
    return picked.meaning.trim();
  }

  // Fallback to curated meanings
  const availableFallbacks = FALLBACK_MEANINGS.filter(m => m !== currentMeaning);
  return availableFallbacks[Math.floor(Math.random() * availableFallbacks.length)] || 'ভিন্ন অর্থ';
}

/**
 * Retrieves a genuine distractor word/synonym from other items or antonyms.
 */
export function getRandomWordDistractor(allItems = [], currentItem = {}, excludeWords = []) {
  const currentWord = (currentItem?.word || '').trim().toLowerCase();
  const lowerExcludes = new Set(excludeWords.map(w => String(w).trim().toLowerCase()));
  lowerExcludes.add(currentWord);

  // Preference 1: Antonym of current word (creates high-quality cognitive distractors)
  const antonyms = normalizeWordList(currentItem?.antonyms || currentItem?.raw_antonyms);
  const validAntonyms = antonyms.filter(a => a && !lowerExcludes.has(a.toLowerCase()));
  if (validAntonyms.length > 0) {
    return {
      word: validAntonyms[Math.floor(Math.random() * validAntonyms.length)],
      isAntonym: true
    };
  }

  // Preference 2: Words from other level items
  const validOtherWords = [];
  (allItems || []).forEach(it => {
    if (!it || it.id === currentItem.id) return;
    const w = (it.word || '').trim();
    if (w && !lowerExcludes.has(w.toLowerCase())) {
      validOtherWords.push(w);
    }
  });

  if (validOtherWords.length > 0) {
    return {
      word: validOtherWords[Math.floor(Math.random() * validOtherWords.length)],
      isAntonym: false
    };
  }

  // Preference 3: Fallback vocabulary pool
  const fallbackAvailable = FALLBACK_WORDS.filter(w => !lowerExcludes.has(w.toLowerCase()));
  const fallbackWord = fallbackAvailable[Math.floor(Math.random() * fallbackAvailable.length)] || 'Alternative';
  return {
    word: fallbackWord,
    isAntonym: false
  };
}

/**
 * Generates a True/False Swipe stage payload.
 *
 * Evaluates either:
 * 1. Meaning relation: Word <-> Bengali Meaning (50% True / 50% False with genuine distractor)
 * 2. Synonym relation: Word <-> English Synonym (50% True / 50% False with genuine distractor or antonym)
 *
 * @param {Object} item - Current vocabulary item
 * @param {Array} allItems - All items available in the current level/deck
 * @param {Object} options - Optional configuration (e.g. forceRelation: 'meaning' | 'synonym', forceAnswer: boolean)
 * @returns {Object} Stage configuration payload for TrueFalseSwipeStage
 */
export function generateTrueFalseStage(item = {}, allItems = [], options = {}) {
  // Ensure valid item structure
  const safeItem = {
    id: item?.id ?? Math.random(),
    word: item?.word || 'Vocabulary',
    pos: item?.pos || 'Word',
    meaning: item?.meaning || 'অর্থ',
    synonyms: normalizeWordList(item?.synonyms || item?.raw_synonyms),
    antonyms: normalizeWordList(item?.antonyms || item?.raw_antonyms),
    raw_synonyms: item?.raw_synonyms || '',
    raw_antonyms: item?.raw_antonyms || '',
    sentence: item?.sentence || '',
    phonetic: item?.phonetic || '',
    category: item?.category || 'Vocabulary',
    unit: item?.unit || ''
  };

  // Determine whether this statement is TRUE or FALSE (50% true / 50% false by default)
  const isTrue = typeof options.forceAnswer === 'boolean' 
    ? options.forceAnswer 
    : Math.random() >= 0.5;

  const hasSynonyms = safeItem.synonyms.length > 0;
  
  // Decide question mode: 'meaning' vs 'synonym'
  let questionMode = 'meaning';
  if (options.forceRelation) {
    questionMode = options.forceRelation;
  } else if (hasSynonyms && Math.random() < 0.45) {
    // When synonyms exist, 45% chance of synonym relation challenge
    questionMode = 'synonym';
  }

  let displayedMeaning = '';
  let statement = '';
  let explanation = '';

  if (questionMode === 'synonym' && hasSynonyms) {
    // ----------------------------------------------------
    // Mode: Synonym / Relation Evaluation
    // ----------------------------------------------------
    if (isTrue) {
      const realSynonym = safeItem.synonyms[Math.floor(Math.random() * safeItem.synonyms.length)];
      displayedMeaning = `Synonym: ${realSynonym}`;
      statement = `Is "${realSynonym}" a synonym of "${safeItem.word}"?`;
      explanation = `Correct! "${safeItem.word}" and "${realSynonym}" are synonyms. Meaning: "${safeItem.meaning}".`;
    } else {
      const distractor = getRandomWordDistractor(allItems, safeItem, safeItem.synonyms);
      const fakeWord = distractor.word;
      displayedMeaning = `Synonym: ${fakeWord}`;
      statement = `Is "${fakeWord}" a synonym of "${safeItem.word}"?`;

      const realSynsText = safeItem.raw_synonyms || safeItem.synonyms.join(', ');
      if (distractor.isAntonym) {
        explanation = `Incorrect! "${fakeWord}" is not a synonym, but an antonym of "${safeItem.word}". Synonyms: "${realSynsText}" (Meaning: "${safeItem.meaning}").`;
      } else {
        explanation = `Incorrect! "${fakeWord}" is not a synonym of "${safeItem.word}". Synonyms: "${realSynsText}" (Meaning: "${safeItem.meaning}").`;
      }
    }
  } else {
    // ----------------------------------------------------
    // Mode: Genuine Meaning Evaluation (Default)
    // ----------------------------------------------------
    if (isTrue) {
      displayedMeaning = safeItem.meaning;
      statement = `Does "${safeItem.word}" mean "${displayedMeaning}"?`;
      explanation = `Correct! "${safeItem.word}" (${safeItem.pos || 'Word'}) means "${safeItem.meaning}".${safeItem.raw_synonyms ? ` Synonyms: ${safeItem.raw_synonyms}.` : ''}`;
    } else {
      const distractorMeaning = getRandomMeaningDistractor(allItems, safeItem);
      displayedMeaning = distractorMeaning;
      statement = `Does "${safeItem.word}" mean "${displayedMeaning}"?`;
      explanation = `Incorrect! "${safeItem.word}" means "${safeItem.meaning}" (not "${distractorMeaning}").${safeItem.raw_synonyms ? ` Synonyms: ${safeItem.raw_synonyms}.` : ''}`;
    }
  }

  return {
    type: STAGE_TYPE,
    title: 'True / False Swipe',
    instruction: 'Swipe right for TRUE or left for FALSE',
    item: safeItem,
    statement: statement,
    displayedMeaning: displayedMeaning,
    isTrue: isTrue,
    correctAnswer: isTrue ? 'TRUE' : 'FALSE',
    explanation: explanation,
    questionMode: questionMode
  };
}

export default generateTrueFalseStage;
