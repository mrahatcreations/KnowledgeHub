// src/audio/BinaryAudioPackEngine.js
// High-performance client-side decryption & unpacking engine for .khpack binary containers

const PASSPHRASE = 'KnowledgeHubSecureAudioPackKey2026!';
const CACHE_NAME = 'vocabmaster-audio-pack-v1';
const LOCAL_AUDIO_BASE = '/audio';

/**
 * Derives a 32-byte AES-CTR CryptoKey from PASSPHRASE using SHA-256
 */
async function getCryptoKey() {
  const enc = new TextEncoder();
  const keyBytes = await crypto.subtle.digest('SHA-256', enc.encode(PASSPHRASE));
  return crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-CTR' },
    false,
    ['decrypt']
  );
}

/**
 * Decompresses a gzip-compressed ArrayBuffer using native DecompressionStream
 */
async function decompressGzip(compressedBuffer) {
  if (typeof DecompressionStream !== 'undefined') {
    const ds = new DecompressionStream('gzip');
    const writer = ds.writable.getWriter();
    writer.write(new Uint8Array(compressedBuffer));
    writer.close();

    const response = new Response(ds.readable);
    return await response.arrayBuffer();
  }
  throw new Error('DecompressionStream is not supported in this environment.');
}

export class BinaryAudioPackEngine {
  /**
   * Decrypts and unpacks a .khpack ArrayBuffer, storing all audio blobs in CacheStorage
   * @param {ArrayBuffer} packBuffer - Raw .khpack binary buffer
   * @param {Function} onProgress - Optional progress callback ({ extracted, total, percent })
   */
  static async unpack(packBuffer, onProgress) {
    if (!packBuffer || packBuffer.byteLength < 32) {
      throw new Error('Invalid or corrupted .khpack file.');
    }

    // 1. Extract 16-byte IV and encrypted ciphertext
    const iv = new Uint8Array(packBuffer.slice(0, 16));
    const ciphertext = packBuffer.slice(16);

    // 2. Decrypt with AES-CTR
    const key = await getCryptoKey();
    const decryptedCompressedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-CTR',
        counter: iv,
        length: 128
      },
      key,
      ciphertext
    );

    // 3. Decompress Gzip Stream
    const uncompressedBuffer = await decompressGzip(decryptedCompressedBuffer);
    const view = new DataView(uncompressedBuffer);

    // 4. Validate Header
    // Magic 'KHPK' = 0x4B 0x48 0x50 0x4B
    const magic = String.fromCharCode(
      view.getUint8(0),
      view.getUint8(1),
      view.getUint8(2),
      view.getUint8(3)
    );

    if (magic !== 'KHPK') {
      throw new Error(`Invalid pack format magic: ${magic}`);
    }

    const version = view.getUint16(4, true);
    const cipherType = view.getUint16(6, true);
    const indexLength = view.getUint32(8, true);
    const totalFiles = view.getUint32(12, true);

    // 5. Parse Index JSON
    const indexBytes = new Uint8Array(uncompressedBuffer, 16, indexLength);
    const indexJsonStr = new TextDecoder('utf-8').decode(indexBytes);
    const indexMap = JSON.parse(indexJsonStr);

    const payloadOffset = 16 + indexLength;
    const payloadBytes = new Uint8Array(uncompressedBuffer, payloadOffset);

    // 6. Open CacheStorage and store audio files
    const cache = await caches.open(CACHE_NAME);
    const fileEntries = Object.entries(indexMap);
    const total = fileEntries.length;
    let extracted = 0;

    const BATCH_SIZE = 100;
    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = fileEntries.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async ([filename, [offset, length]]) => {
          const slice = payloadBytes.subarray(offset, offset + length);
          const mimeType = filename.endsWith('.mp3') ? 'audio/mpeg' : 'audio/ogg; codecs=opus';
          const blob = new Blob([slice], { type: mimeType });
          const response = new Response(blob, {
            headers: {
              'Content-Type': mimeType,
              'Content-Length': String(length),
              'Cache-Control': 'public, max-age=31536000'
            }
          });
          await cache.put(`${LOCAL_AUDIO_BASE}/${filename}`, response);
          extracted++;
        })
      );

      if (onProgress) {
        onProgress({
          extracted,
          total,
          percent: Math.min(100, Math.round((extracted / total) * 100))
        });
      }
    }

    return {
      success: true,
      extracted,
      total,
      version
    };
  }
}
