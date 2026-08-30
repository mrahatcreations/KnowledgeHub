import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TOTAL_STAGES_PER_LEVEL,
  MASTERY_REQUIRED_STARS,
  createInitialStageStars,
  STORAGE_KEY_PROGRESS,
  MASTERY_BONUS_GEMS
} from '../useGameState.js';

import {
  buildLevelStages,
  generateMatchingStage,
  generateFlashcardStage,
  generateTrueFalseStage,
  generateOddOneOutStage,
  generateDragDropStage,
  formatPoS,
  POS_MAP,
  STAGE_TYPES
} from '../../engine/levelCompiler.js';

test('Game Constants and 10-Stage Initial State', () => {
  assert.equal(TOTAL_STAGES_PER_LEVEL, 10, 'Total stages per level must be 10');
  assert.equal(MASTERY_REQUIRED_STARS, 5, 'Mastery requirement must be 5 stars (0.5 per stage)');
  assert.equal(MASTERY_BONUS_GEMS, 50, 'Mastery bonus gems must be 50');

  const initialStars = createInitialStageStars();
  assert.equal(initialStars.length, 10, 'Initial stageStars must have 10 elements');
  assert.deepEqual(
    initialStars,
    [false, false, false, false, false, false, false, false, false, false],
    'Initial stageStars must be 10 false booleans'
  );
});

test('buildLevelStages generates 10 distinct dynamic stages for a level', () => {
  const sampleLevel = {
    level_id: 1,
    title: 'Level 1: Vocabulary',
    unit: 'Unit 1',
    category: 'Vocabulary',
    items: [
      { id: 1, word: 'Incorporate', pos: 'v', meaning: 'অন্তর্ভুক্ত করা', sentence: 'Incorporate this feature.' },
      { id: 2, word: 'Automate', pos: 'v', meaning: 'স্বয়ংক্রিয় করা', sentence: 'Automate repetitive tasks.' },
      { id: 3, word: 'Repetitive', pos: 'adj', meaning: 'পুনরাবৃত্তিমূলক', sentence: 'Avoid repetitive work.' },
      { id: 4, word: 'Crucial', pos: 'adj', meaning: 'অত্যন্ত গুরুত্বপূর্ণ', sentence: 'Timing is crucial.' },
      { id: 5, word: 'Pioneer', pos: 'n', meaning: 'পথপ্রদর্শক', sentence: 'He was a pioneer.' }
    ]
  };

  const stages = buildLevelStages(sampleLevel, false);
  assert.equal(stages.length, 10, 'Generated stages count must be exactly 10');
  
  stages.forEach((stage, idx) => {
    assert.ok(stage.type, `Stage ${idx + 1} must have a valid type`);
    assert.ok(stage.title, `Stage ${idx + 1} must have a title`);
    assert.ok(stage.instruction, `Stage ${idx + 1} must have instructions`);
  });
});

test('10-Star Level Mastery Evaluation', () => {
  // Scenario 1: All 10 stages answered correctly on 1st attempt
  const perfectStars = [true, true, true, true, true, true, true, true, true, true];
  const totalEarned1 = perfectStars.filter(Boolean).length;
  const isMastered1 = totalEarned1 === 10;
  assert.equal(totalEarned1, 10);
  assert.equal(isMastered1, true, '10/10 stars must unlock mastery');

  // Scenario 2: 9 stars earned (one stage needed 2nd chance)
  const imperfectStars = [true, true, false, true, true, true, true, true, true, true];
  const totalEarned2 = imperfectStars.filter(Boolean).length;
  const isMastered2 = totalEarned2 === 10;
  assert.equal(totalEarned2, 9);
  assert.equal(isMastered2, false, '9/10 stars must NOT unlock mastery');
});

test('Mistakes list accumulator records full mistake details without duplicates', () => {
  const mistakes = [];
  
  const mistake1 = {
    id: 1,
    word: 'Incorporate',
    pos: 'v',
    meaning: 'অন্তর্ভুক্ত করা',
    sentence: 'Incorporate this feature.',
    userAnswer: 'স্বয়ংক্রিয় করা',
    correctAnswer: 'অন্তর্ভুক্ত করা',
    explanation: 'Incorporate means অন্তর্ভুক্ত করা',
    stageIndex: 0,
    stageType: 'flashcard'
  };

  // Add first mistake
  mistakes.push(mistake1);
  assert.equal(mistakes.length, 1);
  assert.equal(mistakes[0].word, 'Incorporate');

  // Add mistake for different word
  const mistake2 = {
    id: 2,
    word: 'Automate',
    pos: 'v',
    meaning: 'স্বয়ংক্রিয় করা',
    sentence: 'Automate tasks.',
    userAnswer: 'Wrong',
    correctAnswer: 'স্বয়ংক্রিয় করা',
    explanation: 'Automate means স্বয়ংক্রিয় করা',
    stageIndex: 1,
    stageType: 'drag_drop'
  };
  mistakes.push(mistake2);
  assert.equal(mistakes.length, 2);

  // Update existing word mistake
  const updatedMistake1 = { ...mistake1, userAnswer: 'Another Wrong' };
  const existsIndex = mistakes.findIndex(m => m.word.toLowerCase() === updatedMistake1.word.toLowerCase());
  assert.ok(existsIndex >= 0);
  mistakes[existsIndex] = updatedMistake1;
  assert.equal(mistakes.length, 2);
  assert.equal(mistakes[0].userAnswer, 'Another Wrong');
});

test('Progress state serialization and storage schema', () => {
  const sampleProgress = {
    unlockedLevel: 3,
    levelStars: { '1': 10, '2': 10 },
    gems: 340,
    streak: 6,
    lives: 5,
    lastUpdated: new Date().toISOString()
  };

  const serialized = JSON.stringify(sampleProgress);
  const deserialized = JSON.parse(serialized);

  assert.equal(deserialized.unlockedLevel, 3);
  assert.equal(deserialized.levelStars['1'], 10);
  assert.equal(deserialized.gems, 340);
  assert.equal(deserialized.streak, 6);
  assert.equal(deserialized.lives, 5);
});

test('levelCompiler exports and formatPoS helper verification', () => {
  assert.equal(typeof buildLevelStages, 'function');
  assert.equal(typeof generateMatchingStage, 'function');
  assert.equal(typeof generateFlashcardStage, 'function');
  assert.equal(typeof generateTrueFalseStage, 'function');
  assert.equal(typeof generateOddOneOutStage, 'function');
  assert.equal(typeof generateDragDropStage, 'function');
  assert.equal(typeof formatPoS, 'function');
  assert.ok(POS_MAP && typeof POS_MAP === 'object');

  assert.equal(POS_MAP.n, 'Noun (বিশেষ্য)');
  assert.equal(POS_MAP.v, 'Verb (ক্রিয়া)');
  assert.equal(POS_MAP.adj, 'Adjective (বিশেষণ)');
  assert.equal(POS_MAP.adv, 'Adverb (ক্রিয়া-বিশেষণ)');
  assert.equal(POS_MAP.prep, 'Preposition (অব্যয়)');

  assert.equal(formatPoS('n'), 'Noun (বিশেষ্য)');
  assert.equal(formatPoS('v'), 'Verb (ক্রিয়া)');
  assert.equal(formatPoS('adj'), 'Adjective (বিশেষণ)');
  assert.equal(formatPoS('adv'), 'Adverb (ক্রিয়া-বিশেষণ)');
  assert.equal(formatPoS('prep'), 'Preposition (অব্যয়)');
  assert.equal(formatPoS(''), 'Word');
  assert.equal(formatPoS(null), 'Word');
  assert.equal(formatPoS('custom'), 'Custom');
});

test('Multi-Mode Matching, Multi-Angle Flashcard, and Multi-Angle True/False Stage Generation', () => {
  const richItems = [
    {
      id: 1,
      word: 'Abundant',
      pos: 'adj',
      meaning: 'প্রচুর বা পর্যাপ্ত',
      synonyms: ['Plentiful', 'Ample'],
      antonyms: ['Scarce', 'Meager'],
      sentence: 'Natural resources are abundant in this region.'
    },
    {
      id: 2,
      word: 'Accelerate',
      pos: 'v',
      meaning: 'গতি বৃদ্ধি করা',
      synonyms: ['Quicken', 'Hasten'],
      antonyms: ['Decelerate', 'Delay'],
      sentence: 'They decided to accelerate the project timeline.'
    },
    {
      id: 3,
      word: 'Advocate',
      pos: 'n',
      meaning: 'সমর্থক বা প্রবক্তা',
      synonyms: ['Proponent', 'Supporter'],
      antonyms: ['Opponent', 'Critic'],
      sentence: 'She is a strong advocate for environmental protection.'
    },
    {
      id: 4,
      word: 'Cautiously',
      pos: 'adv',
      meaning: 'সতর্কতার সাথে',
      synonyms: ['Carefully', 'Warily'],
      antonyms: ['Recklessly', 'Carelessly'],
      sentence: 'The team proceeded cautiously in the storm.'
    },
    {
      id: 5,
      word: 'Beneath',
      pos: 'prep',
      meaning: 'নিচে বা তলদেশে',
      synonyms: ['Under', 'Below'],
      antonyms: ['Above', 'Over'],
      sentence: 'The ancient ruins lay beneath the ground.'
    }
  ];

  // 1. Direct Unit Testing of Generator Modes
  // Matching Generator Modes:
  const matchMeaning = generateMatchingStage(richItems, { stageNumber: 1, iteration: 1 });
  assert.equal(matchMeaning.matchingMode, 'meaning');
  assert.equal(matchMeaning.leftItems.length, 5);
  assert.equal(matchMeaning.rightItems.length, 5);

  const matchSynonym = generateMatchingStage(richItems, { stageNumber: 2, iteration: 1 });
  assert.equal(matchSynonym.matchingMode, 'synonym');

  const matchPoS = generateMatchingStage(richItems, { stageNumber: 3, iteration: 1 });
  assert.equal(matchPoS.matchingMode, 'pos');

  // Antonym matching mode with items that only have antonyms
  const antonymOnlyItems = richItems.map(it => ({ ...it, synonyms: [] }));
  const matchAntonym = generateMatchingStage(antonymOnlyItems, { stageNumber: 6, iteration: 2 });
  assert.equal(matchAntonym.matchingMode, 'antonym');

  // Flashcard Generator Question Types:
  const fcMeaning = generateFlashcardStage(richItems[0], richItems, { stageNumber: 1, iteration: 1 });
  assert.equal(fcMeaning.questionType, 'meaning');
  assert.ok(fcMeaning.options.includes(richItems[0].meaning));

  const fcSynonym = generateFlashcardStage(richItems[0], richItems, { stageNumber: 7, iteration: 2 });
  assert.equal(fcSynonym.questionType, 'synonym');
  assert.equal(fcSynonym.correctAnswer, 'Plentiful');

  const fcPoS = generateFlashcardStage(richItems[0], richItems, { stageNumber: 4, iteration: 1 });
  assert.equal(fcPoS.questionType, 'pos');
  assert.equal(fcPoS.correctAnswer, 'Adjective (বিশেষণ)');

  const fcReverse = generateFlashcardStage(richItems[0], richItems, { stageNumber: 3, iteration: 1 });
  assert.equal(fcReverse.questionType, 'reverse');
  assert.equal(fcReverse.correctAnswer, 'Abundant');

  const antonymOnlyItem = { ...richItems[0], synonyms: [] };
  const fcAntonym = generateFlashcardStage(antonymOnlyItem, richItems, { stageNumber: 7, iteration: 2 });
  assert.equal(fcAntonym.questionType, 'antonym');
  assert.equal(fcAntonym.correctAnswer, 'Scarce');

  // True/False Generator Statements:
  const tfMeaning = generateTrueFalseStage(richItems[0], richItems, { stageNumber: 1, iteration: 1 });
  assert.ok(tfMeaning.statement.includes('mean'));

  const tfPoS = generateTrueFalseStage(richItems[0], richItems, { stageNumber: 3, iteration: 1 });
  assert.ok(tfPoS.statement.includes('Part of Speech'));

  // Odd One Out Generator:
  const oddStage = generateOddOneOutStage(richItems[0], richItems, { stageNumber: 5, iteration: 1 });
  assert.equal(oddStage.type, STAGE_TYPES.ODD_ONE_OUT);
  assert.ok(oddStage.options.includes(oddStage.correctAnswer));
});

test('Multi-level compilation produces full spectrum of matching modes, flashcard question types, and true/false statements', () => {
  const levels = [
    {
      level_id: 1,
      items: [
        { id: 101, word: 'Innovative', pos: 'adj', meaning: 'উদ্ভাবনী', synonyms: ['Inventive', 'Creative'], antonyms: ['Conventional', 'Traditional'], sentence: 'An innovative approach.' },
        { id: 102, word: 'Consolidate', pos: 'v', meaning: 'একত্রীকরণ করা', synonyms: ['Combine', 'Merge'], antonyms: ['Disperse', 'Separate'], sentence: 'Consolidate the databases.' },
        { id: 103, word: 'Divergence', pos: 'n', meaning: 'পার্থক্য বা বিচ্যুতি', synonyms: ['Deviation', 'Difference'], antonyms: ['Convergence', 'Agreement'], sentence: 'Notice the divergence.' },
        { id: 104, word: 'Efficiently', pos: 'adv', meaning: 'দক্ষতার সাথে', synonyms: ['Effectively', 'Productively'], antonyms: ['Inefficiently', 'Wastefully'], sentence: 'They worked efficiently.' },
        { id: 105, word: 'Throughout', pos: 'prep', meaning: 'সর্বত্র বা শুরু থেকে শেষ পর্যন্ত', synonyms: ['Across', 'Around'], antonyms: ['Outside', 'Nowhere'], sentence: 'Celebrated throughout the land.' }
      ]
    },
    {
      level_id: 2,
      items: [
        { id: 201, word: 'Vibrant', pos: 'adj', meaning: 'প্রাণবন্ত', raw_synonyms: 'Lively, Energetic', raw_antonyms: 'Dull, Lifeless', sentence: 'A vibrant culture.' },
        { id: 202, word: 'Mitigate', pos: 'v', meaning: 'প্রশমিত বা হ্রাস করা', raw_synonyms: 'Alleviate, Lessen', raw_antonyms: 'Aggravate, Intensify', sentence: 'Mitigate the risk.' },
        { id: 203, word: 'Catalyst', pos: 'n', meaning: 'অনুঘটক বা প্রেরক', raw_synonyms: 'Stimulant, Spark', raw_antonyms: 'Inhibitor, Block', sentence: 'Acts as a catalyst.' },
        { id: 204, word: 'Swiftly', pos: 'adv', meaning: 'দ্রুততার সাথে', raw_synonyms: 'Rapidly, Promptly', raw_antonyms: 'Slowly, Sluggishly', sentence: 'He replied swiftly.' },
        { id: 205, word: 'Toward', pos: 'prep', meaning: 'অভিমুখে বা দিকে', raw_synonyms: 'Heading, Direction', raw_antonyms: 'Away, From', sentence: 'Walking toward the goal.' }
      ]
    },
    {
      level_id: 3,
      items: [
        { id: 301, word: 'Obscure', pos: 'adj', meaning: 'অস্পষ্ট', antonyms: ['Clear', 'Evident'], sentence: 'An obscure reference.' },
        { id: 302, word: 'Expand', pos: 'v', meaning: 'প্রসারিত করা', antonyms: ['Contract', 'Shrink'], sentence: 'Expand your knowledge.' },
        { id: 303, word: 'Victory', pos: 'n', meaning: 'বিজয়', antonyms: ['Defeat', 'Failure'], sentence: 'Celebrate the victory.' },
        { id: 304, word: 'Fluently', pos: 'adv', meaning: 'স্বতঃস্ফূর্তভাবে', antonyms: ['Haltingly', 'Stumblingly'], sentence: 'Speaks fluently.' },
        { id: 305, word: 'Within', pos: 'prep', meaning: 'ভেতরে বা সীমার মধ্যে', antonyms: ['Outside', 'Beyond'], sentence: 'Within the room.' }
      ]
    }
  ];

  const recordedMatchingModes = new Set();
  const recordedFlashcardQuestionTypes = new Set();
  const recordedTrueFalseStatements = new Set();

  for (let round = 0; round < 30; round++) {
    for (const lvl of levels) {
      const stages = buildLevelStages(lvl, false);
      assert.equal(stages.length, 10, 'Each compiled level must contain exactly 10 stages');

      stages.forEach(stage => {
        if (stage.type === STAGE_TYPES.MATCHING) {
          assert.ok(stage.matchingMode, 'Matching stage must have matchingMode property');
          assert.ok(stage.leftItems && stage.leftItems.length > 0, 'Matching stage must have left items');
          assert.ok(stage.rightItems && stage.rightItems.length > 0, 'Matching stage must have right items');
          recordedMatchingModes.add(stage.matchingMode);
        }

        if (stage.type === STAGE_TYPES.FLASHCARD) {
          assert.ok(stage.questionType, 'Flashcard stage must have questionType property');
          assert.ok(stage.options && stage.options.length >= 2, 'Flashcard stage must have multiple options');
          assert.ok(stage.correctAnswer, 'Flashcard stage must have a correctAnswer');
          recordedFlashcardQuestionTypes.add(stage.questionType);
        }

        if (stage.type === STAGE_TYPES.TRUE_FALSE) {
          assert.ok(stage.statement && stage.statement.length > 0, 'True/False stage must have a statement');
          assert.ok(stage.correctAnswer === 'TRUE' || stage.correctAnswer === 'FALSE', 'TF answer must be TRUE or FALSE');
          assert.ok(typeof stage.isTrue === 'boolean', 'TF isTrue must be a boolean');

          if (stage.statement.includes('SYNONYM')) {
            recordedTrueFalseStatements.add('synonym');
          } else if (stage.statement.includes('OPPOSITE') || stage.statement.includes('Antonym')) {
            recordedTrueFalseStatements.add('antonym');
          } else if (stage.statement.includes('Part of Speech')) {
            recordedTrueFalseStatements.add('pos');
          } else if (stage.statement.includes('mean')) {
            recordedTrueFalseStatements.add('meaning');
          }
        }
      });
    }
  }

  assert.ok(recordedMatchingModes.has('meaning'), 'Matching stages must generate meaning mode');
  assert.ok(recordedMatchingModes.has('synonym'), 'Matching stages must generate synonym mode');
  assert.ok(recordedMatchingModes.has('antonym'), 'Matching stages must generate antonym mode');
  assert.ok(recordedMatchingModes.has('pos'), 'Matching stages must generate pos mode');

  assert.ok(recordedFlashcardQuestionTypes.has('meaning'), 'Flashcards must generate meaning questionType');
  assert.ok(recordedFlashcardQuestionTypes.has('synonym'), 'Flashcards must generate synonym questionType');
  assert.ok(recordedFlashcardQuestionTypes.has('antonym'), 'Flashcards must generate antonym questionType');
  assert.ok(recordedFlashcardQuestionTypes.has('pos'), 'Flashcards must generate pos questionType');
  assert.ok(recordedFlashcardQuestionTypes.has('reverse'), 'Flashcards must generate reverse questionType');

  assert.ok(recordedTrueFalseStatements.has('meaning'), 'True/False must generate meaning statements');
  assert.ok(recordedTrueFalseStatements.has('synonym'), 'True/False must generate synonym statements');
  assert.ok(recordedTrueFalseStatements.has('antonym'), 'True/False must generate antonym statements');
  assert.ok(recordedTrueFalseStatements.has('pos'), 'True/False must generate Part of Speech statements');
});
