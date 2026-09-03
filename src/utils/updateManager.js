/**
 * In-App Update Manager
 * Checks remote version configuration, compares versions, and handles APK download routing.
 */

export const CURRENT_APP_VERSION = '1.1.7';
export const CURRENT_VERSION_CODE = 17;

// Default remote endpoint (GitHub Raw or custom hosting)
export const DEFAULT_UPDATE_URL = 'https://raw.githubusercontent.com/mrahatcreations/KnowledgeHub/main/version.json';
export const FALLBACK_UPDATE_URL = '/version.json';

const STORAGE_KEY_DISMISSED = 'vocabmaster_dismissed_update';
const STORAGE_KEY_CUSTOM_URL = 'vocabmaster_custom_update_url';

/**
 * Compare two semver strings (e.g. "1.1.5" vs "1.1.6")
 * Returns:
 *  1 if a > b
 * -1 if a < b
 *  0 if a === b
 */
export function compareVersions(a, b) {
  const parse = (v) => (v || '0').split('.').map(num => parseInt(num, 10) || 0);
  const aParts = parse(a);
  const bParts = parse(b);
  const maxLen = Math.max(aParts.length, bParts.length);

  for (let i = 0; i < maxLen; i++) {
    const aVal = aParts[i] || 0;
    const bVal = bParts[i] || 0;
    if (aVal > bVal) return 1;
    if (aVal < bVal) return -1;
  }
  return 0;
}

export const updateManager = {
  getCurrentVersion() {
    return {
      version: CURRENT_APP_VERSION,
      versionCode: CURRENT_VERSION_CODE
    };
  },

  getUpdateUrl() {
    return localStorage.getItem(STORAGE_KEY_CUSTOM_URL) || DEFAULT_UPDATE_URL;
  },

  setUpdateUrl(url) {
    if (url && url.trim()) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_URL, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_URL);
    }
  },

  /**
   * Check for updates from remote endpoint
   * @param {Object} options { force: boolean }
   */
  async checkForUpdates({ force = false } = {}) {
    const urlsToTry = [this.getUpdateUrl(), FALLBACK_UPDATE_URL];
    let remoteData = null;
    let lastError = null;

    for (const url of urlsToTry) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        // Append timestamp cache buster
        const fetchUrl = `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;
        const response = await fetch(fetchUrl, {
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' }
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          remoteData = await response.json();
          if (remoteData && (remoteData.version || remoteData.versionCode)) {
            break;
          }
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (!remoteData) {
      return {
        hasUpdate: false,
        error: lastError ? (lastError.name === 'AbortError' ? 'সংযোগের সময়সীমা শেষ হয়েছে' : 'ইন্টারনেট সংযোগ পাওয়া যায়নি') : 'তথ্য পাওয়া যায়নি',
        currentVersion: CURRENT_APP_VERSION,
        currentVersionCode: CURRENT_VERSION_CODE
      };
    }

    const remoteVersion = remoteData.version || CURRENT_APP_VERSION;
    const remoteVersionCode = Number(remoteData.versionCode) || 0;

    // Check version code first, then semver
    let hasUpdate = false;
    if (remoteVersionCode > 0) {
      hasUpdate = remoteVersionCode > CURRENT_VERSION_CODE;
    } else {
      hasUpdate = compareVersions(remoteVersion, CURRENT_APP_VERSION) > 0;
    }

    const isMandatory = Boolean(remoteData.mandatory);
    const dismissedVersion = localStorage.getItem(STORAGE_KEY_DISMISSED);

    // If dismissed and not forced or mandatory, suppress prompt
    const isDismissed = !force && !isMandatory && dismissedVersion === remoteVersion;

    return {
      hasUpdate,
      isDismissed,
      currentVersion: CURRENT_APP_VERSION,
      currentVersionCode: CURRENT_VERSION_CODE,
      remoteVersion,
      remoteVersionCode,
      title: remoteData.title || 'নতুন সংস্করণ আপডেট',
      releaseNotes: remoteData.releaseNotes || [],
      downloadUrl: remoteData.downloadUrl || '',
      releaseDate: remoteData.releaseDate || '',
      isMandatory
    };
  },

  dismissUpdate(version) {
    if (version) {
      localStorage.setItem(STORAGE_KEY_DISMISSED, version);
    }
  },

  clearDismissed() {
    localStorage.removeItem(STORAGE_KEY_DISMISSED);
  }
};
