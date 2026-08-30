import { BinaryAudioPackEngine } from './BinaryAudioPackEngine.js';

// AudioPackManager.js - Manages Offline Audio Pack download, local cache storage, and CDN streaming
const CACHE_NAME = 'vocabmaster-audio-pack-v1';
const GITHUB_CDN_BASE = 'https://raw.githubusercontent.com/mrahatcreations/VocabMaster/main/public/audio';
const GITHUB_PACK_URL = 'https://raw.githubusercontent.com/mrahatcreations/VocabMaster/main/public/data/voice_pack_v1.khpack';
const LOCAL_PACK_URL = '/data/voice_pack_v1.khpack';
const LOCAL_BASE = '/audio';
const STORAGE_KEY_PACK_STATUS = 'vocabmaster_audio_pack_status';
const STORAGE_KEY_MANIFEST = 'vocabmaster_audio_manifest';

class AudioPackManager {
  constructor() {
    this.isDownloading = false;
    this.abortController = null;
    this.manifest = null;
    this._manifestPromise = null;
    this._listeners = new Set();
    this._initManifest();
  }

  async _initManifest() {
    if (typeof window === 'undefined') return {};
    
    // Return in-flight promise if already loading
    if (this._manifestPromise) {
      return this._manifestPromise;
    }

    this._manifestPromise = (async () => {
      // 1. Instant hydration from localStorage cache if available
      if (!this.manifest) {
        try {
          const cached = localStorage.getItem(STORAGE_KEY_MANIFEST);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
              this.manifest = parsed;
            }
          }
        } catch (e) {}
      }

      // 2. Try fetching from local base
      try {
        const res = await fetch(`${LOCAL_BASE}/manifest.json?v=` + Date.now());
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            this.manifest = data;
            try {
              localStorage.setItem(STORAGE_KEY_MANIFEST, JSON.stringify(data));
            } catch (e) {}
            return this.manifest;
          }
        }
      } catch (e) {}

      // 3. Fallback to GitHub CDN
      try {
        const res = await fetch(`${GITHUB_CDN_BASE}/manifest.json`);
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            this.manifest = data;
            try {
              localStorage.setItem(STORAGE_KEY_MANIFEST, JSON.stringify(data));
            } catch (e) {}
            return this.manifest;
          }
        }
      } catch (err) {}

      return this.manifest || {};
    })();

    try {
      const result = await this._manifestPromise;
      return result;
    } finally {
      this._manifestPromise = null;
    }
  }

  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  _notify(state) {
    this._listeners.forEach(fn => {
      try { fn(state); } catch (e) {}
    });
  }

  async getManifest() {
    if (!this.manifest || Object.keys(this.manifest).length === 0) {
      await this._initManifest();
    }
    return this.manifest || {};
  }

  /**
   * Checks current offline audio cache status
   */
  async getStatus() {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return { isDownloaded: false, downloadedCount: 0, totalCount: 5867, sizeMB: 0, percent: 0, phase: 'idle' };
    }

    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      const downloadedCount = keys.length;
      const totalCount = 5867;

      const sizeMB = Number(((downloadedCount * 14.7) / 1024).toFixed(1));
      const percent = totalCount > 0 ? Math.min(100, Math.round((downloadedCount / totalCount) * 100)) : 0;
      const isDownloaded = downloadedCount >= Math.floor(totalCount * 0.9);

      return {
        isDownloaded,
        downloadedCount,
        totalCount,
        sizeMB,
        percent,
        isDownloading: this.isDownloading,
        phase: this.isDownloading ? 'downloading' : isDownloaded ? 'ready' : 'idle'
      };
    } catch (e) {
      return { isDownloaded: false, downloadedCount: 0, totalCount: 5867, sizeMB: 0, percent: 0, phase: 'idle' };
    }
  }

  /**
   * Returns a local cached audio URL or CDN fallback URL for a manifest filename
   */
  async getAudioUrl(filename) {
    if (!filename) return null;

    // 1. Check local CacheStorage first (offline)
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cache = await caches.open(CACHE_NAME);
        const match = await cache.match(`${LOCAL_BASE}/${filename}`);
        if (match) {
          const blob = await match.blob();
          return URL.createObjectURL(blob);
        }
      } catch (e) {}
    }

    // 2. Return GitHub CDN streaming URL & background cache
    const cdnUrl = `${GITHUB_CDN_BASE}/${filename}`;
    if (typeof window !== 'undefined' && 'caches' in window) {
      fetch(cdnUrl)
        .then(async (res) => {
          if (res.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(`${LOCAL_BASE}/${filename}`, res.clone());
          }
        })
        .catch(() => {});
    }

    return cdnUrl;
  }

  /**
   * Downloads single encrypted .khpack stream and decrypts/unpacks directly to CacheStorage
   */
  async downloadPack(onProgress) {
    if (this.isDownloading) return;
    if (typeof window === 'undefined' || !('caches' in window)) {
      throw new Error('CacheStorage is not supported in this environment.');
    }

    this.isDownloading = true;
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    try {
      // 1. Determine download target (try local or GitHub raw CDN)
      let targetUrl = GITHUB_PACK_URL;
      let res = await fetch(LOCAL_PACK_URL, { signal, method: 'HEAD' }).catch(() => null);
      if (res && res.ok) {
        targetUrl = LOCAL_PACK_URL;
      }

      const response = await fetch(targetUrl, { signal });
      if (!response.ok) {
        throw new Error(`Failed to download audio pack (${response.status})`);
      }

      const contentLength = response.headers.get('Content-Length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 82470000; // ~78.6 MB estimate
      let loadedBytes = 0;

      const reader = response.body.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        loadedBytes += value.length;

        const percent = Math.min(95, Math.round((loadedBytes / totalBytes) * 95));
        const status = {
          isDownloading: true,
          phase: 'downloading',
          percent,
          downloadedCount: Math.round((percent / 100) * 5867),
          totalCount: 5867,
          sizeMB: Number((loadedBytes / (1024 * 1024)).toFixed(1)),
          totalSizeMB: Number((totalBytes / (1024 * 1024)).toFixed(1))
        };
        if (onProgress) onProgress(status);
        this._notify(status);
      }

      // 2. Concatenate chunks to single ArrayBuffer
      const totalBuffer = new Uint8Array(loadedBytes);
      let offset = 0;
      for (const chunk of chunks) {
        totalBuffer.set(chunk, offset);
        offset += chunk.length;
      }

      // 3. Decrypt and unpack container into CacheStorage
      const unpackStatus = {
        isDownloading: true,
        phase: 'unpacking',
        percent: 96,
        downloadedCount: 5867,
        totalCount: 5867,
        sizeMB: Number((loadedBytes / (1024 * 1024)).toFixed(1))
      };
      if (onProgress) onProgress(unpackStatus);
      this._notify(unpackStatus);

      await BinaryAudioPackEngine.unpack(totalBuffer.buffer, ({ extracted, total }) => {
        const unpackPercent = 96 + Math.round((extracted / total) * 4);
        const st = {
          isDownloading: true,
          phase: 'unpacking',
          percent: Math.min(100, unpackPercent),
          downloadedCount: extracted,
          totalCount: total,
          sizeMB: Number((loadedBytes / (1024 * 1024)).toFixed(1))
        };
        if (onProgress) onProgress(st);
        this._notify(st);
      });

      this.isDownloading = false;
      this.abortController = null;

      const finalStatus = await this.getStatus();
      this._notify(finalStatus);
      return finalStatus;
    } catch (err) {
      this.isDownloading = false;
      this.abortController = null;
      throw err;
    }
  }

  cancelDownload() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.isDownloading = false;
    this.getStatus().then(s => this._notify(s));
  }

  async deletePack() {
    if (typeof window === 'undefined' || !('caches' in window)) return;
    try {
      await caches.delete(CACHE_NAME);
      const status = await this.getStatus();
      this._notify(status);
      return status;
    } catch (e) {
      return null;
    }
  }
}

export const audioPackManager = new AudioPackManager();
export default audioPackManager;
