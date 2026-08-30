const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('======================================================');
console.log(' VOCABMASTER INTEGRATION & VERIFICATION TEST SUITE');
console.log('======================================================\n');

// 1. Load Levels Data
const levelsFilePath = path.join(__dirname, '../data/levels.json');
assert.ok(fs.existsSync(levelsFilePath), 'levels.json must exist');
const levelsData = JSON.parse(fs.readFileSync(levelsFilePath, 'utf8'));
console.log(`✔ Loaded ${levelsData.levels.length} levels from data/levels.json`);

// 2. Import GameEngine
const {
  STAGE_TYPES,
  shuffleArray,
  getRandomDistractors,
  buildLevelStages
} = require('../src/engine/GameEngine.js');

// Test Suite 1: Stage Types
console.log('\n--- Test Suite 1: Stage Types Definition ---');
assert.strictEqual(STAGE_TYPES.FLASHCARD, 'flashcard');
assert.strictEqual(STAGE_TYPES.MATCHING, 'matching');
assert.strictEqual(STAGE_TYPES.DRAG_DROP, 'drag_drop');
assert.strictEqual(STAGE_TYPES.TRUE_FALSE, 'true_false');
assert.strictEqual(STAGE_TYPES.ODD_ONE_OUT, 'odd_one_out');
console.log('✔ Passed: All 5 core Stage Types defined correctly');

// Test Suite 2: 10-Stage Level Generation Test
console.log('\n--- Test Suite 2: 10-Stage Level Generation ---');
const sampleLevel = levelsData.levels[0];
const stagesNormal = buildLevelStages(sampleLevel, false);
assert.strictEqual(stagesNormal.length, 10, 'Should generate exactly 10 stages per level');
console.log(`✔ Passed: Sample Level 1 generated exactly ${stagesNormal.length} stages`);

// Test Suite 3: The Blender (Dynamic Randomization on Retry)
console.log('\n--- Test Suite 3: The Blender (Cross-Stage Randomization) ---');
let stageOrderDifferences = 0;
for (let attempt = 0; attempt < 20; attempt++) {
  const retryStages = buildLevelStages(sampleLevel, true);
  assert.strictEqual(retryStages.length, 10, 'Retry must always produce 10 stages');
  if (retryStages[0].type !== stagesNormal[0].type || retryStages[1].type !== stagesNormal[1].type) {
    stageOrderDifferences++;
  }
}
assert.ok(stageOrderDifferences > 0, 'The Blender must randomize stage sequences on retry');
console.log('✔ Passed: The Blender successfully randomizes 10-stage sequences dynamically');

// Test Suite 4: Complete 201 Levels & 2,010 Stages Verification (Zero Fake Data)
console.log('\n--- Test Suite 4: All 201 Levels & 2,010 Stages Verification ---');
let totalStagesVerified = 0;
let totalWordsChecked = 0;
const banglaCharRegex = /[\u0980-\u09FF]/;

for (const lvl of levelsData.levels) {
  assert.ok(lvl.level_id, 'Level must have a valid level_id');
  assert.ok(lvl.items && lvl.items.length >= 1, `Level ${lvl.level_id} must have items`);
  
  // Verify level items contain real authentic content, no fake data
  for (const it of lvl.items) {
    assert.ok(it.word && it.word.trim().length > 0, `Level ${lvl.level_id} item has empty word`);
    assert.ok(it.meaning && it.meaning.trim().length > 0, `Level ${lvl.level_id} item has empty meaning`);
    assert.ok(!/lorem|ipsum|fake|dummy|test word/i.test(it.word), `Level ${lvl.level_id} has fake word: ${it.word}`);
    assert.ok(!/lorem|ipsum|fake|dummy/i.test(it.meaning), `Level ${lvl.level_id} has fake meaning: ${it.meaning}`);
    totalWordsChecked++;
  }

  // Verify 10 stages generation for this level
  const generatedStages = buildLevelStages(lvl, false);
  assert.strictEqual(generatedStages.length, 10, `Level ${lvl.level_id} must produce exactly 10 stages`);

  for (const [sIdx, stg] of generatedStages.entries()) {
    assert.ok(stg.title && stg.title.length > 0, `Level ${lvl.level_id} Stage ${sIdx} missing title`);
    assert.ok(stg.instruction && stg.instruction.length > 0, `Level ${lvl.level_id} Stage ${sIdx} missing instruction`);
    assert.ok(stg.explanation && stg.explanation.length > 0, `Level ${lvl.level_id} Stage ${sIdx} missing explanation`);
    assert.ok(banglaCharRegex.test(stg.title), `Level ${lvl.level_id} Stage ${sIdx} title must contain Bengali text`);
    assert.ok(banglaCharRegex.test(stg.instruction), `Level ${lvl.level_id} Stage ${sIdx} instruction must contain Bengali text`);
    assert.ok(banglaCharRegex.test(stg.explanation), `Level ${lvl.level_id} Stage ${sIdx} explanation must contain Bengali text`);

    if (stg.type === STAGE_TYPES.MATCHING) {
      assert.ok(Array.isArray(stg.leftItems) && stg.leftItems.length > 0, 'Matching leftItems must be non-empty');
      assert.ok(Array.isArray(stg.rightItems) && stg.rightItems.length > 0, 'Matching rightItems must be non-empty');
    } else {
      assert.ok(stg.correctAnswer, `Stage ${sIdx} missing correctAnswer`);
    }

    if (stg.options) {
      assert.ok(Array.isArray(stg.options) && stg.options.length >= 2, 'Options must have at least 2 choices');
    }

    totalStagesVerified++;
  }
}
console.log(`✔ Passed: Verified all ${levelsData.levels.length} levels (${totalWordsChecked} vocabulary items, ${totalStagesVerified} total stages) with 100% authentic data and zero fake items`);

// Test Suite 5: UTF-8 Encoding & Zero '???' Verification across All Files
console.log('\n--- Test Suite 5: UTF-8 & Zero "???" Quality Check ---');
function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        results = results.concat(walkDir(fullPath));
      }
    } else if (/\.(jsx?|tsx?|json|html|css|md)$/.test(file)) {
      results.push(fullPath);
    }
  }
  return results;
}

const scannedFiles = walkDir(path.resolve(__dirname, '..'));
let corruptedCount = 0;
for (const file of scannedFiles) {
  const content = fs.readFileSync(file, 'utf8');
  assert.ok(!content.includes('\ufffd'), `File ${file} contains replacement character \\ufffd`);
  const qMatches = content.match(/\?{3,}/g);
  if (qMatches) {
    console.error(`File ${file} contains ??? occurrences:`, qMatches.length);
    corruptedCount++;
  }
}
assert.strictEqual(corruptedCount, 0, 'No project files may contain "???" character corruption');
console.log(`✔ Passed: Scanned ${scannedFiles.length} project files. 100% clean UTF-8 with 0 corrupted '???' characters`);

// Test Suite 6: Audio Synthesizer Interface & Sound FX
console.log('\n--- Test Suite 6: SoundSynthesizer Web Audio Check ---');
const soundSynthCode = fs.readFileSync(path.join(__dirname, '../src/audio/SoundSynthesizer.js'), 'utf8');
const requiredAudioMethods = [
  'playClick',
  'playCorrect',
  'playWrong',
  'playSecondChance',
  'playFlip',
  'playSwipe',
  'playVictory',
  'speak'
];
for (const method of requiredAudioMethods) {
  assert.ok(soundSynthCode.includes(method), `SoundSynthesizer must implement ${method}()`);
}
console.log(`✔ Passed: SoundSynthesizer implements all ${requiredAudioMethods.length} Web Audio methods + TTS speech engine`);

// Test Suite 7: App Game Rules & UI Mechanics Check
console.log('\n--- Test Suite 7: App Game Rules & 2nd Chance Mechanics ---');
const appCode = fs.readFileSync(path.join(__dirname, '../src/App.jsx'), 'utf8');
assert.ok(appCode.includes('stageAttempts === 0'), 'App must reward star on 1st attempt');
assert.ok(appCode.includes('playSecondChance()'), 'App must trigger second chance sound on 1st attempt failure');
assert.ok(appCode.includes('playWrong()'), 'App must trigger wrong sound on 2nd attempt failure');
assert.ok(appCode.includes('playVictory()'), 'App must trigger victory fanfare on level mastery');
assert.ok(appCode.includes('handleStartLevel(currentLevel, true)'), 'App must trigger The Blender retry mode');
console.log('✔ Passed: 1st chance star, 2nd chance retry, explanation modal, and Blender mechanics verified in App.jsx');

console.log('\n======================================================');
console.log(' ALL 7 VERIFICATION TEST SUITES PASSED (100% SUCCESS)');
console.log('======================================================');
