const fs = require('fs');
const path = require('path');
const assert = require('assert');

// 1. Read levels data
const levelsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/levels.json'), 'utf8'));
console.log(`Loaded ${levelsData.levels.length} levels for testing.`);

// 2. Test dynamic import of src/engine/levelCompiler.js and src/engine/index.js
async function runTests() {
  const levelCompiler = await import('../src/engine/levelCompiler.js');
  const engineIndex = await import('../src/engine/index.js');
  const gameEngine = await import('../src/engine/GameEngine.js');

  console.log('--- TEST SUITE 1: Export Verification ---');
  const expectedExports = [
    'STAGE_TYPES',
    'CORE_STAGE_MODES',
    'STAGE_TITLES',
    'STAGE_INSTRUCTIONS',
    'shuffleArray',
    'extractWordList',
    'getRandomDistractors',
    'generateFlashcardStage',
    'generateMatchingStage',
    'generateDragDropStage',
    'generateTrueFalseStage',
    'generateOddOneOutStage',
    'buildStageByType',
    'buildLevelStages',
    'compileLevel'
  ];

  for (const exp of expectedExports) {
    assert.ok(levelCompiler[exp], `levelCompiler.js must export ${exp}`);
    assert.ok(engineIndex[exp], `index.js must export ${exp}`);
    assert.ok(gameEngine[exp], `GameEngine.js must export ${exp}`);
  }
  console.log('? Test Suite 1 Passed: All exports cleanly available across levelCompiler.js, index.js, and GameEngine.js');

  console.log('--- TEST SUITE 2: 10-Stage Structure Verification (Normal Mode) ---');
  const sampleLevel = levelsData.levels[0];
  const stages = levelCompiler.buildLevelStages(sampleLevel, false);

  assert.strictEqual(stages.length, 10, 'Must generate exactly 10 stages per level');
  
  // Verify Stage Numbers and Iteration Metadata
  for (let i = 0; i < 10; i++) {
    assert.strictEqual(stages[i].stageNumber, i + 1, `Stage ${i + 1} must have stageNumber ${i + 1}`);
    assert.strictEqual(stages[i].iteration, i < 5 ? 1 : 2, `Stage ${i + 1} must have iteration ${i < 5 ? 1 : 2}`);
  }

  // Iteration 1 (Stages 1-5)
  const iter1Stages = stages.slice(0, 5);
  const iter1Types = iter1Stages.map(s => s.type);
  assert.strictEqual(new Set(iter1Types).size, 5, 'Iteration 1 must contain all 5 unique stage types');
  assert.strictEqual(iter1Types[0], levelCompiler.STAGE_TYPES.FLASHCARD, 'Iter 1 Stage 1 should be Flashcard');
  assert.strictEqual(iter1Types[1], levelCompiler.STAGE_TYPES.MATCHING, 'Iter 1 Stage 2 should be Matching');
  assert.strictEqual(iter1Types[2], levelCompiler.STAGE_TYPES.DRAG_DROP, 'Iter 1 Stage 3 should be DragDrop');
  assert.strictEqual(iter1Types[3], levelCompiler.STAGE_TYPES.TRUE_FALSE, 'Iter 1 Stage 4 should be TrueFalse');
  assert.strictEqual(iter1Types[4], levelCompiler.STAGE_TYPES.ODD_ONE_OUT, 'Iter 1 Stage 5 should be OddOneOut');

  // Iteration 2 (Stages 6-10)
  const iter2Stages = stages.slice(5, 10);
  const iter2Types = iter2Stages.map(s => s.type);
  assert.strictEqual(new Set(iter2Types).size, 5, 'Iteration 2 must contain all 5 unique stage types');

  // Verify word mapping & swapped stage types
  for (let i = 0; i < 5; i++) {
    const wordIter1 = iter1Stages[i].item;
    const wordIter2 = iter2Stages[i].item;
    assert.strictEqual(wordIter1.id, wordIter2.id, `Word ${i + 1} should match across iterations in normal mode`);
    assert.notStrictEqual(iter1Stages[i].type, iter2Stages[i].type, `Word ${i + 1} MUST have a swapped stage type in Iteration 2`);
  }
  console.log('? Test Suite 2 Passed: 10 Stages successfully verified with dual 5-stage iterations and swapped modes');

  console.log('--- TEST SUITE 3: Cross-Stage Randomization on Retry (isRetry = true) ---');
  let scrambleSeen = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    const retryStages = levelCompiler.buildLevelStages(sampleLevel, true);
    assert.strictEqual(retryStages.length, 10, 'Retry must generate exactly 10 stages');
    
    const rIter1 = retryStages.slice(0, 5);
    const rIter2 = retryStages.slice(5, 10);

    const rIter1Types = rIter1.map(s => s.type);
    const rIter2Types = rIter2.map(s => s.type);

    assert.strictEqual(new Set(rIter1Types).size, 5, 'Retry Iteration 1 must contain all 5 unique stage types');
    assert.strictEqual(new Set(rIter2Types).size, 5, 'Retry Iteration 2 must contain all 5 unique stage types');

    // Build word -> stageType map for Iteration 1
    const iter1WordTypeMap = new Map();
    rIter1.forEach(stg => {
      iter1WordTypeMap.set(stg.item.id, stg.type);
    });

    // Verify that in Iteration 2, NO word receives its Iteration 1 stage type!
    rIter2.forEach(stg => {
      const prevType = iter1WordTypeMap.get(stg.item.id);
      assert.notStrictEqual(stg.type, prevType, `Word ${stg.item.word} received same type (${stg.type}) on retry`);
    });

    if (rIter1Types[0] !== levelCompiler.STAGE_TYPES.FLASHCARD || rIter1[0].item.id !== sampleLevel.items[0].id) {
      scrambleSeen = true;
    }
  }
  assert.ok(scrambleSeen, 'Cross-stage randomization must scramble word order / mode assignments on retry');
  console.log('? Test Suite 3 Passed: Cross-stage randomization guarantees distinct swapped modes per word on retry');

  console.log('--- TEST SUITE 4: Full Dataset Validation (All 201 Levels) ---');
  let totalStagesCompiled = 0;
  for (const lvl of levelsData.levels) {
    const compiled = levelCompiler.buildLevelStages(lvl, false);
    assert.strictEqual(compiled.length, 10, `Level ${lvl.level_id} must have exactly 10 stages`);
    
    compiled.forEach((stage, idx) => {
      assert.ok(stage.title && stage.title.length > 0, `Level ${lvl.level_id} Stage ${idx + 1} must have a title`);
      assert.ok(stage.instruction && stage.instruction.length > 0, `Level ${lvl.level_id} Stage ${idx + 1} must have instruction`);
      assert.ok(stage.explanation && stage.explanation.length > 0, `Level ${lvl.level_id} Stage ${idx + 1} must have explanation`);
      assert.ok(stage.item, `Level ${lvl.level_id} Stage ${idx + 1} must have target item`);
      assert.ok(stage.item.word, `Level ${lvl.level_id} Stage ${idx + 1} item must have word`);
      assert.ok(stage.item.meaning, `Level ${lvl.level_id} Stage ${idx + 1} item must have meaning`);

      if (stage.options) {
        assert.ok(Array.isArray(stage.options) && stage.options.length >= 2, `Stage ${idx + 1} options must be array >= 2`);
      }
      if (stage.type === levelCompiler.STAGE_TYPES.MATCHING) {
        assert.ok(Array.isArray(stage.leftItems) && stage.leftItems.length > 0, 'Matching must have leftItems');
        assert.ok(Array.isArray(stage.rightItems) && stage.rightItems.length > 0, 'Matching must have rightItems');
      }
      totalStagesCompiled++;
    });
  }
  console.log(`? Test Suite 4 Passed: All ${levelsData.levels.length} levels (${totalStagesCompiled} stages) verified clean and error-free`);

  console.log('\n=================================================');
  console.log(' ALL 4 TEST SUITES PASSED WITH 100% SUCCESS!');
  console.log('=================================================');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
