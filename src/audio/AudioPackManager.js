// AudioPackManager.js - Manages Offline Audio Pack download, local cache storage, and CDN streaming
const CACHE_NAME = 'vocabmaster-audio-pack-v1';
const GITHUB_CDN_BASE = 'https://raw.githubusercontent.com/mrahatcreations/VocabMaster/main/public/audio';
const LOCAL_BASE = '/audio';
const STORAGE_KEY_PACK_STATUS = 'vocabmaster_audio_pack_status';

class AudioPackManager {
  constructor() {
    this.isDownloading = false;
    this.abortController = null;
    this.manifest = null;
    this._listeners = new Set();
    this._initManifest();
  }

  async _initManifest() {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch(`${LOCAL_BASE}/manifest.json?v=` + Date.now());
      if (res.ok) {
        this.manifest = await res.json();
      }
    } catch (e) {
      try {
        const res = await fetch(`${GITHUB_CDN_BASE}/manifest.json`);
        if (res.ok) {
          this.manifest = await res.json();
        }
      } catch (err) {}
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
    if (!this.manifest) {
      await this._initManifest();
    }
    return this.manifest || {};
  }

  /**
   * Checks current offline audio cache status
   */
  async getStatus() {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return { isDownloaded: false, downloadedCount: 0, totalCount: 5868, sizeMB: 0, percent: 0 };
    }

    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      const downloadedCount = keys.length;
      const manifest = await this.getManifest();
      const totalCount = Object.keys(manifest).length || 5868;

      // Estimated ~14.7 KB average per opus file
      const sizeMB = Number(((downloadedCount * 14.7) / 1024).toFixed(1));
      const percent = totalCount > 0 ? Math.min(100, Math.round((downloadedCount / totalCount) * 100)) : 0;
      const isDownloaded = downloadedCount >= Math.floor(totalCount * 0.95);

      return {
        isDownloaded,
        downloadedCount,
        totalCount,
        sizeMB,
        percent,
        isDownloading: this.isDownloading
      };
    } catch (e) {
      return { isDownloaded: false, downloadedCount: 0, totalCount: 5868, sizeMB: 0, percent: 0 };
    }
  }

  /**
   * Returns a local cached audio URL or CDN fallback URL for a manifest filename
   */
  async getAudioUrl(filename) {
    if (!filename) return null;

    // 1. Check local CacheStorage first
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

    // 2. Local dev server / bundle fallback
    return `${LOCAL_BASE}/${filename}`;
  }

  /**
   * Downloads all audio files in parallel batches into CacheStorage
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
      const manifest = await this.getManifest();
      const filenames = Array.from(new Set(Object.values(manifest)));
      const totalCount = filenames.length || 5868;

      const cache = await caches.open(CACHE_NAME);
      const existingKeys = await cache.keys();
      const existingUrls = new Set(existingKeys.map(k => k.url));

      let downloadedCount = 0;
      existingKeys.forEach(() => downloadedCount++);

      const queue = filenames.filter(f => !existingUrls.has(new URL(`${LOCAL_BASE}/${f}`, window.location.href).href));

      const BATCH_SIZE = 16; // 16 parallel downloads
      let activeIndex = 0;

      const updateProgress = () => {
        const percent = totalCount > 0 ? Math.min(100, Math.round((downloadedCount / totalCount) * 100)) : 0;
        const sizeMB = Number(((downloadedCount * 14.7) / 1024).toFixed(1));
        const status = {
          isDownloading: true,
          percent,
          downloadedCount,
          totalCount,
          sizeMB
        };
        if (onProgress) onProgress(status);
        this._notify(status);
      };

      updateProgress();

      const worker = async () => {
        while (activeIndex < queue.length) {
          if (signal.aborted) break;
          const idx = activeIndex++;
          const filename = queue[idx];
          if (!filename) break;

          const requestUrl = `${LOCAL_BASE}/${filename}`;
          try {
            // Fetch from local dev proxy or GitHub CDN
            let res = await fetch(requestUrl, { signal });
            if (!res.ok) {
              res = await fetch(`${GITHUB_CDN_BASE}/${filename}`, { signal });
            }

            if (res.ok) {
              await cache.put(requestUrl, res.clone());
              downloadedCount++;
              if (downloadedCount % 20 === 0 || downloadedCount === totalCount) {
                updateProgress();
              }
            }
          } catch (err) {
            if (signal.aborted) break;
          }
        }
      };

      const workers = Array.from({ length: BATCH_SIZE }, () => worker());
      await Promise.all(workers);

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
      const status = { isDownloaded: false, downloadedCount: 0, totalCount: 5868, sizeMB: 0, percent: 0, isDownloading: false };
      this._notify(status);
      return status;
    } catch (e) {
      console.warn('Failed to delete audio cache:', e);
    }
  }
}

export const audioPackManager = new AudioPackManager();
export default audioPackManager;
