import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildLevelStages } from '../src/engine/levelCompiler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.join(__dirname, '..', 'public', 'data', 'levels');

console.log('=== VALIDATING LEVELS 91 to 100 ===\n');

let totalErrors = 0;

for (let lvlId = 91; lvlId <= 100; lvlId++) {
  const fileName = `level_${lvlId}.json`;
  const filePath = path.join(targetDir, fileName);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${fileName}`);
    totalErrors++;
    continue;
  }

  let data;
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`❌ JSON Parse Error in ${fileName}:`, err.message);
    totalErrors++;
    continue;
  }

  if (data.level_id !== lvlId) {
    console.error(`❌ ${fileName}: level_id mismatch (expected ${lvlId}, got ${data.level_id})`);
    totalErrors++;
  }

  if (!Array.isArray(data.items) || data.items.length !== 5) {
    console.error(`❌ ${fileName}: expected 5 items, found ${data.items ? data.items.length : 0}`);
    totalErrors++;
    continue;
  }

  data.items.forEach((item, idx) => {
    const prefix = `${fileName} [Item ${idx + 1} - ${item.word || 'UNKNOWN'}]:`;

    if (typeof item.id !== 'number') {
      console.error(`❌ ${prefix} item.id must be a number`);
      totalErrors++;
    }
    if (!item.word || typeof item.word !== 'string') {
      console.error(`❌ ${prefix} missing or invalid word`);
      totalErrors++;
    }
    if (!item.ipa || typeof item.ipa !== 'string' || !item.ipa.startsWith('/') || !item.ipa.endsWith('/')) {
      console.error(`❌ ${prefix} missing or invalid ipa format (${item.ipa})`);
      totalErrors++;
    }
    if (!item.pos || typeof item.pos !== 'string') {
      console.error(`❌ ${prefix} missing or invalid pos`);
      totalErrors++;
    }
    if (!item.meaning || typeof item.meaning !== 'string') {
      console.error(`❌ ${prefix} missing or invalid meaning`);
      totalErrors++;
    }
    if (!Array.isArray(item.synonyms) || item.synonyms.length < 3 || item.synonyms.length > 4) {
      console.error(`❌ ${prefix} synonyms must have 3-4 items, found ${item.synonyms ? item.synonyms.length : 0}`);
      totalErrors++;
    }
    if (!Array.isArray(item.antonyms) || item.antonyms.length < 2 || item.antonyms.length > 4) {
      console.error(`❌ ${prefix} antonyms must have 2-4 items, found ${item.antonyms ? item.antonyms.length : 0}`);
      totalErrors++;
    }
    if (!item.raw_synonyms || typeof item.raw_synonyms !== 'string') {
      console.error(`❌ ${prefix} missing raw_synonyms string`);
      totalErrors++;
    }
    if (!item.raw_antonyms || typeof item.raw_antonyms !== 'string') {
      console.error(`❌ ${prefix} missing raw_antonyms string`);
      totalErrors++;
    }
    if (!item.sentence || typeof item.sentence !== 'string') {
      console.error(`❌ ${prefix} missing sentence`);
      totalErrors++;
    }
    if (!item.sentence_meaning || typeof item.sentence_meaning !== 'string') {
      console.error(`❌ ${prefix} missing sentence_meaning`);
      totalErrors++;
    }
  });

  // Test levelCompiler engine integration
  try {
    const stages = buildLevelStages(data, false);
    if (!Array.isArray(stages) || stages.length !== 10) {
      console.error(`❌ ${fileName}: buildLevelStages produced ${stages ? stages.length : 0} stages instead of 10`);
      totalErrors++;
    }
  } catch (stageErr) {
    console.error(`❌ ${fileName}: buildLevelStages threw error:`, stageErr.message);
    totalErrors++;
  }

  console.log(`✅ ${fileName} passed all validation checks (5 items, 10 compiled stages).`);
}

console.log('\n======================================');
if (totalErrors === 0) {
  console.log('🎉 ALL 10 LEVEL FILES (91-100) FULLY VALIDATED WITH ZERO ERRORS!');
} else {
  console.error(`💥 VALIDATION FAILED WITH ${totalErrors} ERROR(S).`);
  process.exit(1);
}
