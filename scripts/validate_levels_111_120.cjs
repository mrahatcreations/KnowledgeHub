const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'data', 'levels');

let totalErrors = 0;
let totalPassed = 0;

for (let lvl = 111; lvl <= 120; lvl++) {
  const fileName = `level_${lvl}.json`;
  const filePath = path.join(targetDir, fileName);

  if (!fs.existsSync(filePath)) {
    console.error(`[ERROR] File missing: ${fileName}`);
    totalErrors++;
    continue;
  }

  let data;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`[ERROR] Invalid JSON in ${fileName}:`, err.message);
    totalErrors++;
    continue;
  }

  // Check level properties
  if (data.level_id !== lvl) {
    console.error(`[ERROR] ${fileName} level_id mismatch: expected ${lvl}, got ${data.level_id}`);
    totalErrors++;
  }
  if (!data.title || typeof data.title !== 'string') {
    console.error(`[ERROR] ${fileName} missing or invalid title`);
    totalErrors++;
  }
  if (!data.unit || typeof data.unit !== 'string') {
    console.error(`[ERROR] ${fileName} missing or invalid unit`);
    totalErrors++;
  }
  if (!data.category || typeof data.category !== 'string') {
    console.error(`[ERROR] ${fileName} missing or invalid category`);
    totalErrors++;
  }
  if (!Array.isArray(data.items) || data.items.length !== 5) {
    console.error(`[ERROR] ${fileName} items must be an array of exactly 5 items, found ${data.items ? data.items.length : 0}`);
    totalErrors++;
    continue;
  }

  data.items.forEach((item, idx) => {
    const itemLabel = `${fileName} -> item[${idx}] (id: ${item.id}, word: "${item.word}")`;

    if (typeof item.id !== 'number') {
      console.error(`[ERROR] ${itemLabel}: invalid id`);
      totalErrors++;
    }
    if (!item.word || typeof item.word !== 'string' || item.word.includes('\\')) {
      console.error(`[ERROR] ${itemLabel}: invalid or dirty word`);
      totalErrors++;
    }
    if (!item.ipa || !item.ipa.startsWith('/') || !item.ipa.endsWith('/')) {
      console.error(`[ERROR] ${itemLabel}: invalid ipa formatting '${item.ipa}'`);
      totalErrors++;
    }
    if (!item.pos || typeof item.pos !== 'string') {
      console.error(`[ERROR] ${itemLabel}: invalid pos`);
      totalErrors++;
    }
    if (!item.meaning || typeof item.meaning !== 'string') {
      console.error(`[ERROR] ${itemLabel}: invalid meaning`);
      totalErrors++;
    }
    if (!Array.isArray(item.synonyms) || item.synonyms.length < 3 || item.synonyms.length > 4) {
      console.error(`[ERROR] ${itemLabel}: synonyms must have 3-4 items, found ${item.synonyms ? item.synonyms.length : 0}`);
      totalErrors++;
    }
    if (!Array.isArray(item.antonyms) || item.antonyms.length < 2 || item.antonyms.length > 4) {
      console.error(`[ERROR] ${itemLabel}: antonyms must have 2-4 items, found ${item.antonyms ? item.antonyms.length : 0}`);
      totalErrors++;
    }
    if (item.raw_synonyms !== item.synonyms.join(', ')) {
      console.error(`[ERROR] ${itemLabel}: raw_synonyms does not match synonyms.join(', ')`);
      totalErrors++;
    }
    if (item.raw_antonyms !== item.antonyms.join(', ')) {
      console.error(`[ERROR] ${itemLabel}: raw_antonyms does not match antonyms.join(', ')`);
      totalErrors++;
    }
    if (!item.sentence || typeof item.sentence !== 'string' || item.sentence.length < 10) {
      console.error(`[ERROR] ${itemLabel}: sentence is too short or invalid`);
      totalErrors++;
    }
    if (!item.sentence_meaning || typeof item.sentence_meaning !== 'string' || item.sentence_meaning.length < 5) {
      console.error(`[ERROR] ${itemLabel}: sentence_meaning is too short or invalid`);
      totalErrors++;
    }
    if (!item.category || item.category !== data.category) {
      console.error(`[ERROR] ${itemLabel}: item.category mismatch`);
      totalErrors++;
    }
    if (!item.unit || typeof item.unit !== 'string') {
      console.error(`[ERROR] ${itemLabel}: missing item.unit`);
      totalErrors++;
    }
  });

  if (totalErrors === 0) {
    console.log(`[PASS] ${fileName} passed all validation checks!`);
    totalPassed++;
  }
}

console.log(`\n========================================`);
console.log(`Validation Complete: ${totalPassed}/10 files passed successfully. Total errors: ${totalErrors}`);
console.log(`========================================`);

if (totalErrors > 0) {
  process.exit(1);
}
