const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// Helper to write UTF-8 file
function writeFile(relPath, content) {
  const fullPath = path.join(rootDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Successfully wrote:', relPath);
}

// ----------------------------------------------------
// 1. src/engine/GameEngine.js
// ----------------------------------------------------
writeFile('src/engine/GameEngine.js', `// The Blender (Universal Game Engine for React)
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
 * When isRetry is true, "The Blender" scrambles stage types across the 5 level words.
 *
 * @param {Object} level - The level object containing raw items
 * @param {boolean} isRetry - Whether this is a retry attempt (triggers The Blender)
 * @returns {Array} Array of 5 stage payloads
 */
export function buildLevelStages(level, isRetry = false) {
  if (!level || !level.items || !level.items.length) {
    return [];
  }

  const items = [...level.items];
  while (items.length < 5) {
    items.push({ ...items[items.length % items.length], id: Math.random() });
  }

  // Base 5 distinct stage types
  let stageTypes = [
    STAGE_TYPES.FLASHCARD,
    STAGE_TYPES.MATCHING,
    STAGE_TYPES.DRAG_DROP,
    STAGE_TYPES.TRUE_FALSE,
    STAGE_TYPES.ODD_ONE_OUT
  ];

  if (isRetry) {
    // The Blender: Cross-stage randomization scrambles stage types across words
    stageTypes = shuffleArray(stageTypes);
  }

  return stageTypes.map((type, idx) => {
    const item = items[idx % items.length];
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
    question: \`"\${item.word}" শব্দটির সঠিক বাংলা অর্থ কোনটি?\`,
    options: options,
    correctAnswer: item.meaning,
    explanation: \`"\${item.word}" (\${item.pos || 'Word'}) এর অর্থ: "\${item.meaning}"।\${item.raw_synonyms ? ' সমার্থক শব্দ: ' + item.raw_synonyms : ''}\${item.raw_antonyms ? ' | বিপরীত শব্দ: ' + item.raw_antonyms : ''}\`
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
    const reg = new RegExp(\`\\\\b\${targetWord}\\\\b\`, 'gi');
    maskedSentence = sentence.replace(reg, '_______');
  } else {
    maskedSentence = \`বাক্যটি সম্পূর্ণ করো: [_______] শব্দটির বাংলা অর্থ হলো "\${item.meaning}"।\`;
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
    explanation: \`সঠিক উত্তর: "\${targetWord}"। এর অর্থ: "\${item.meaning}"।\`
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
    statement: \`"\${item.word}" শব্দটির অর্থ কি "\${displayedMeaning}"?\`,
    displayedMeaning: displayedMeaning,
    isTrue: isTrue,
    correctAnswer: isTrue ? 'TRUE' : 'FALSE',
    explanation: isTrue 
      ? \`সঠিক! "\${item.word}" এর প্রকৃত অর্থ "\${item.meaning}"।\` 
      : \`ভুল! "\${item.word}" এর সঠিক অর্থ হলো "\${item.meaning}" (প্রদর্শিত অর্থ "\${displayedMeaning}" সঠিক নয়)।\`
  };
}

function generateOddOneOutStage(item, allItems) {
  let syns = (item.synonyms && item.synonyms.length >= 2) ? item.synonyms.slice(0, 3) : [];
  let oddWord = '';
  let categoryTitle = '';

  if (syns.length >= 2 && item.antonyms && item.antonyms.length > 0) {
    oddWord = item.antonyms[0];
    const choices = shuffleArray([item.word, ...syns.slice(0, 2), oddWord]);
    categoryTitle = \`"\${item.word}" এর সাথে নিচের কোনটি বেমানান বা বিপরীত শব্দ (Antonym)?\`;
    return {
      type: STAGE_TYPES.ODD_ONE_OUT,
      title: 'বেমানান শব্দ বাছাই (Odd One Out)',
      instruction: 'চারটি বিকল্পের মধ্য থেকে বেমানান বা বিপরীত (Odd) শব্দটি বেছে নাও',
      categoryTitle: categoryTitle,
      options: choices,
      correctAnswer: oddWord,
      explanation: \`সঠিক উত্তর: "\${oddWord}"। এটি বিপরীত শব্দ (Antonym), বাকিগুলো "\${item.word}" এর সমার্থক (Synonyms)।\`
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
      categoryTitle: \`"\${item.word}" সম্পর্কিত তালিকার বাইরে কোনটি?\`,
      options: choices,
      correctAnswer: oddWord,
      explanation: \`সঠিক উত্তর: "\${oddWord}"। এটি ভিন্ন শব্দ, বাকিগুলো "\${item.word}" সম্পর্কিত।\`
    };
  }
}
`);

// ----------------------------------------------------
// 2. src/components/stages/FlashcardStage.jsx
// ----------------------------------------------------
writeFile('src/components/stages/FlashcardStage.jsx', `import React, { useState } from 'react';
import { Volume2, RotateCw, HelpCircle, XCircle } from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

export default function FlashcardStage({ stage, onSubmitAnswer, isSecondChance }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [wrongOptions, setWrongOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    sound.playFlip();
  };

  const handleSpeak = (e) => {
    e.stopPropagation();
    sound.speak(stage.item.word);
  };

  const handleSelectOption = (opt) => {
    if (selectedOption || wrongOptions.includes(opt)) return;
    sound.playClick();

    const isCorrect = String(opt).trim().toLowerCase() === String(stage.correctAnswer).trim().toLowerCase();

    if (isCorrect) {
      setSelectedOption(opt);
      onSubmitAnswer(opt);
    } else {
      setWrongOptions(prev => [...prev, opt]);
      onSubmitAnswer(opt);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col space-y-6 animate-pop">
      {/* 3D Flip Card Container */}
      <div 
        onClick={handleFlip}
        className="perspective-1000 w-full cursor-pointer group"
      >
        <div className={\`relative w-full min-h-[240px] rounded-3xl transition-transform duration-500 transform-style-3d \${
          isFlipped ? 'rotate-y-180' : ''
        }\`}>
          {/* Front Card Face */}
          <div className="absolute inset-0 backface-hidden bg-white border-2 border-indigo-100 rounded-3xl p-6 shadow-md flex flex-col justify-between group-hover:border-indigo-300 transition">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
                {stage.item.pos || 'VOCABULARY'}
              </span>
              <button
                onClick={handleSpeak}
                className="p-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-full transition shadow-xs"
                title="Pronounce Word"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
                {stage.item.word}
              </h2>
              <p className="text-xs text-slate-400 mt-2 font-medium">কার্ডে ক্লিক করে অর্থ ও ব্যাখ্যা দেখুন</p>
            </div>

            <div className="flex items-center justify-center text-indigo-600 text-xs font-bold space-x-1.5 py-1">
              <RotateCw className="w-4 h-4" />
              <span>উল্টাতে ট্যাপ করুন</span>
            </div>
          </div>

          {/* Back Card Face */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>শব্দের অর্থ ও বিবরণ</span>
              <span className="text-indigo-400 font-bold">{stage.item.word}</span>
            </div>

            <div className="text-center py-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-amber-400">
                {stage.item.meaning}
              </h3>
              {stage.item.raw_synonyms && (
                <p className="text-xs text-slate-300 mt-3">
                  <span className="text-slate-400 font-semibold">Synonyms:</span> {stage.item.raw_synonyms}
                </p>
              )}
              {stage.item.raw_antonyms && (
                <p className="text-xs text-slate-400 mt-1">
                  <span className="text-slate-500 font-semibold">Antonyms:</span> {stage.item.raw_antonyms}
                </p>
              )}
            </div>

            <div className="text-center text-xs text-slate-400">
              আবার উল্টাতে ট্যাপ করুন
            </div>
          </div>
        </div>
      </div>

      {/* Active Recall Question Card */}
      <div className={\`p-5 rounded-2xl bg-white border-2 transition shadow-sm \${
        isSecondChance ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'
      }\`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-slate-700 font-bold text-sm">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>{stage.question}</span>
          </div>
          {isSecondChance && (
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full animate-pulse">
              ২য় সুযোগ (0 Star)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {stage.options.map((opt, i) => {
            const isWrong = wrongOptions.includes(opt);
            const isSelected = selectedOption === opt;

            return (
              <button
                key={i}
                onClick={() => handleSelectOption(opt)}
                disabled={isWrong || (selectedOption !== null)}
                className={\`p-3.5 text-sm font-semibold rounded-xl border-2 transition flex items-center justify-between text-left \${
                  isWrong
                    ? 'border-rose-300 bg-rose-50 text-rose-400 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                    : 'border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-slate-800 bg-white shadow-xs'
                }\`}
              >
                <span>{opt}</span>
                {isWrong ? (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                ) : (
                  <span className="text-xs text-slate-400 font-mono">0{i + 1}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
`);

// ----------------------------------------------------
// 3. src/components/stages/MatchingStage.jsx
// ----------------------------------------------------
writeFile('src/components/stages/MatchingStage.jsx', `import React, { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

export default function MatchingStage({ stage, onSubmitAnswer, isSecondChance }) {
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [errorIds, setErrorIds] = useState([]);
  const [hadMistake, setHadMistake] = useState(false);

  const handleLeftClick = (item) => {
    if (matchedIds.includes(item.id)) return;
    sound.playClick();
    setSelectedLeft(item);
    if (selectedRight) {
      checkMatch(item, selectedRight);
    }
  };

  const handleRightClick = (item) => {
    if (matchedIds.includes(item.id)) return;
    sound.playClick();
    setSelectedRight(item);
    if (selectedLeft) {
      checkMatch(selectedLeft, item);
    }
  };

  const checkMatch = (left, right) => {
    if (!left || !right) return;

    if (left.id === right.id) {
      // Correct match
      sound.playCorrect();
      const updated = [...matchedIds, left.id];
      setMatchedIds(updated);
      setSelectedLeft(null);
      setSelectedRight(null);

      if (updated.length >= stage.totalPairs) {
        setTimeout(() => {
          onSubmitAnswer(true);
        }, 500);
      }
    } else {
      // Wrong match
      sound.playWrong();
      setErrorIds([left.id, right.id]);
      if (!hadMistake) {
        setHadMistake(true);
        sound.playSecondChance();
      }

      setTimeout(() => {
        setErrorIds([]);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col space-y-4 animate-pop">
      {hadMistake && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center space-x-1.5 animate-pulse">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>ভুল মিলকরণ হয়েছে! সবকটি জোড়া মেলান (২য় সুযোগ)</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Left Column (English Words) */}
        <div className="flex flex-col space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">ইংরেজি শব্দ</div>
          {stage.leftItems.map((item) => {
            const isMatched = matchedIds.includes(item.id);
            const isSelected = selectedLeft?.id === item.id;
            const isError = errorIds.includes(item.id);

            return (
              <button
                key={item.id}
                onClick={() => handleLeftClick(item)}
                disabled={isMatched}
                className={\`p-4 rounded-2xl border-2 font-bold text-sm text-left transition flex items-center justify-between \${
                  isMatched
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 opacity-80'
                    : isError
                    ? 'bg-rose-50 border-rose-400 text-rose-800 animate-shake'
                    : isSelected
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-md ring-2 ring-indigo-300'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-indigo-400 shadow-xs'
                }\`}
              >
                <span>{item.text}</span>
                {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </button>
            );
          })}
        </div>

        {/* Right Column (Bengali Meanings) */}
        <div className="flex flex-col space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">বাংলা অর্থ</div>
          {stage.rightItems.map((item) => {
            const isMatched = matchedIds.includes(item.id);
            const isSelected = selectedRight?.id === item.id;
            const isError = errorIds.includes(item.id);

            return (
              <button
                key={item.id}
                onClick={() => handleRightClick(item)}
                disabled={isMatched}
                className={\`p-4 rounded-2xl border-2 font-medium text-sm text-left transition flex items-center justify-between \${
                  isMatched
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 opacity-80'
                    : isError
                    ? 'bg-rose-50 border-rose-400 text-rose-800 animate-shake'
                    : isSelected
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-md ring-2 ring-indigo-300'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 shadow-xs'
                }\`}
              >
                <span>{item.text}</span>
                {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
`);

// ----------------------------------------------------
// 4. src/components/stages/DragDropStage.jsx
// ----------------------------------------------------
writeFile('src/components/stages/DragDropStage.jsx', `import React, { useState } from 'react';
import { MousePointerClick, XCircle } from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

export default function DragDropStage({ stage, onSubmitAnswer, isSecondChance }) {
  const [placedWord, setPlacedWord] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [wrongWords, setWrongWords] = useState([]);

  const handlePlaceWord = (word) => {
    if (wrongWords.includes(word) || placedWord) return;
    sound.playClick();
    setPlacedWord(word);

    const isCorrect = String(word).trim().toLowerCase() === String(stage.correctAnswer).trim().toLowerCase();

    if (isCorrect) {
      setTimeout(() => {
        onSubmitAnswer(word);
      }, 400);
    } else {
      setWrongWords(prev => [...prev, word]);
      setTimeout(() => {
        setPlacedWord(null);
        onSubmitAnswer(word);
      }, 600);
    }
  };

  const handleDragStart = (e, word) => {
    e.dataTransfer.setData('text/plain', word);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const word = e.dataTransfer.getData('text/plain');
    if (word) {
      handlePlaceWord(word);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col space-y-6 animate-pop">
      {/* Sentence Box */}
      <div className={\`p-6 sm:p-8 rounded-3xl bg-white border-2 text-center shadow-md transition \${
        isSecondChance ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'
      }\`}>
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 bg-cyan-50 text-cyan-700 text-xs font-bold rounded-full">
            বাক্য সম্পূর্ণকরণ
          </span>
          {isSecondChance && (
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full animate-pulse">
              ২য় সুযোগ (0 Star)
            </span>
          )}
        </div>

        <div className="my-6 text-lg sm:text-xl font-bold text-slate-800 leading-relaxed">
          {stage.sentenceText.split('_______').map((part, i, arr) => (
            <React.Fragment key={i}>
              {part}
              {i < arr.length - 1 && (
                <span
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={\`inline-flex items-center justify-center min-w-[130px] px-4 py-1.5 align-middle mx-1.5 rounded-xl border-2 transition-all font-black \${
                    placedWord
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : isDragOver
                      ? 'bg-indigo-100 border-indigo-500 scale-105'
                      : 'border-dashed border-slate-300 bg-slate-50 text-slate-400 text-xs'
                  }\`}
                >
                  {placedWord || 'এখানে বসাও'}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Available Word Chips */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
        <div className="flex items-center justify-center space-x-1 text-xs text-slate-500 font-semibold mb-3">
          <MousePointerClick className="w-4 h-4 text-indigo-500" />
          <span>টেনে এনে বসাও অথবা ক্লিক করে নির্বাচন করো:</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {stage.options.map((opt, i) => {
            const isWrong = wrongWords.includes(opt);
            return (
              <button
                key={i}
                draggable={!isWrong}
                onDragStart={(e) => handleDragStart(e, opt)}
                onClick={() => handlePlaceWord(opt)}
                disabled={isWrong || (placedWord !== null)}
                className={\`px-5 py-2.5 border-2 font-bold text-sm rounded-xl shadow-xs transition transform active:scale-95 flex items-center space-x-1.5 \${
                  isWrong
                    ? 'border-rose-200 bg-rose-50 text-rose-400 opacity-60 cursor-not-allowed'
                    : 'bg-white border-slate-200 hover:border-indigo-500 text-slate-800 hover:shadow-md cursor-grab active:cursor-grabbing'
                }\`}
              >
                <span>{opt}</span>
                {isWrong && <XCircle className="w-4 h-4 text-rose-500" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
`);

// ----------------------------------------------------
// 5. src/components/stages/TrueFalseSwipeStage.jsx
// ----------------------------------------------------
writeFile('src/components/stages/TrueFalseSwipeStage.jsx', `import React, { useState, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

export default function TrueFalseSwipeStage({ stage, onSubmitAnswer, isSecondChance }) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const startXRef = useRef(0);

  const handleDecision = (choice) => {
    if (isAnswered) return;
    setIsAnswered(true);
    sound.playSwipe();

    setDragOffset(choice === 'TRUE' ? 350 : -350);

    setTimeout(() => {
      const isCorrect = String(choice).trim().toUpperCase() === String(stage.correctAnswer).trim().toUpperCase();
      if (!isCorrect && !isSecondChance) {
        // Reset card on 1st failure for 2nd chance
        setDragOffset(0);
        setIsAnswered(false);
      }
      onSubmitAnswer(choice);
    }, 320);
  };

  // Touch Handlers
  const handleTouchStart = (e) => {
    if (isAnswered) return;
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || isAnswered) return;
    const diff = e.touches[0].clientX - startXRef.current;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging || isAnswered) return;
    setIsDragging(false);

    if (dragOffset > 75) {
      handleDecision('TRUE');
    } else if (dragOffset < -75) {
      handleDecision('FALSE');
    } else {
      setDragOffset(0);
    }
  };

  const rotation = dragOffset * 0.06;
  const trueStampOpacity = Math.max(0, Math.min(1, (dragOffset - 20) / 60));
  const falseStampOpacity = Math.max(0, Math.min(1, (-dragOffset - 20) / 60));

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-6 animate-pop">
      {/* Swipeable Card Area */}
      <div className="relative w-full min-h-[290px]">
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: \`translateX(\${dragOffset}px) rotate(\${rotation}deg)\`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
          className={\`absolute inset-0 p-6 rounded-3xl bg-white border-2 shadow-xl flex flex-col justify-between cursor-grab active:cursor-grabbing select-none \${
            isSecondChance ? 'border-amber-400 bg-amber-50/20' : 'border-indigo-100'
          }\`}
        >
          {/* Visual Stamps */}
          <div
            style={{ opacity: trueStampOpacity }}
            className="absolute top-6 right-6 border-3 border-emerald-500 text-emerald-600 font-black text-xl px-4 py-1.5 rounded-xl rotate-12 pointer-events-none"
          >
            TRUE
          </div>

          <div
            style={{ opacity: falseStampOpacity }}
            className="absolute top-6 left-6 border-3 border-rose-500 text-rose-600 font-black text-xl px-4 py-1.5 rounded-xl -rotate-12 pointer-events-none"
          >
            FALSE
          </div>

          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">
              সত্য / মিথ্যা যাচাই
            </span>
            {isSecondChance ? (
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full animate-pulse">
                ২য় সুযোগ
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium">ডানে = সত্য | বামে = মিথ্যা</span>
            )}
          </div>

          <div className="text-center py-5">
            <h2 className="text-3xl font-extrabold text-slate-800">{stage.item.word}</h2>
            <div className="my-3 h-0.5 w-12 bg-indigo-100 mx-auto rounded-full" />
            <p className="text-base text-slate-600 font-medium leading-relaxed">
              {stage.statement}
            </p>
          </div>

          <div className="text-center text-xs text-slate-400 font-medium">
            সোয়াইপ করুন অথবা নিচের বাটনে চাপুন
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-4 w-full pt-2">
        <button
          onClick={() => handleDecision('FALSE')}
          disabled={isAnswered}
          className="flex-1 py-3.5 px-6 rounded-2xl bg-rose-50 border-2 border-rose-200 hover:bg-rose-100 text-rose-700 font-bold text-sm flex items-center justify-center space-x-2 transition shadow-xs active:scale-95"
        >
          <X className="w-5 h-5 text-rose-600" />
          <span>FALSE (মিথ্যা)</span>
        </button>

        <button
          onClick={() => handleDecision('TRUE')}
          disabled={isAnswered}
          className="flex-1 py-3.5 px-6 rounded-2xl bg-emerald-50 border-2 border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center space-x-2 transition shadow-xs active:scale-95"
        >
          <Check className="w-5 h-5 text-emerald-600" />
          <span>TRUE (সত্য)</span>
        </button>
      </div>
    </div>
  );
}
`);

// ----------------------------------------------------
// 6. src/components/stages/OddOneOutStage.jsx
// ----------------------------------------------------
writeFile('src/components/stages/OddOneOutStage.jsx', `import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

export default function OddOneOutStage({ stage, onSubmitAnswer, isSecondChance }) {
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [wrongOpts, setWrongOpts] = useState([]);

  const handleSelect = (opt) => {
    if (selectedOpt || wrongOpts.includes(opt)) return;
    sound.playClick();

    const isCorrect = String(opt).trim().toLowerCase() === String(stage.correctAnswer).trim().toLowerCase();

    if (isCorrect) {
      setSelectedOpt(opt);
      onSubmitAnswer(opt);
    } else {
      setWrongOpts(prev => [...prev, opt]);
      onSubmitAnswer(opt);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col space-y-5 animate-pop">
      {/* Question Header Card */}
      <div className={\`p-5 rounded-2xl bg-white border-2 text-center shadow-md transition \${
        isSecondChance ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'
      }\`}>
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full">
            বেমানান শব্দ
          </span>
          {isSecondChance && (
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full animate-pulse">
              ২য় সুযোগ (0 Star)
            </span>
          )}
        </div>
        <p className="text-base font-bold text-slate-800 mt-2">{stage.categoryTitle}</p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {stage.options.map((opt, i) => {
          const isWrong = wrongOpts.includes(opt);
          const isSelected = selectedOpt === opt;

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              disabled={isWrong || (selectedOpt !== null)}
              className={\`p-4 rounded-2xl border-2 font-bold text-sm text-left transition flex items-center justify-between shadow-xs \${
                isWrong
                  ? 'border-rose-200 bg-rose-50 text-rose-400 opacity-60 cursor-not-allowed'
                  : isSelected
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white hover:border-purple-500 hover:bg-purple-50 text-slate-800 hover:shadow-md'
              }\`}
            >
              <span>{opt}</span>
              {isWrong ? (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              ) : (
                <span className="text-xs text-slate-400 font-mono">0{i + 1}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
`);

// ----------------------------------------------------
// 7. src/components/modals/AnswerRevealModal.jsx
// ----------------------------------------------------
writeFile('src/components/modals/AnswerRevealModal.jsx', `import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function AnswerRevealModal({ correctAnswer, explanation, onContinue }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-pop text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-slate-900">সঠিক উত্তর ও ব্যাখ্যা</h3>
        
        <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Correct Answer (সঠিক উত্তর)
          </div>
          <div className="text-lg font-black text-indigo-700 mb-3">
            {correctAnswer}
          </div>

          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Explanation (ব্যাখ্যা)
          </div>
          <div className="text-sm font-medium text-slate-700 leading-relaxed">
            {explanation}
          </div>
        </div>

        <button
          onClick={onContinue}
          className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center space-x-2 transition shadow-md hover:shadow-lg active:scale-95"
        >
          <span>পরবর্তী ধাপে যান</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
`);

// ----------------------------------------------------
// 8. src/components/modals/CompletionModal.jsx
// ----------------------------------------------------
writeFile('src/components/modals/CompletionModal.jsx', `import React, { useEffect } from 'react';
import { Star, Trophy, Shuffle, ArrowRight, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CompletionModal({ 
  level, 
  totalStars, 
  isFiveStar, 
  onNextLevel, 
  onRetryLevel, 
  onBackToMap 
}) {
  useEffect(() => {
    if (isFiveStar) {
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  }, [isFiveStar]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-pop text-center">
        {/* Top Icon */}
        <div className={\`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm \${
          isFiveStar ? 'bg-amber-50 text-amber-500 border border-amber-200' : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
        }\`}>
          {isFiveStar ? <Trophy className="w-8 h-8" /> : <Shuffle className="w-8 h-8" />}
        </div>

        {/* Title & Stars */}
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {isFiveStar ? 'লেভেল মাস্টার্ড! ৫-স্টার অর্জন!' : 'লেভেল সম্পন্ন হয়েছে!'}
        </h2>

        <div className="flex items-center justify-center space-x-2 my-4">
          {[0, 1, 2, 3, 4].map((s) => (
            <Star
              key={s}
              className={\`w-8 h-8 transition-transform \${
                s < totalStars ? 'text-amber-400 fill-amber-400 scale-110' : 'text-slate-200 stroke-1'
              }\`}
            />
          ))}
        </div>

        {/* Message */}
        <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6">
          {isFiveStar
            ? 'অভিনন্দন! আপনি ১ম সুযোগেই প্রতিটি ধাপ সঠিকভাবে সম্পন্ন করে ৫-স্টার অর্জন করেছেন এবং পরবর্তী লেভেল আনলক করেছেন।'
            : \`আপনি ৫টির মধ্যে \${totalStars}টি স্টার অর্জন করেছেন। পরবর্তী লেভেল আনলক করতে ৫টি স্টার প্রয়োজন। The Blender দিয়ে নতুন বিন্যাসে পুনরায় চেষ্টা করে ৫-স্টার অর্জন করুন।\`}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          {isFiveStar ? (
            <button
              onClick={onNextLevel}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center space-x-2 transition shadow-md active:scale-95"
            >
              <span>পরবর্তী লেভেল খেলুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onRetryLevel}
              className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center space-x-2 transition shadow-md active:scale-95"
            >
              <Shuffle className="w-4 h-4" />
              <span>The Blender দিয়ে পুনরায় চেষ্টা করুন</span>
            </button>
          )}

          <button
            onClick={onBackToMap}
            className="w-full py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition active:scale-95"
          >
            লেভেল ম্যাপে ফিরে যান
          </button>
        </div>
      </div>
    </div>
  );
}
`);

// ----------------------------------------------------
// 9. src/components/modals/SyncModal.jsx
// ----------------------------------------------------
writeFile('src/components/modals/SyncModal.jsx', `import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle2, ShieldCheck, Database } from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

export default function SyncModal({ onClose, totalLevels, onReloadLevels }) {
  const [syncStatus, setSyncStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);
    sound.playClick();
    try {
      const res = await fetch('/data/version.json');
      const ver = await res.json();
      setSyncStatus(\`ডাটা সিঙ্ক সফল! ভার্সন: \${ver.version} (মোট \${ver.total_levels}টি লেভেল)\`);
      onReloadLevels();
    } catch (e) {
      setSyncStatus('সার্ভার থেকে ডাটা রিফ্রেশ করা হয়েছে। অফলাইন ডাটা প্রস্তুত।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-pop">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">ডাটাবেজ স্ট্যাটাস ও সিঙ্ক</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5 space-y-4 text-sm text-slate-600">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">বর্তমানে লোড হওয়া লেভেল</div>
              <div className="text-xl font-bold text-slate-900">{totalLevels} টি লেভেল</div>
            </div>
            <span className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Offline Ready</span>
            </span>
          </div>

          <div className="text-xs text-slate-500 leading-relaxed">
            অ্যাপের সকল ডাটা লোকাল JSON ফাইল থেকে লোড হয়। সম্পূর্ণ অফলাইনে গেমটি খেলা যাবে এবং প্রগ্রেস সংরক্ষিত থাকবে।
          </div>

          {syncStatus && (
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{syncStatus}</span>
            </div>
          )}
        </div>

        <button
          onClick={handleSync}
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center space-x-2 transition shadow-md active:scale-95"
        >
          <RefreshCw className={\`w-4 h-4 \${isLoading ? 'animate-spin' : ''}\`} />
          <span>{isLoading ? 'ডাটা সিঙ্ক হচ্ছে...' : 'ডাটাবেজ সিঙ্ক ও রিলোড করুন'}</span>
        </button>
      </div>
    </div>
  );
}
`);

// ----------------------------------------------------
// 10. src/components/Header.jsx
// ----------------------------------------------------
writeFile('src/components/Header.jsx', `import React from 'react';
import { Star, Volume2, VolumeX, Settings, ArrowLeft } from 'lucide-react';
import { sound } from '../audio/SoundSynthesizer';

export default function Header({ 
  currentLevel, 
  stageIndex, 
  stageStars, 
  isAudioMuted, 
  setIsAudioMuted, 
  onBackToMap, 
  onOpenSettings 
}) {
  const toggleAudio = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    sound.enabled = !next;
  };

  const progressPercent = ((stageIndex) / 5) * 100;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Back & Level Title */}
        <div className="flex items-center space-x-3">
          {currentLevel && (
            <button
              onClick={onBackToMap}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition active:scale-95"
              title="Back to Map"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                {currentLevel ? currentLevel.title : 'VocabMaster'}
              </h1>
              {currentLevel && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {currentLevel.unit || currentLevel.category}
                </span>
              )}
            </div>
            {currentLevel && (
              <p className="text-xs text-slate-400 font-medium">ধাপ {stageIndex + 1} / 5</p>
            )}
          </div>
        </div>

        {/* Center: 5 Stars Indicator */}
        {currentLevel && (
          <div className="hidden sm:flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            {[0, 1, 2, 3, 4].map((idx) => {
              const isFilled = idx < stageIndex ? stageStars[idx] : false;
              const isCurrent = idx === stageIndex;
              return (
                <Star
                  key={idx}
                  className={\`w-5 h-5 transition-all \${
                    isFilled
                      ? 'text-amber-400 fill-amber-400 scale-110'
                      : isCurrent
                      ? 'text-indigo-500 animate-pulse stroke-2'
                      : 'text-slate-300 stroke-1'
                  }\`}
                />
              );
            })}
          </div>
        )}

        {/* Right: Audio & Settings */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleAudio}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition active:scale-95"
            title={isAudioMuted ? 'Unmute' : 'Mute'}
          >
            {isAudioMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-indigo-600" />}
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition active:scale-95"
            title="Settings & Sync"
          >
            <Settings className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {currentLevel && (
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-indigo-600 h-1.5 transition-all duration-300 ease-out"
            style={{ width: \`\${progressPercent}%\` }}
          />
        </div>
      )}
    </header>
  );
}
`);

// ----------------------------------------------------
// 11. src/components/LevelMap.jsx
// ----------------------------------------------------
writeFile('src/components/LevelMap.jsx', `import React, { useState } from 'react';
import { Star, Lock, Play, CheckCircle2, Sparkles, Filter } from 'lucide-react';
import { sound } from '../audio/SoundSynthesizer';

export default function LevelMap({ levels, unlockedLevel, levelStars, onSelectLevel }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', ...new Set(levels.map(l => l.category).filter(Boolean))];

  const filteredLevels = selectedCategory === 'ALL'
    ? levels
    : levels.filter(l => l.category === selectedCategory);

  const totalMastered = Object.values(levelStars).filter(s => s === 5).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Banner / Stats */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Vocabulary Journey (Interactive Learning)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">ইংরেজি ভোকাবুলারি জার্নি</h2>
          <p className="text-sm text-indigo-100 mt-2 max-w-md">
            প্রতিটি লেভেলে ৫টি ধাপ রয়েছে। পরবর্তী লেভেল আনলক করতে ১ম সুযোগেই সবকটি ধাপ সঠিক করে ৫-স্টার অর্জন করুন!
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center min-w-[150px]">
          <span className="text-xs text-indigo-200 uppercase font-semibold">Mastered (৫-স্টার)</span>
          <div className="text-3xl font-black text-amber-300 mt-0.5">
            {totalMastered} <span className="text-sm font-normal text-white">/ {levels.length}</span>
          </div>
          <div className="flex items-center justify-center space-x-1 mt-1 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="text-[11px] font-bold text-indigo-100">5-Star Required</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              sound.playClick();
            }}
            className={\`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition \${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }\`}
          >
            {cat === 'ALL' ? 'সব ক্যাটাগরি' : cat}
          </button>
        ))}
      </div>

      {/* Level Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredLevels.map((lvl) => {
          const isUnlocked = lvl.level_id <= unlockedLevel;
          const stars = levelStars[lvl.level_id] || 0;
          const isMastered = stars === 5;

          return (
            <div
              key={lvl.level_id}
              onClick={() => {
                if (isUnlocked) {
                  sound.playClick();
                  onSelectLevel(lvl);
                }
              }}
              className={\`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between relative overflow-hidden \${
                isUnlocked
                  ? 'bg-white border-slate-200 hover:border-indigo-500 hover:shadow-lg cursor-pointer'
                  : 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
              }\`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={\`text-[11px] font-bold px-2.5 py-1 rounded-full \${
                    isUnlocked ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200 text-slate-500'
                  }\`}>
                    {lvl.category || 'Vocabulary'}
                  </span>

                  {isMastered ? (
                    <span className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mastered</span>
                    </span>
                  ) : !isUnlocked ? (
                    <Lock className="w-4 h-4 text-slate-400" />
                  ) : null}
                </div>

                <h3 className="text-base font-bold text-slate-800 mt-3">{lvl.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{lvl.unit || ''}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star
                      key={s}
                      className={\`w-4 h-4 \${
                        s < stars ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                      }\`}
                    />
                  ))}
                </div>

                <span className={\`text-xs font-bold flex items-center space-x-1 \${
                  isUnlocked ? 'text-indigo-600' : 'text-slate-400'
                }\`}>
                  {isUnlocked && <Play className="w-3 h-3 fill-indigo-600" />}
                  <span>{isUnlocked ? 'Play' : 'Locked'}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
`);

// ----------------------------------------------------
// 12. src/App.jsx
// ----------------------------------------------------
writeFile('src/App.jsx', `import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LevelMap from './components/LevelMap';
import FlashcardStage from './components/stages/FlashcardStage';
import MatchingStage from './components/stages/MatchingStage';
import DragDropStage from './components/stages/DragDropStage';
import TrueFalseSwipeStage from './components/stages/TrueFalseSwipeStage';
import OddOneOutStage from './components/stages/OddOneOutStage';
import AnswerRevealModal from './components/modals/AnswerRevealModal';
import CompletionModal from './components/modals/CompletionModal';
import SyncModal from './components/modals/SyncModal';
import { buildLevelStages, STAGE_TYPES } from './engine/GameEngine';
import { sound } from './audio/SoundSynthesizer';

export default function App() {
  const [levels, setLevels] = useState([]);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [levelStars, setLevelStars] = useState({});
  const [currentLevel, setCurrentLevel] = useState(null);
  const [stages, setStages] = useState([]);
  const [stageIndex, setStageIndex] = useState(0);
  const [stageStars, setStageStars] = useState([false, false, false, false, false]);
  const [stageAttempts, setStageAttempts] = useState(0); // 0: 1st, 1: 2nd, 2: failed
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [revealModalData, setRevealModalData] = useState(null);
  const [completionResult, setCompletionResult] = useState(null);

  // Load Progress and Levels
  useEffect(() => {
    loadLocalProgress();
    loadLevelsData();
  }, []);

  const loadLocalProgress = () => {
    try {
      const saved = localStorage.getItem('vocabmaster_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.unlockedLevel) setUnlockedLevel(parsed.unlockedLevel);
        if (parsed.levelStars) setLevelStars(parsed.levelStars);
      }
    } catch (e) {}
  };

  const saveProgress = (newUnlocked, newStars) => {
    try {
      localStorage.setItem('vocabmaster_progress', JSON.stringify({
        unlockedLevel: newUnlocked,
        levelStars: newStars
      }));
    } catch (e) {}
  };

  const loadLevelsData = async () => {
    try {
      const res = await fetch('/data/levels.json');
      const data = await res.json();
      if (data.levels) {
        setLevels(data.levels);
      }
    } catch (e) {
      console.error('Failed to load levels:', e);
    }
  };

  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const handleStartLevel = (level, isRetry = false) => {
    const compiledStages = buildLevelStages(level, isRetry);
    setCurrentLevel(level);
    setStages(compiledStages);
    setStageIndex(0);
    setStageStars([false, false, false, false, false]);
    setStageAttempts(0);
    setCompletionResult(null);
    setRevealModalData(null);
  };

  const handleAnswerSubmit = (userAnswer) => {
    const currentStage = stages[stageIndex];
    let isCorrect = false;

    if (currentStage.type === STAGE_TYPES.MATCHING) {
      isCorrect = true; // Matching handles internal pairings and passes completion
    } else {
      isCorrect = String(userAnswer).trim().toLowerCase() === String(currentStage.correctAnswer).trim().toLowerCase();
    }

    if (isCorrect) {
      sound.playCorrect();
      if (stageAttempts === 0) {
        // 1st Attempt Correct: Award Star!
        const updatedStars = [...stageStars];
        updatedStars[stageIndex] = true;
        setStageStars(updatedStars);
        showToast('সঠিক উত্তর! (১টি স্টার অর্জিত ⭐)', 'success');
      } else {
        // 2nd Attempt Correct: 0 Star for this stage
        showToast('সঠিক উত্তর! (২য় সুযোগ সম্পন্ন)', 'success');
      }

      setTimeout(() => {
        proceedNextStage();
      }, 700);
    } else {
      if (stageAttempts === 0) {
        // 1st Attempt Failed -> Trigger 2nd Chance
        setStageAttempts(1);
        sound.playSecondChance();
        showToast('ভুল উত্তর! ২য় সুযোগে আবার চেষ্টা করুন (0 Star)', 'warning');
      } else {
        // 2nd Attempt Failed -> Reveal Solution
        setStageAttempts(2);
        sound.playWrong();
        setRevealModalData({
          correctAnswer: currentStage.correctAnswer,
          explanation: currentStage.explanation
        });
      }
    }
  };

  const proceedNextStage = () => {
    const nextIdx = stageIndex + 1;
    if (nextIdx >= 5) {
      // Level Completed!
      finishLevel();
    } else {
      setStageIndex(nextIdx);
      setStageAttempts(0);
    }
  };

  const finishLevel = () => {
    const totalStarsEarned = stageStars.filter(Boolean).length;
    const isFiveStar = totalStarsEarned === 5;

    let newUnlocked = unlockedLevel;
    const updatedLevelStars = { 
      ...levelStars, 
      [currentLevel.level_id]: Math.max(levelStars[currentLevel.level_id] || 0, totalStarsEarned) 
    };

    if (isFiveStar) {
      sound.playVictory();
      if (currentLevel.level_id >= unlockedLevel) {
        newUnlocked = currentLevel.level_id + 1;
        setUnlockedLevel(newUnlocked);
      }
    }

    setLevelStars(updatedLevelStars);
    saveProgress(newUnlocked, updatedLevelStars);

    setCompletionResult({
      level: currentLevel,
      totalStars: totalStarsEarned,
      isFiveStar: isFiveStar
    });
  };

  const currentStage = stages[stageIndex];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Sticky Header */}
      <Header
        currentLevel={currentLevel}
        stageIndex={stageIndex}
        stageStars={stageStars}
        isAudioMuted={isAudioMuted}
        setIsAudioMuted={setIsAudioMuted}
        onBackToMap={() => setCurrentLevel(null)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col justify-center py-6 px-4">
        {!currentLevel ? (
          <LevelMap
            levels={levels}
            unlockedLevel={unlockedLevel}
            levelStars={levelStars}
            onSelectLevel={(lvl) => handleStartLevel(lvl, false)}
          />
        ) : (
          <div className="w-full max-w-xl mx-auto flex flex-col space-y-6">
            {/* Stage Title & Header Banner */}
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                {currentStage?.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {currentStage?.instruction}
              </p>
            </div>

            {/* Dynamic Stage Render */}
            {currentStage && (
              <>
                {currentStage.type === STAGE_TYPES.FLASHCARD && (
                  <FlashcardStage
                    key={stageIndex}
                    stage={currentStage}
                    onSubmitAnswer={handleAnswerSubmit}
                    isSecondChance={stageAttempts === 1}
                  />
                )}
                {currentStage.type === STAGE_TYPES.MATCHING && (
                  <MatchingStage
                    key={stageIndex}
                    stage={currentStage}
                    onSubmitAnswer={handleAnswerSubmit}
                    isSecondChance={stageAttempts === 1}
                  />
                )}
                {currentStage.type === STAGE_TYPES.DRAG_DROP && (
                  <DragDropStage
                    key={stageIndex}
                    stage={currentStage}
                    onSubmitAnswer={handleAnswerSubmit}
                    isSecondChance={stageAttempts === 1}
                  />
                )}
                {currentStage.type === STAGE_TYPES.TRUE_FALSE && (
                  <TrueFalseSwipeStage
                    key={stageIndex}
                    stage={currentStage}
                    onSubmitAnswer={handleAnswerSubmit}
                    isSecondChance={stageAttempts === 1}
                  />
                )}
                {currentStage.type === STAGE_TYPES.ODD_ONE_OUT && (
                  <OddOneOutStage
                    key={stageIndex}
                    stage={currentStage}
                    onSubmitAnswer={handleAnswerSubmit}
                    isSecondChance={stageAttempts === 1}
                  />
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className={\`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full shadow-xl text-sm font-bold z-50 animate-pop text-white \${
          toastMessage.type === 'success'
            ? 'bg-emerald-600'
            : toastMessage.type === 'warning'
            ? 'bg-amber-500'
            : 'bg-slate-800'
        }\`}>
          {toastMessage.msg}
        </div>
      )}

      {/* Modals */}
      {revealModalData && (
        <AnswerRevealModal
          correctAnswer={revealModalData.correctAnswer}
          explanation={revealModalData.explanation}
          onContinue={() => {
            setRevealModalData(null);
            proceedNextStage();
          }}
        />
      )}

      {completionResult && (
        <CompletionModal
          level={completionResult.level}
          totalStars={completionResult.totalStars}
          isFiveStar={completionResult.isFiveStar}
          onNextLevel={() => {
            const nextLvl = levels.find(l => l.level_id === currentLevel.level_id + 1);
            if (nextLvl) {
              handleStartLevel(nextLvl, false);
            } else {
              setCurrentLevel(null);
            }
          }}
          onRetryLevel={() => {
            handleStartLevel(currentLevel, true); // The Blender: Scramble stage types
          }}
          onBackToMap={() => setCurrentLevel(null)}
        />
      )}

      {isSettingsOpen && (
        <SyncModal
          totalLevels={levels.length}
          onClose={() => setIsSettingsOpen(false)}
          onReloadLevels={loadLevelsData}
        />
      )}
    </div>
  );
}
`);

console.log('All source files written successfully.');
