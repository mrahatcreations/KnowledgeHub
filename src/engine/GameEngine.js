// The Blender (Universal Game Engine for React)
export const STAGE_TYPES = {
  FLASHCARD: 'flashcard',
  MATCHING: 'matching',
  DRAG_DROP: 'drag_drop',
  TRUE_FALSE: 'true_false',
  ODD_ONE_OUT: 'odd_one_out'
};

export function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function getRandomDistractors(allItems, currentItem, count = 3, key = 'meaning') {
  const others = (allItems || []).filter(
    item => item && item.id !== currentItem.id && item[key] && String(item[key]).trim().length > 0
  );
  const shuffled = shuffleArray(others);
  const picked = shuffled.slice(0, count).map(it => it[key]);

  const fallbackPools = {
    meaning: ['সম্পর্কযুক্ত করা', 'উন্নতি সাধন', 'সতর্কীকরণ', 'মূল্যায়ন', 'পরিবর্তনশীল', 'সংরক্ষণ করা'],
    word: ['Facilitate', 'Enhance', 'Advocate', 'Synthesize', 'Clarify', 'Generate']
  };

  const fallback = fallbackPools[key] || fallbackPools.meaning;
  let fallbackIdx = 0;
  while (picked.length < count && fallbackIdx < fallback.length) {
    const fb = fallback[fallbackIdx++];
    if (!picked.includes(fb) && fb !== currentItem[key]) {
      picked.push(fb);
    }
  }

  return picked;
}

/**
 * Compiles a 5-Stage level for the game.
 * When isRetry is true, cross-stage randomization completely scrambles stage types across words.
 * Also randomizes word assignment to each stage so questions change dynamically.
 *
 * @param {Object} level - The level object containing raw items
 * @param {boolean} isRetry - Whether this is a retry attempt
 * @returns {Array} Array of 5 stage payloads
 */
export function buildLevelStages(level, isRetry = false) {
  if (!level || !level.items || !level.items.length) {
    return [];
  }

  // Shuffle the 5 words from this level so different words go to different stages
  const shuffledWords = shuffleArray([...level.items]);
  while (shuffledWords.length < 5) {
    shuffledWords.push({ ...shuffledWords[shuffledWords.length % shuffledWords.length], id: Math.random() });
  }

  // Base 5 distinct stage types
  let stageTypes = [
    STAGE_TYPES.FLASHCARD,
    STAGE_TYPES.MATCHING,
    STAGE_TYPES.DRAG_DROP,
    STAGE_TYPES.TRUE_FALSE,
    STAGE_TYPES.ODD_ONE_OUT
  ];

  // Scramble stage order dynamically
  stageTypes = shuffleArray(stageTypes);

  return stageTypes.map((type, idx) => {
    const item = shuffledWords[idx % shuffledWords.length];
    const allLevelItems = level.items;

    switch (type) {
      case STAGE_TYPES.FLASHCARD:
        return generateFlashcardStage(item, allLevelItems);
      case STAGE_TYPES.MATCHING:
        return generateMatchingStage(allLevelItems);
      case STAGE_TYPES.DRAG_DROP:
        return generateDragDropStage(item, allLevelItems);
      case STAGE_TYPES.TRUE_FALSE:
        return generateTrueFalseStage(item, allLevelItems);
      case STAGE_TYPES.ODD_ONE_OUT:
        return generateOddOneOutStage(item, allLevelItems);
      default:
        return generateFlashcardStage(item, allLevelItems);
    }
  });
}

function generateFlashcardStage(item, allItems) {
  const distractors = getRandomDistractors(allItems, item, 3, 'meaning');
  const options = shuffleArray([item.meaning, ...distractors]);
  return {
    type: STAGE_TYPES.FLASHCARD,
    title: 'ফ্ল্যাশ কার্ড ও স্মরণ পরীক্ষা (Flash Card)',
    instruction: 'শব্দটি দেখুন এবং সঠিক বাংলা অর্থ নির্বাচন করুন',
    item: item,
    question: `"${item.word}" শব্দটির সঠিক বাংলা অর্থ কোনটি?`,
    options: options,
    correctAnswer: item.meaning,
    explanation: `"${item.word}" (${item.pos || 'Word'}) এর অর্থ: "${item.meaning}"।${item.raw_synonyms ? ' সমার্থক শব্দ: ' + item.raw_synonyms : ''}${item.raw_antonyms ? ' | বিপরীত শব্দ: ' + item.raw_antonyms : ''}`
  };
}

function generateMatchingStage(allItems) {
  const selected = shuffleArray(allItems).slice(0, Math.min(allItems.length, 5));
  const leftItems = selected.map(it => ({ id: it.id, text: it.word }));
  const rightItems = shuffleArray(selected.map(it => ({ id: it.id, text: it.meaning })));

  return {
    type: STAGE_TYPES.MATCHING,
    title: 'বাম-ডান মিলকরণ (Left-Right Matching)',
    instruction: 'বাম পাশের ইংরেজি শব্দের সাথে ডান পাশের সঠিক বাংলা অর্থ মেলাও',
    leftItems: shuffleArray(leftItems),
    rightItems: rightItems,
    totalPairs: selected.length,
    explanation: 'প্রতিটি ইংরেজি শব্দের জন্য সঠিক বাংলা অর্থ মিলিয়ে পূর্ণ জোড়া তৈরি করুন।'
  };
}

function generateDragDropStage(item, allItems) {
  let sentence = item.sentence;
  let targetWord = item.word;

  let maskedSentence = '';
  if (sentence && sentence.toLowerCase().includes(targetWord.toLowerCase())) {
    const reg = new RegExp(`\\b${targetWord}\\b`, 'gi');
    maskedSentence = sentence.replace(reg, '_______');
  } else {
    maskedSentence = `বাক্যটি সম্পূর্ণ করো: [_______] শব্দটির বাংলা অর্থ হলো "${item.meaning}"।`;
  }

  const distractors = getRandomDistractors(allItems, item, 3, 'word');
  const options = shuffleArray([targetWord, ...distractors]);

  return {
    type: STAGE_TYPES.DRAG_DROP,
    title: 'শূন্যস্থান পূরণ (Drag & Drop Fill-in)',
    instruction: 'সঠিক শব্দটি টেনে খালি বক্সে বসাও বা ক্লিক করে নির্বাচন করো',
    item: item,
    sentenceText: maskedSentence,
    targetWord: targetWord,
    options: options,
    correctAnswer: targetWord,
    explanation: `সঠিক উত্তর: "${targetWord}"। এর অর্থ: "${item.meaning}"।`
  };
}

function generateTrueFalseStage(item, allItems) {
  const isTrue = Math.random() >= 0.5;
  let displayedMeaning = item.meaning;

  if (!isTrue) {
    const distractors = getRandomDistractors(allItems, item, 1, 'meaning');
    displayedMeaning = distractors.length > 0 ? distractors[0] : 'ভিন্ন অর্থ';
  }

  return {
    type: STAGE_TYPES.TRUE_FALSE,
    title: 'সত্য/মিথ্যা যাচাই (True/False Swipe)',
    instruction: 'বিবৃতিটি সত্য হলে TRUE অথবা মিথ্যা হলে FALSE নির্বাচন করুন',
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

function generateOddOneOutStage(item, allItems) {
  let syns = (item.synonyms && item.synonyms.length >= 2) ? item.synonyms.slice(0, 3) : [];
  let oddWord = '';
  let categoryTitle = '';

  if (syns.length >= 2 && item.antonyms && item.antonyms.length > 0) {
    oddWord = item.antonyms[0];
    const choices = shuffleArray([item.word, ...syns.slice(0, 2), oddWord]);
    categoryTitle = `"${item.word}" এর সাথে নিচের কোনটি বেমানান বা বিপরীত শব্দ (Antonym)?`;
    return {
      type: STAGE_TYPES.ODD_ONE_OUT,
      title: 'বেমানান শব্দ বাছাই (Odd One Out)',
      instruction: 'চারটি বিকল্পের মধ্য থেকে বেমানান বা বিপরীত (Odd) শব্দটি বেছে নাও',
      categoryTitle: categoryTitle,
      options: choices,
      correctAnswer: oddWord,
      explanation: `সঠিক উত্তর: "${oddWord}"। এটি বিপরীত শব্দ (Antonym), বাকিগুলো "${item.word}" এর সমার্থক (Synonyms)।`
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
      instruction: 'চারটি বিকল্পের মধ্য থেকে বেমানান (Odd) শব্দটি খুঁজে বের করো',
      categoryTitle: `"${item.word}" সম্পর্কিত তালিকার বাইরে কোনটি?`,
      options: choices,
      correctAnswer: oddWord,
      explanation: `সঠিক উত্তর: "${oddWord}"। এটি ভিন্ন শব্দ, বাকিগুলো "${item.word}" সম্পর্কিত।`
    };
  }
}