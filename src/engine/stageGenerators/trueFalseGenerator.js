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
  'সম্পর্কযুক্ত করা',
  'উন্নতি সাধন করা',
  'সতর্কীকরণ করা',
  'মূল্যায়ন করা',
  'পরিবর্তনশীল',
  'সংরক্ষণ করা',
  'বাস্তবায়ন করা',
  'স্থগিত রাখা',
  'অনুমোদন দেওয়া',
  'উৎসাহিত করা',
  'সহজতর করা',
  'সংক্ষিপ্ত করা',
  'স্পষ্ট করা',
  'প্রতিরোধ করা',
  'পুনরাবৃত্তি করা'
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
      displayedMeaning = `সমার্থক শব্দ: ${realSynonym}`;
      statement = `"${safeItem.word}" শব্দটির সমার্থক শব্দ (Synonym) হলো "${realSynonym}"।`;
      explanation = `সঠিক! "${safeItem.word}" এবং "${realSynonym}" একে অপরের সমার্থক শব্দ (Synonyms)। এর বাংলা অর্থ: "${safeItem.meaning}"।`;
    } else {
      const distractor = getRandomWordDistractor(allItems, safeItem, safeItem.synonyms);
      const fakeWord = distractor.word;
      displayedMeaning = `সমার্থক শব্দ: ${fakeWord}`;
      statement = `"${safeItem.word}" শব্দটির সমার্থক শব্দ (Synonym) হলো "${fakeWord}"।`;

      const realSynsText = safeItem.raw_synonyms || safeItem.synonyms.join(', ');
      if (distractor.isAntonym) {
        explanation = `ভুল! "${fakeWord}" শব্দটি "${safeItem.word}" এর সমার্থক নয়, বরং বিপরীত শব্দ (Antonym)। "${safeItem.word}" এর সঠিক সমার্থক শব্দ: "${realSynsText}" (অর্থ: "${safeItem.meaning}")।`;
      } else {
        explanation = `ভুল! "${fakeWord}" শব্দটি "${safeItem.word}" এর সমার্থক নয়। "${safeItem.word}" এর প্রকৃত সমার্থক শব্দ: "${realSynsText}" (অর্থ: "${safeItem.meaning}")।`;
      }
    }
  } else {
    // ----------------------------------------------------
    // Mode: Genuine Meaning Evaluation (Default)
    // ----------------------------------------------------
    if (isTrue) {
      displayedMeaning = safeItem.meaning;
      statement = `"${safeItem.word}" শব্দটির সঠিক বাংলা অর্থ কি "${displayedMeaning}"?`;
      explanation = `সঠিক! "${safeItem.word}" (${safeItem.pos || 'শব্দ'}) এর প্রকৃত অর্থ হলো "${safeItem.meaning}"।${safeItem.raw_synonyms ? ` সমার্থক শব্দ: ${safeItem.raw_synonyms}।` : ''}`;
    } else {
      const distractorMeaning = getRandomMeaningDistractor(allItems, safeItem);
      displayedMeaning = distractorMeaning;
      statement = `"${safeItem.word}" শব্দটির সঠিক বাংলা অর্থ কি "${displayedMeaning}"?`;
      explanation = `ভুল! "${safeItem.word}" এর সঠিক অর্থ হলো "${safeItem.meaning}" (প্রদর্শিত অর্থ "${distractorMeaning}" সঠিক নয়)।${safeItem.raw_synonyms ? ` সমার্থক শব্দ: ${safeItem.raw_synonyms}।` : ''}`;
    }
  }

  return {
    type: STAGE_TYPE,
    title: 'সত্য/মিথ্যা যাচাই (True/False Swipe)',
    instruction: 'বিবৃতিটি সত্য হলে TRUE অথবা মিথ্যা হলে FALSE নির্বাচন করুন',
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
