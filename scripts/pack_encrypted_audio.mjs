// scripts/pack_encrypted_audio.mjs
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import crypto from 'crypto';

const AUDIO_DIR = path.resolve('public/audio');
const OUTPUT_PACK = path.resolve('public/data/voice_pack_v1.khpack');
const OUTPUT_META = path.resolve('public/data/voice_pack_meta.json');

const PASSPHRASE = 'KnowledgeHubSecureAudioPackKey2026!';
// Derive fixed 32-byte AES-256 key using SHA-256
const CIPHER_KEY = crypto.createHash('sha256').update(PASSPHRASE).digest();

console.log('🚀 Starting Knowledge Hub Audio Pack generation...');

if (!fs.existsSync(AUDIO_DIR)) {
  console.error('Audio directory not found:', AUDIO_DIR);
  process.exit(1);
}

const files = fs.readdirSync(AUDIO_DIR).filter(f => f.endsWith('.opus') || f.endsWith('.mp3'));
console.log(`📦 Found ${files.length} audio files in ${AUDIO_DIR}`);

const index = {};
const chunks = [];
let currentOffset = 0;

for (const file of files) {
  const filePath = path.join(AUDIO_DIR, file);
  const data = fs.readFileSync(filePath);
  index[file] = [currentOffset, data.length];
  chunks.push(data);
  currentOffset += data.length;
}

const payloadBuffer = Buffer.concat(chunks);
const indexJsonBuffer = Buffer.from(JSON.stringify(index), 'utf8');

// Container Format:
// [4 bytes magic: 'KHPK']
// [2 bytes version: 1]
// [2 bytes cipherType: 1 (AES-256-CTR)]
// [4 bytes indexLength]
// [4 bytes totalFiles]
// [index JSON bytes]
// [payload bytes]

const header = Buffer.alloc(16);
header.write('KHPK', 0, 4, 'ascii');
header.writeUInt16LE(1, 4); // version
header.writeUInt16LE(1, 6); // cipherType (AES-256-CTR)
header.writeUInt32LE(indexJsonBuffer.length, 8);
header.writeUInt32LE(files.length, 12);

const uncompressedRaw = Buffer.concat([header, indexJsonBuffer, payloadBuffer]);
const rawSizeMB = (uncompressedRaw.length / (1024 * 1024)).toFixed(2);
console.log(`📊 Uncompressed Raw Audio Archive: ${rawSizeMB} MB`);

// 1. High-efficiency Zlib Gzip level 9 compression
console.log('🔄 Compressing audio container (Gzip Level 9)...');
const compressed = zlib.gzipSync(uncompressedRaw, { level: 9 });
const compressedMB = (compressed.length / (1024 * 1024)).toFixed(2);
console.log(`📉 Compressed Size: ${compressedMB} MB`);

// 2. AES-256-CTR encryption with 16-byte random IV
console.log('🔒 Encrypting container with AES-256-CTR...');
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv('aes-256-ctr', CIPHER_KEY, iv);
const encryptedPayload = Buffer.concat([cipher.update(compressed), cipher.final()]);

// Final file structure: [16 bytes IV] + [Encrypted Compressed Stream]
const finalPack = Buffer.concat([iv, encryptedPayload]);
const finalSizeMB = (finalPack.length / (1024 * 1024)).toFixed(2);

// 3. Compute SHA-256 Checksum
const sha256 = crypto.createHash('sha256').update(finalPack).digest('hex');

fs.mkdirSync(path.dirname(OUTPUT_PACK), { recursive: true });
fs.writeFileSync(OUTPUT_PACK, finalPack);

// 4. Save metadata JSON for client versioning & verification
const meta = {
  version: 1,
  total_files: files.length,
  raw_size_bytes: uncompressedRaw.length,
  raw_size_mb: Number(rawSizeMB),
  pack_size_bytes: finalPack.length,
  pack_size_mb: Number(finalSizeMB),
  checksum_sha256: sha256,
  algorithm: 'AES-256-CTR + GZIP-9',
  generated_at: new Date().toISOString()
};

fs.writeFileSync(OUTPUT_META, JSON.stringify(meta, null, 2));

console.log(`✅ SUCCESS: Created ${OUTPUT_PACK}`);
console.log(`📦 Final Pack Size: ${finalSizeMB} MB | Checksum: ${sha256.substring(0, 12)}...`);
console.log(`📄 Metadata saved to ${OUTPUT_META}`);
