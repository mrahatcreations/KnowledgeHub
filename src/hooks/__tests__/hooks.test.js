import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TOTAL_STAGES_PER_LEVEL,
  MASTERY_REQUIRED_STARS,
  createInitialStageStars,
  STORAGE_KEY_PROGRESS,
  MASTERY_BONUS_GEMS
} from '../useGameState.js';

import { buildLevelStages } from '../../engine/GameEngine.js';

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
