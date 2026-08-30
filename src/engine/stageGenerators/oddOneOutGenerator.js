/**
 * Odd One Out Stage Generator (Universal Game Engine)
 * Modular generator for Odd One Out / Semantic Anomaly vocabulary challenges.
 * 
 * Supports:
 * 1. Antonym among Synonyms Challenge (বিপরীত শব্দ বাছাই)
 * 2. Synonym among Antonyms Challenge (সমার্থক শব্দ বাছাই)
 * 3. Unrelated Word Distractor Challenge (সম্পর্কহীন/ভিন্নার্থক শব্দ বাছাই)
 * 
 * Features:
 * - Genuine dataset words with authentic Bengali meanings and parts of speech
 * - Shuffled 4-choice options with strict uniqueness guarantees
 * - Clear semantic category titles and educational explanations
 * - Pristine UTF-8 Bengali typography
 */

export const ODD_ONE_OUT_SUBTYPES = {
  ANTONYM_AMONG_SYNS: 'antonym_among_synonyms',
  SYNONYM_AMONG_ANTS: 'synonym_among_antonyms',
  UNRELATED_DISTRACTOR: 'unrelated_distractor',
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
 * Converts English digits to Bengali digits
 * @param {number|string} num
 * @returns {string} Bengali digits
 */
export function toBnDigits(num) {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bnDigits[Number(d)] || d);
}

/**
 * Clean and normalize string
 * @param {string} str 
 * @returns {string}
 */
export function cleanText(str) {
  if (str === null || str === undefined) return '';
  return String(str).trim();
}

/**
 * Extracts a unique list of clean synonyms from an item
 * @param {Object} item 
 * @returns {string[]}
 */
export function extractSynonyms(item) {
  if (!item) return [];
  const results = [];
  
  if (Array.isArray(item.synonyms)) {
    item.synonyms.forEach(s => {
      const clean = cleanText(s);
      if (clean && !results.some(r => r.toLowerCase() === clean.toLowerCase())) {
        results.push(clean);
      }
    });
  }

  if (item.raw_synonyms && typeof item.raw_synonyms === 'string') {
    item.raw_synonyms.split(/[,;|/]/).forEach(s => {
      const clean = cleanText(s);
      if (clean && !results.some(r => r.toLowerCase() === clean.toLowerCase())) {
        results.push(clean);
      }
    });
  }

  return results;
}

/**
 * Extracts a unique list of clean antonyms from an item
 * @param {Object} item 
 * @returns {string[]}
 */
export function extractAntonyms(item) {
  if (!item) return [];
  const results = [];

  if (Array.isArray(item.antonyms)) {
    item.antonyms.forEach(a => {
      const clean = cleanText(a);
      if (clean && !results.some(r => r.toLowerCase() === clean.toLowerCase())) {
        results.push(clean);
      }
    });
  }

  if (item.raw_antonyms && typeof item.raw_antonyms === 'string') {
    item.raw_antonyms.split(/[,;|/]/).forEach(a => {
      const clean = cleanText(a);
      if (clean && !results.some(r => r.toLowerCase() === clean.toLowerCase())) {
        results.push(clean);
      }
    });
  }

  return results;
}

/**
 * Rich curated dataset fallback pool of genuine vocabulary items
 */
export const GENUINE_VOCAB_POOL = [
  {
    word: 'Incorporate',
    pos: 'v',
    meaning: 'অন্তর্ভুক্ত করা',
    synonyms: ['Include', 'Embody', 'Integrate'],
    antonyms: ['Exclude', 'Separate', 'Divide']
  },
  {
    word: 'Automate',
    pos: 'v',
    meaning: 'স্বয়ংক্রিয়ভাবে চালু করা',
    synonyms: ['Mechanize', 'Program', 'Computerize'],
    antonyms: ['Manualize', 'Operate manually']
  },
  {
    word: 'Repetitive',
    pos: 'adj',
    meaning: 'পুনরাবৃত্তিমূলক',
    synonyms: ['Recurrent', 'Iterative', 'Repeated'],
    antonyms: ['Unique', 'Varied', 'Occasional']
  },
  {
    word: 'Feedback',
    pos: 'n',
    meaning: 'প্রতিক্রিয়া বা মতামত',
    synonyms: ['Assessment', 'Evaluation', 'Review'],
    antonyms: ['Proposition', 'Silence']
  },
  {
    word: 'Instant',
    pos: 'adj',
    meaning: 'তাৎক্ষণিক',
    synonyms: ['Immediate', 'Prompt', 'Swift'],
    antonyms: ['Tardy', 'Delayed', 'Slow']
  },
  {
    word: 'Adaptive',
    pos: 'adj',
    meaning: 'অভিযোজিত বা পরিবর্তনশীল',
    synonyms: ['Adaptable', 'Flexible', 'Adjustable'],
    antonyms: ['Fixed', 'Invariable', 'Rigid']
  },
  {
    word: 'Constructive',
    pos: 'adj',
    meaning: 'গঠনমূলক ও ফলপ্রসূ',
    synonyms: ['Helpful', 'Useful', 'Productive'],
    antonyms: ['Destructive', 'Damaging', 'Harmful']
  },
  {
    word: 'Facilitate',
    pos: 'v',
    meaning: 'সহজতর করা',
    synonyms: ['Assist', 'Simplify', 'Expedite'],
    antonyms: ['Obstruct', 'Hinder', 'Impede']
  },
  {
    word: 'Enhance',
    pos: 'v',
    meaning: 'বৃদ্ধি করা বা মানোন্নয়ন করা',
    synonyms: ['Boost', 'Improve', 'Augment'],
    antonyms: ['Diminish', 'Reduce', 'Worsen']
  },
  {
    word: 'Advocate',
    pos: 'v',
    meaning: 'সমর্থন করা বা পক্ষে কথা বলা',
    synonyms: ['Support', 'Champion', 'Uphold'],
    antonyms: ['Oppose', 'Criticize', 'Denounce']
  },
  {
    word: 'Synthesize',
    pos: 'v',
    meaning: 'সমন্বয় করা বা একত্রিত করা',
    synonyms: ['Combine', 'Integrate', 'Unify'],
    antonyms: ['Dissect', 'Separate', 'Isolate']
  },
  {
    word: 'Clarify',
    pos: 'v',
    meaning: 'স্পষ্ট বা পরিষ্কার করা',
    synonyms: ['Explain', 'Elucidate', 'Illuminate'],
    antonyms: ['Confuse', 'Obscure', 'Complicate']
  },
  {
    word: 'Magnify',
    pos: 'v',
    meaning: 'প্রসারিত বা বড় করা',
    synonyms: ['Amplify', 'Enlarge', 'Expand'],
    antonyms: ['Minimize', 'Shrink', 'Compress']
  },
  {
    word: 'Mitigate',
    pos: 'v',
    meaning: 'উপশম করা বা তীব্রতা হ্রাস করা',
    synonyms: ['Alleviate', 'Ease', 'Lessen'],
    antonyms: ['Aggravate', 'Worsen', 'Intensify']
  },
  {
    word: 'Plausible',
    pos: 'adj',
    meaning: 'গ্রহণযোগ্য বা বিশ্বাসযোগ্য',
    synonyms: ['Credible', 'Believable', 'Reasonable'],
    antonyms: ['Implausible', 'Doubtful', 'Unlikely']
  },
  {
    word: 'Resilient',
    pos: 'adj',
    meaning: 'স্থিতিস্থাপক বা সহনশীল',
    synonyms: ['Tough', 'Flexible', 'Durable'],
    antonyms: ['Fragile', 'Rigid', 'Vulnerable']
  },
  {
    word: 'Trivial',
    pos: 'adj',
    meaning: 'তুচ্ছ বা সামান্য',
    synonyms: ['Minor', 'Insignificant', 'Negligible'],
    antonyms: ['Major', 'Significant', 'Essential']
  },
  {
    word: 'Abundant',
    pos: 'adj',
    meaning: 'প্রচুর বা পর্যাপ্ত',
    synonyms: ['Plentiful', 'Ample', 'Copious'],
    antonyms: ['Scarce', 'Meager', 'Sparse']
  },
  {
    word: 'Candid',
    pos: 'adj',
    meaning: 'অকপট বা স্পষ্টভাষী',
    synonyms: ['Frank', 'Honest', 'Outspoken'],
    antonyms: ['Deceitful', 'Evasive', 'Secretive']
  },
  {
    word: 'Diligence',
    pos: 'n',
    meaning: 'অধ্যবসায় বা শ্রমশীলতা',
    synonyms: ['Perseverance', 'Dedication', 'Assiduity'],
    antonyms: ['Laziness', 'Neglect', 'Inaction']
  }
];

/**
 * Searches all available items and the genuine vocab pool for a word's meaning
 * @param {string} word 
 * @param {Array} allItems 
 * @returns {string} Bengali meaning or empty string
 */
export function findWordMeaning(word, allItems = []) {
  if (!word) return '';
  const searchWord = cleanText(word).toLowerCase();

  // 1. Search in provided level items
  const foundInAll = (allItems || []).find(
    it => it && cleanText(it.word).toLowerCase() === searchWord && it.meaning
  );
  if (foundInAll && foundInAll.meaning) return cleanText(foundInAll.meaning);

  // 2. Search in fallback genuine pool
  const foundInPool = GENUINE_VOCAB_POOL.find(
    it => it.word.toLowerCase() === searchWord
  );
  if (foundInPool && foundInPool.meaning) return foundInPool.meaning;

  return '';
}

/**
 * Selects a genuine distractor word from dataset items or genuine pool
 * @param {Array} allItems 
 * @param {string[]} excludedWords - Words to avoid (case-insensitive)
 * @returns {Object} { word, meaning, pos }
 */
export function getGenuineDistractor(allItems = [], excludedWords = []) {
  const normalizedExcluded = new Set(
    (excludedWords || []).map(w => cleanText(w).toLowerCase()).filter(Boolean)
  );

  // Candidate pool from level/dataset items
  const candidatesFromItems = (allItems || []).filter(it => {
    if (!it || !cleanText(it.word)) return false;
    const w = cleanText(it.word).toLowerCase();
    return !normalizedExcluded.has(w);
  });

  if (candidatesFromItems.length > 0) {
    const picked = candidatesFromItems[Math.floor(Math.random() * candidatesFromItems.length)];
    return {
      word: cleanText(picked.word),
      meaning: cleanText(picked.meaning) || findWordMeaning(picked.word, allItems),
      pos: cleanText(picked.pos) || 'word'
    };
  }

  // Candidate pool from curated genuine vocabulary
  const candidatesFromPool = GENUINE_VOCAB_POOL.filter(
    it => !normalizedExcluded.has(it.word.toLowerCase())
  );

  if (candidatesFromPool.length > 0) {
    const picked = candidatesFromPool[Math.floor(Math.random() * candidatesFromPool.length)];
    return {
      word: picked.word,
      meaning: picked.meaning,
      pos: picked.pos
    };
  }

  // Absolute emergency fallback
  return {
    word: 'Disperse',
    meaning: 'ছড়িয়ে দেওয়া বা বিভক্ত করা',
    pos: 'v'
  };
}

/**
 * Builds an Antonym Among Synonyms challenge
 * 3 options are synonyms/related, 1 option is an antonym (odd one out).
 * 
 * @param {Object} item 
 * @param {Array} allItems 
 * @returns {Object|null}
 */
export function generateAntonymAmongSynonyms(item, allItems = []) {
  if (!item || !cleanText(item.word)) return null;

  const targetWord = cleanText(item.word);
  const targetMeaning = cleanText(item.meaning);
  const syns = extractSynonyms(item);
  const ants = extractAntonyms(item);

  if (ants.length === 0) {
    return null; // Cannot create antonym challenge without antonyms
  }

  // Pick 1 antonym as the odd one out
  const oddWord = ants[Math.floor(Math.random() * ants.length)];
  const oddMeaning = findWordMeaning(oddWord, allItems);

  // Form 3 synonym choices
  let synonymGroup = [];

  if (syns.length >= 3) {
    // 3 pure synonyms or targetWord + 2 synonyms
    if (Math.random() > 0.5) {
      synonymGroup = shuffleArray(syns).slice(0, 3);
    } else {
      synonymGroup = [targetWord, ...shuffleArray(syns).slice(0, 2)];
    }
  } else if (syns.length >= 2) {
    synonymGroup = [targetWord, syns[0], syns[1]];
  } else if (syns.length === 1) {
    synonymGroup = [targetWord, syns[0]];
    // Top up with a related word from fallback pool if matching exists
    const poolMatch = GENUINE_VOCAB_POOL.find(p => p.word.toLowerCase() === targetWord.toLowerCase());
    if (poolMatch) {
      const extraSyns = poolMatch.synonyms.filter(
        s => !synonymGroup.some(g => g.toLowerCase() === s.toLowerCase()) &&
             s.toLowerCase() !== oddWord.toLowerCase()
      );
      if (extraSyns.length > 0) {
        synonymGroup.push(extraSyns[0]);
      }
    }
  }

  // If still less than 3 synonyms, fill with genuine semantic siblings
  while (synonymGroup.length < 3) {
    const distractor = getGenuineDistractor(allItems, [...synonymGroup, oddWord]);
    synonymGroup.push(distractor.word);
  }

  // Unique 4 options
  const options = shuffleArray([...synonymGroup.slice(0, 3), oddWord]);

  const categoryTitle = `Which of the following is the antonym (opposite word) for "${targetWord}"?`;

  const otherWordsFormatted = synonymGroup
    .slice(0, 3)
    .map(w => `"${w}"`)
    .join(', ');

  const oddMeaningStr = oddMeaning ? ` (meaning: "${oddMeaning}")` : '';
  const targetMeaningStr = targetMeaning ? ` (${targetMeaning})` : '';

  const explanation = `Correct answer: "${oddWord}"${oddMeaningStr}. It is an antonym (opposite).\nThe other 3 words—${otherWordsFormatted}—are synonyms of "${targetWord}"${targetMeaningStr}.`;

  return {
    type: 'odd_one_out',
    subType: ODD_ONE_OUT_SUBTYPES.ANTONYM_AMONG_SYNS,
    title: 'Odd One Out',
    instruction: 'Identify the odd or antonym word from the choices',
    categoryTitle,
    options,
    correctAnswer: oddWord,
    item,
    explanation,
    metadata: {
      targetWord,
      oddWord,
      synonymGroup: synonymGroup.slice(0, 3),
      challengeType: 'antonym_among_synonyms'
    }
  };
}

/**
 * Builds a Synonym Among Antonyms challenge (Reverse Challenge)
 * 3 options are antonyms/opposites, 1 option is a synonym/original meaning (odd one out).
 * 
 * @param {Object} item 
 * @param {Array} allItems 
 * @returns {Object|null}
 */
export function generateSynonymAmongAntonyms(item, allItems = []) {
  if (!item || !cleanText(item.word)) return null;

  const targetWord = cleanText(item.word);
  const targetMeaning = cleanText(item.meaning);
  const syns = extractSynonyms(item);
  const ants = extractAntonyms(item);

  if (ants.length < 2) {
    return null; // Needs at least 2 antonyms
  }

  // Odd word is either target word or one of its synonyms
  let oddWord = targetWord;
  if (syns.length > 0 && Math.random() > 0.5) {
    oddWord = syns[Math.floor(Math.random() * syns.length)];
  }
  const oddMeaning = findWordMeaning(oddWord, allItems) || targetMeaning;

  // Form 3 antonym choices
  const antonymGroup = [...ants];
  while (antonymGroup.length < 3) {
    const distractor = getGenuineDistractor(allItems, [...antonymGroup, oddWord]);
    antonymGroup.push(distractor.word);
  }

  const selectedAntonyms = antonymGroup.slice(0, 3);
  const options = shuffleArray([...selectedAntonyms, oddWord]);

  const categoryTitle = `3 of these words are antonyms—which one is the original/synonym word for "${targetWord}"?`;

  const antonymsFormatted = selectedAntonyms.map(w => `"${w}"`).join(', ');
  const oddMeaningStr = oddMeaning ? ` (meaning: "${oddMeaning}")` : '';

  const explanation = `Correct answer: "${oddWord}"${oddMeaningStr}. It is the synonym/original word.\nThe other 3 words—${antonymsFormatted}—are antonyms of "${targetWord}".`;

  return {
    type: 'odd_one_out',
    subType: ODD_ONE_OUT_SUBTYPES.SYNONYM_AMONG_ANTS,
    title: 'Odd One Out',
    instruction: 'Identify the original/synonym word among the antonyms',
    categoryTitle,
    options,
    correctAnswer: oddWord,
    item,
    explanation,
    metadata: {
      targetWord,
      oddWord,
      antonymGroup: selectedAntonyms,
      challengeType: 'synonym_among_antonyms'
    }
  };
}

/**
 * Builds an Unrelated Word Distractor challenge using genuine words from the dataset
 * 3 options share a semantic theme / synonyms of target word, 1 option is an unrelated genuine word.
 * 
 * @param {Object} item 
 * @param {Array} allItems 
 * @returns {Object}
 */
export function generateUnrelatedDistractor(item, allItems = []) {
  const targetItem = item || GENUINE_VOCAB_POOL[0];
  const targetWord = cleanText(targetItem.word) || 'Enhance';
  const targetMeaning = cleanText(targetItem.meaning) || 'বৃদ্ধি করা';
  const syns = extractSynonyms(targetItem);
  const ants = extractAntonyms(targetItem);

  // Build 3 related words (Target word + synonyms or semantic siblings)
  const relatedGroup = [targetWord];
  for (const s of syns) {
    if (relatedGroup.length >= 3) break;
    if (!relatedGroup.some(r => r.toLowerCase() === s.toLowerCase())) {
      relatedGroup.push(s);
    }
  }

  // If still less than 3, check genuine pool for matching synonyms or siblings
  if (relatedGroup.length < 3) {
    const poolMatch = GENUINE_VOCAB_POOL.find(p => p.word.toLowerCase() === targetWord.toLowerCase());
    if (poolMatch) {
      for (const s of poolMatch.synonyms) {
        if (relatedGroup.length >= 3) break;
        if (!relatedGroup.some(r => r.toLowerCase() === s.toLowerCase())) {
          relatedGroup.push(s);
        }
      }
    }
  }

  // If still less than 3, find genuine sibling items from allItems
  if (relatedGroup.length < 3) {
    const otherItems = (allItems || []).filter(
      it => it && cleanText(it.word) &&
            !relatedGroup.some(r => r.toLowerCase() === cleanText(it.word).toLowerCase()) &&
            !ants.some(a => a.toLowerCase() === cleanText(it.word).toLowerCase())
    );
    for (const other of otherItems) {
      if (relatedGroup.length >= 3) break;
      relatedGroup.push(cleanText(other.word));
    }
  }

  // Ensure 3 related words exist
  while (relatedGroup.length < 3) {
    const poolWord = GENUINE_VOCAB_POOL.find(
      p => !relatedGroup.some(r => r.toLowerCase() === p.word.toLowerCase()) &&
           !ants.some(a => a.toLowerCase() === p.word.toLowerCase())
    );
    if (poolWord) {
      relatedGroup.push(poolWord.word);
    } else {
      relatedGroup.push('Facilitate');
    }
  }

  const finalRelated = relatedGroup.slice(0, 3);

  // Pick genuine unrelated distractor word
  const excludedFromDistractor = [...finalRelated, ...syns, ...ants];
  const distractorObj = getGenuineDistractor(allItems, excludedFromDistractor);
  const oddWord = distractorObj.word;
  const oddMeaning = distractorObj.meaning || findWordMeaning(oddWord, allItems);

  // Assemble 4 distinct options
  const options = shuffleArray([...finalRelated, oddWord]);

  const targetMeaningStr = targetMeaning ? ` (${targetMeaning})` : '';
  const categoryTitle = `Which of the following words is unrelated or odd compared to "${targetWord}"${targetMeaningStr}?`;

  const relatedFormatted = finalRelated.map(w => `"${w}"`).join(', ');
  const oddMeaningStr = oddMeaning ? ` (meaning: "${oddMeaning}")` : '';

  const explanation = `Correct answer: "${oddWord}"${oddMeaningStr}. It is an unrelated word.\nThe other 3 words—${relatedFormatted}—are all related in meaning to "${targetWord}"${targetMeaningStr}.`;

  return {
    type: 'odd_one_out',
    subType: ODD_ONE_OUT_SUBTYPES.UNRELATED_DISTRACTOR,
    title: 'Odd One Out',
    instruction: 'Identify the unrelated or odd word from the choices',
    categoryTitle,
    options,
    correctAnswer: oddWord,
    item: targetItem,
    explanation,
    metadata: {
      targetWord,
      oddWord,
      relatedGroup: finalRelated,
      distractorMeaning: oddMeaning,
      challengeType: 'unrelated_distractor'
    }
  };
}

/**
 * Generates a full Odd One Out stage payload.
 * 
 * @param {Object} item - The primary vocabulary item for this stage
 * @param {Array} allItems - All items in the level/dataset for distractor selection
 * @param {Object} [options={}] - Configuration options
 * @param {string} [options.mode='auto'] - 'auto' | 'antonym_among_synonyms' | 'synonym_among_antonyms' | 'unrelated_distractor'
 * @returns {Object} Odd One Out stage payload compatible with OddOneOutStage.jsx
 */
export function generateOddOneOutStage(item, allItems = [], options = {}) {
  const { mode = ODD_ONE_OUT_SUBTYPES.AUTO } = options;

  // Fallback target item if invalid item passed
  const targetItem = (item && cleanText(item.word)) ? item : GENUINE_VOCAB_POOL[0];
  const syns = extractSynonyms(targetItem);
  const ants = extractAntonyms(targetItem);

  let stagePayload = null;

  if (mode === ODD_ONE_OUT_SUBTYPES.ANTONYM_AMONG_SYNS) {
    stagePayload = generateAntonymAmongSynonyms(targetItem, allItems);
    if (!stagePayload) {
      stagePayload = generateUnrelatedDistractor(targetItem, allItems);
    }
  } else if (mode === ODD_ONE_OUT_SUBTYPES.SYNONYM_AMONG_ANTS) {
    stagePayload = generateSynonymAmongAntonyms(targetItem, allItems);
    if (!stagePayload) {
      stagePayload = generateAntonymAmongSynonyms(targetItem, allItems) ||
                     generateUnrelatedDistractor(targetItem, allItems);
    }
  } else if (mode === ODD_ONE_OUT_SUBTYPES.UNRELATED_DISTRACTOR) {
    stagePayload = generateUnrelatedDistractor(targetItem, allItems);
  } else {
    // AUTO MODE: Smart selection based on item rich data
    const canDoAntonymAmongSyns = ants.length >= 1 && (syns.length >= 1 || GENUINE_VOCAB_POOL.some(p => p.word.toLowerCase() === cleanText(targetItem.word).toLowerCase()));
    const canDoSynonymAmongAnts = ants.length >= 2;

    if (canDoAntonymAmongSyns && canDoSynonymAmongAnts) {
      const roll = Math.random();
      if (roll < 0.6) {
        stagePayload = generateAntonymAmongSynonyms(targetItem, allItems);
      } else if (roll < 0.85) {
        stagePayload = generateSynonymAmongAntonyms(targetItem, allItems);
      } else {
        stagePayload = generateUnrelatedDistractor(targetItem, allItems);
      }
    } else if (canDoAntonymAmongSyns) {
      if (Math.random() < 0.75) {
        stagePayload = generateAntonymAmongSynonyms(targetItem, allItems);
      } else {
        stagePayload = generateUnrelatedDistractor(targetItem, allItems);
      }
    } else {
      stagePayload = generateUnrelatedDistractor(targetItem, allItems);
    }
  }

  // Guarantee valid fallback payload
  if (!stagePayload) {
    stagePayload = generateUnrelatedDistractor(targetItem, allItems);
  }

  // STRICT GUARANTEE: Ensure exactly 4 unique choices and correctAnswer inclusion
  const uniqueOptions = [];
  const seenLower = new Set();

  // First ensure correctAnswer is present
  const ans = cleanText(stagePayload.correctAnswer);
  if (ans) {
    uniqueOptions.push(ans);
    seenLower.add(ans.toLowerCase());
  }

  // Add remaining options
  (stagePayload.options || []).forEach(opt => {
    const cleanOpt = cleanText(opt);
    if (cleanOpt && !seenLower.has(cleanOpt.toLowerCase()) && uniqueOptions.length < 4) {
      uniqueOptions.push(cleanOpt);
      seenLower.add(cleanOpt.toLowerCase());
    }
  });

  // If still less than 4, pull from genuine vocab pool
  let poolIdx = 0;
  while (uniqueOptions.length < 4 && poolIdx < GENUINE_VOCAB_POOL.length) {
    const candidate = GENUINE_VOCAB_POOL[poolIdx++].word;
    if (!seenLower.has(candidate.toLowerCase())) {
      uniqueOptions.push(candidate);
      seenLower.add(candidate.toLowerCase());
    }
  }

  stagePayload.options = shuffleArray(uniqueOptions);

  return stagePayload;
}

export default generateOddOneOutStage;
