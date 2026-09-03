/**
 * DU Question Bank Helper
 * Manages loading, normalization, caching, and filtering for DU Admission questions.
 */

export const DU_SUBJECTS = {
  ALL: 'ALL',
  BANGLA: 'বাংলা',
  ENGLISH: 'English',
  GK: 'সাধারণ জ্ঞান'
};

export const DU_SESSION_YEARS = [
  'ALL',
  '২০২৪-২৫',
  '২০২৩-২৪',
  '২০২২-২৩',
  '২০২১-২২',
  '২০২০-২১',
  '২০১৯-২০',
  '২০১৮-১৯',
  '২০১৭-১৮',
  '২০১৬-১৭',
  '২০১৫-১৬'
];

/**
 * Normalizes an MCQ item to guarantee clean options and correct answer key ('A', 'B', 'C', 'D', 'E').
 */
export function normalizeMcqQuestion(item, index) {
  const rawAns = String(item.correct_answer || '').trim();
  const match = rawAns.match(/[A-E]/i);
  const correctKey = match ? match[0].toUpperCase() : 'A';

  const id = `du_mcq_${item.session_year || 'y'}_${item.subject || 's'}_${item.question_no || index + 1}`;

  const options = {};
  if (item.options && typeof item.options === 'object') {
    Object.entries(item.options).forEach(([k, v]) => {
      if (v !== null && v !== undefined && String(v).trim() !== '') {
        options[k.toUpperCase()] = String(v).trim();
      }
    });
  }

  return {
    ...item,
    id,
    correctKey,
    cleanOptions: options,
    questionText: String(item.question || '').trim(),
    explanationText: String(item.explanation || '').trim(),
    sourceFile: item.source_file || ''
  };
}

/**
 * Normalizes a Written question item.
 */
export function normalizeWrittenQuestion(item, index) {
  const id = `du_wr_${item.session_year || 'y'}_${item.subject || 's'}_${item.id || item.question_no || index + 1}`;
  
  let passage = String(item.context_passage || '')
    .replace(/<!-- PAGE_SPLIT [^>]+ -->/g, '')
    .replace(/##\s+[^\n]+/g, '')
    .trim();
  if (passage.length < 20) {
    passage = null;
  }

  return {
    ...item,
    id,
    subQuestions: Array.isArray(item.sub_questions) ? item.sub_questions : [],
    contextPassage: passage,
    instructionText: String(item.instruction || '').trim(),
    marksText: String(item.marks || '').trim()
  };
}

let cachedDuData = null;

/**
 * Loads DU Question Bank data.
 * Checks memory cache first, then fetches local JSON in public/data/du/.
 */
export async function loadDuQuestions() {
  if (cachedDuData) {
    return cachedDuData;
  }

  try {
    const [mcqRes, writtenRes] = await Promise.all([
      fetch('./data/du/du_mcq_questions.json').then(r => {
        if (!r.ok) return fetch('/data/du/du_mcq_questions.json').then(r2 => r2.json());
        return r.json();
      }),
      fetch('./data/du/du_written_questions.json').then(r => {
        if (!r.ok) return fetch('/data/du/du_written_questions.json').then(r2 => r2.json());
        return r.json();
      })
    ]);

    const normalizedMcq = (mcqRes || []).map(normalizeMcqQuestion);
    const normalizedWritten = (writtenRes || []).map(normalizeWrittenQuestion);

    cachedDuData = {
      mcq: normalizedMcq,
      written: normalizedWritten,
      totalMcq: normalizedMcq.length,
      totalWritten: normalizedWritten.length
    };

    return cachedDuData;
  } catch (error) {
    console.error('Failed to load DU Question Bank data:', error);
    return {
      mcq: [],
      written: [],
      totalMcq: 0,
      totalWritten: 0,
      error: error.message
    };
  }
}

/**
 * Filters MCQ questions based on subject, session year, search query, and bookmarks.
 */
export function filterMcqQuestions(questions = [], {
  subject = 'ALL',
  year = 'ALL',
  searchTerm = '',
  bookmarks = [],
  onlyBookmarked = false
} = {}) {
  let list = questions;

  if (subject && subject !== 'ALL') {
    list = list.filter(q => q.subject === subject);
  }

  if (year && year !== 'ALL') {
    list = list.filter(q => q.session_year === year);
  }

  if (onlyBookmarked) {
    const bookmarkSet = new Set(bookmarks);
    list = list.filter(q => bookmarkSet.has(q.id));
  }

  if (searchTerm && searchTerm.trim() !== '') {
    const term = searchTerm.toLowerCase().trim();
    list = list.filter(q => {
      const inQ = (q.questionText || '').toLowerCase().includes(term);
      const inExp = (q.explanationText || '').toLowerCase().includes(term);
      const inOpts = Object.values(q.cleanOptions || {}).some(val => val.toLowerCase().includes(term));
      const inYear = String(q.session_year || '').toLowerCase().includes(term);
      return inQ || inExp || inOpts || inYear;
    });
  }

  return list;
}

/**
 * Filters Written questions based on subject, session year, and search query.
 */
export function filterWrittenQuestions(questions = [], {
  subject = 'ALL',
  year = 'ALL',
  searchTerm = ''
} = {}) {
  let list = questions;

  if (subject && subject !== 'ALL') {
    if (subject === 'English') {
      list = list.filter(q => q.subject === 'English' || q.subject === 'General English');
    } else {
      list = list.filter(q => q.subject === subject);
    }
  }

  if (year && year !== 'ALL') {
    list = list.filter(q => q.session_year === year);
  }

  if (searchTerm && searchTerm.trim() !== '') {
    const term = searchTerm.toLowerCase().trim();
    list = list.filter(q => {
      const inPassage = (q.contextPassage || '').toLowerCase().includes(term);
      const inInstruction = (q.instructionText || '').toLowerCase().includes(term);
      const inSub = (q.subQuestions || []).some(sq => 
        (sq.question || '').toLowerCase().includes(term) || 
        (sq.answer || '').toLowerCase().includes(term)
      );
      return inPassage || inInstruction || inSub;
    });
  }

  return list;
}

export const STORAGE_KEY_DU_GAME_STARS = 'vocabmaster_du_game_stars';

export const DU_GAME_YEARS = [
  '২০২৪-২৫',
  '২০২৩-২৪',
  '২০২২-২৩',
  '২০২১-২২',
  '২০২০-২১',
  '২০১৯-২০',
  '২০১৮-১৯',
  '২০১৭-১৮',
  '২০১৬-১৭',
  '২০১৫-১৬'
];

/**
 * Returns 10 level definitions for a specific subject.
 * All levels are unlocked by default.
 */
export function getDuGameLevels(subject) {
  return DU_GAME_YEARS.map((year, index) => {
    // Determine expected question count per year for the subject
    let count = 15;
    if (subject === DU_SUBJECTS.GK) {
      count = (year === '২০১৫-১৬' || year === '২০১৬-১৭' || year === '২০১৭-১৮' || year === '২০১৮-১৯') ? 50 : (year === '২০১৯-২০' ? 28 : 30);
    } else {
      // Bangla or English
      count = (year === '২০১৫-১৬' || year === '২০১৬-১৭' || year === '২০১৭-১৮' || year === '২০১৮-১৯') ? 25 : (year === '২০১৯-২০' ? 16 : 15);
    }

    return {
      levelId: index + 1,
      year,
      subject,
      title: `Level ${index + 1}: ${year}`,
      subtitle: `ভর্তি পরীক্ষা: ${year}`,
      questionCount: count,
      maxStars: 10,
      isUnlocked: true // All levels unlocked as requested
    };
  });
}

/**
 * Calculates earned stars (0-10) based on correct answers and total questions.
 */
export function calculateDuLevelStars(correctCount, totalQuestions) {
  if (!totalQuestions || totalQuestions <= 0) return 0;
  const ratio = Math.max(0, Math.min(1, correctCount / totalQuestions));
  return Math.min(10, Math.max(0, Math.round(ratio * 10)));
}

/**
 * Retrieves saved DU game stars from localStorage.
 * Format: { 'বাংলা': { '২০২৪-২৫': 10, ... }, 'English': { ... }, 'সাধারণ জ্ঞান': { ... } }
 */
export function getDuSavedStars() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DU_GAME_STARS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Saves stars for a specific subject and year. Keeps the highest star rating achieved.
 */
export function saveDuLevelStars(subject, year, stars) {
  try {
    const current = getDuSavedStars();
    const subjMap = current[subject] || {};
    const prevStars = subjMap[year] || 0;
    const newStars = Math.max(prevStars, Math.min(10, Math.max(0, Number(stars) || 0)));

    const updated = {
      ...current,
      [subject]: {
        ...subjMap,
        [year]: newStars
      }
    };
    localStorage.setItem(STORAGE_KEY_DU_GAME_STARS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save DU level stars:', e);
    return null;
  }
}

/**
 * Returns total stars earned across all 10 levels for a subject (max 100).
 */
export function getDuSubjectTotalStars(subject, savedStars = null) {
  const starsMap = savedStars || getDuSavedStars();
  const subjMap = starsMap[subject] || {};
  return Object.values(subjMap).reduce((acc, s) => acc + (Number(s) || 0), 0);
}

