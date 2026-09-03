/**
 * Unified Mistake Manager
 * Aggregates, persists, and organizes mistakes from:
 * 1. Vocabulary Games (English Saga stages)
 * 2. DU Admission Games (Bangla, English, GK)
 * 3. DU Question Bank MCQ Practice
 */

const STORAGE_KEY_MISTAKES = 'knowledgehub_mistakes_v1';
const EVENT_MISTAKES_UPDATED = 'kh_mistakes_updated';

export const mistakeManager = {
  _memoryList: [],

  getAllMistakes() {
    try {
      if (typeof localStorage === 'undefined') return this._memoryList || [];
      const raw = localStorage.getItem(STORAGE_KEY_MISTAKES);
      if (!raw) return this._memoryList || [];
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return this._memoryList || [];
    }
  },

  _saveMistakes(list) {
    this._memoryList = list;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_MISTAKES, JSON.stringify(list));
      }
      if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
        window.dispatchEvent(new CustomEvent(EVENT_MISTAKES_UPDATED, { detail: { count: list.length } }));
      }
    } catch (e) {}
  },

  recordMistake({
    id,
    source = 'vocab_game',
    subject = 'Vocabulary',
    subTitle = '',
    questionText = '',
    userAnswer = '',
    correctAnswer = '',
    explanation = ''
  }) {
    if (!questionText && !id) return;

    const list = this.getAllMistakes();
    const cleanId = String(id || `${source}_${subject}_${questionText}`).trim();

    const existingIndex = list.findIndex(m => m.id === cleanId);

    if (existingIndex >= 0) {
      const existing = list[existingIndex];
      list[existingIndex] = {
        ...existing,
        subTitle: subTitle || existing.subTitle,
        userAnswer: String(userAnswer || existing.userAnswer),
        correctAnswer: String(correctAnswer || existing.correctAnswer),
        explanation: explanation || existing.explanation,
        timestamp: Date.now(),
        failCount: (existing.failCount || 1) + 1
      };
    } else {
      list.unshift({
        id: cleanId,
        source,
        subject,
        subTitle,
        questionText: String(questionText).trim(),
        userAnswer: String(userAnswer).trim(),
        correctAnswer: String(correctAnswer).trim(),
        explanation: String(explanation || '').trim(),
        timestamp: Date.now(),
        failCount: 1
      });
    }

    this._saveMistakes(list);
  },

  resolveMistake(id) {
    if (!id) return;
    const list = this.getAllMistakes();
    const filtered = list.filter(m => m.id !== id);
    if (filtered.length !== list.length) {
      this._saveMistakes(filtered);
    }
  },

  clearMistakes(filterSubject = null) {
    if (!filterSubject || filterSubject === 'ALL') {
      this._saveMistakes([]);
      return;
    }

    const list = this.getAllMistakes();
    const filtered = list.filter(m => m.subject !== filterSubject && m.source !== filterSubject);
    this._saveMistakes(filtered);
  },

  getMistakeStats() {
    const list = this.getAllMistakes();
    const stats = {
      total: list.length,
      vocabulary: 0,
      bangla: 0,
      english: 0,
      gk: 0
    };

    list.forEach(m => {
      const subj = String(m.subject || '').toLowerCase();
      if (subj.includes('vocab')) {
        stats.vocabulary++;
      } else if (subj.includes('বাংলা') || subj.includes('bangla')) {
        stats.bangla++;
      } else if (subj.includes('english')) {
        stats.english++;
      } else if (subj.includes('জ্ঞান') || subj.includes('gk')) {
        stats.gk++;
      } else {
        stats.vocabulary++;
      }
    });

    return stats;
  },

  onUpdate(callback) {
    if (typeof window === 'undefined') return () => {};
    const handler = (e) => callback(e.detail);
    window.addEventListener(EVENT_MISTAKES_UPDATED, handler);
    return () => window.removeEventListener(EVENT_MISTAKES_UPDATED, handler);
  }
};
