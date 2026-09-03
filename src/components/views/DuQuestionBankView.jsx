import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowUp, 
  BookOpen, 
  FileText, 
  Volume2, 
  VolumeX,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';
import { 
  loadDuQuestions, 
  filterMcqQuestions, 
  filterWrittenQuestions 
} from '../../utils/duDataHelper';
import { mistakeManager } from '../../utils/mistakeManager';

const STORAGE_KEY_DU_BOOKMARKS = 'vocabmaster_du_bookmarks';
const STORAGE_KEY_DU_MCQ_ANSWERS = 'vocabmaster_du_mcq_answers';

/**
 * Parses markdown tables, bold words, and bullet points into styled native React elements
 */
function FormattedAnswerText({ text = '', isLargeFont = false }) {
  if (!text) return null;

  // Normalize any literal escaped newlines
  const normalizedText = String(text).replace(/\\n/g, '\n');
  const rawLines = normalizedText.split('\n');
  const blocks = [];
  let tableBuffer = [];

  const flushTable = () => {
    if (tableBuffer.length > 0) {
      const isRow = (l) => l.trim().startsWith('|') && l.trim().endsWith('|');
      const isSep = (l) => /^\|(\s*:?-+:?\s*\|)+$/.test(l.trim());

      if (tableBuffer.length >= 2 && isRow(tableBuffer[0]) && isSep(tableBuffer[1])) {
        const parseRow = (l) => l.trim().slice(1, -1).split('|').map(c => c.trim());
        const headers = parseRow(tableBuffer[0]);
        const rows = [];
        for (let i = 2; i < tableBuffer.length; i++) {
          if (isRow(tableBuffer[i])) {
            rows.push(parseRow(tableBuffer[i]));
          }
        }
        blocks.push({ type: 'table', headers, rows });
      } else {
        tableBuffer.forEach(line => blocks.push({ type: 'text', content: line }));
      }
      tableBuffer = [];
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      tableBuffer.push(trimmed);
    } else {
      flushTable();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        blocks.push({ type: 'bullet', content: trimmed.slice(2) });
      } else if (trimmed) {
        blocks.push({ type: 'text', content: line });
      } else {
        blocks.push({ type: 'spacer' });
      }
    }
  }
  flushTable();

  const renderInline = (str) => {
    if (!str) return null;
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={pIdx} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className={`space-y-2 text-left ${isLargeFont ? 'text-sm sm:text-base leading-7' : 'text-xs sm:text-sm leading-relaxed'}`}>
      {blocks.map((block, bIdx) => {
        if (block.type === 'table') {
          // If table has more than 2 columns (e.g. word baskets / clue boxes), render as wrap-around chips to eliminate horizontal scrollbar
          if (block.headers.length > 2) {
            const allWords = [
              ...block.headers.filter(Boolean),
              ...block.rows.flat().filter(Boolean)
            ];

            return (
              <div key={bIdx} className="my-2.5 p-3 rounded-xl bg-[#0f172a] border border-slate-700/80 space-y-2">
                <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>ক্লু বক্স / শব্দ তালিকা (Word Basket)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {allWords.map((word, wIdx) => (
                    <span
                      key={wIdx}
                      className="px-2.5 py-1 rounded-lg bg-[#1e293b] text-white text-xs font-semibold border border-slate-700 shadow-xs"
                    >
                      {renderInline(word)}
                    </span>
                  ))}
                </div>
              </div>
            );
          }

          // 2-column key-value tables (e.g. শব্দ | অর্থ): table-fixed so it NEVER causes horizontal scrollbar
          return (
            <div key={bIdx} className="my-2.5 w-full rounded-xl border border-slate-700/80 bg-[#0f172a] overflow-hidden">
              <table className="w-full table-fixed text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#1e293b] border-b border-slate-700 text-amber-300 font-bold">
                    {block.headers.map((h, hIdx) => (
                      <th key={hIdx} className={`px-3 py-2.5 font-bold tracking-wide ${hIdx === 0 ? 'w-2/5' : 'w-3/5'}`}>
                        {renderInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {block.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#182234] transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-slate-100 font-medium break-words">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === 'bullet') {
          return (
            <div key={bIdx} className="flex items-start space-x-2 pl-1 text-slate-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
              <span className="flex-1">{renderInline(block.content)}</span>
            </div>
          );
        }

        if (block.type === 'spacer') {
          return <div key={bIdx} className="h-0.5" />;
        }

        return (
          <p key={bIdx} className="text-slate-100 whitespace-pre-line font-normal">
            {renderInline(block.content)}
          </p>
        );
      })}
    </div>
  );
}

export default function DuQuestionBankView({
  initialSubject = 'ALL',
  initialMode = 'mcq', // 'mcq' | 'written'
  initialYear = 'ALL',
  onBackToHub,
  isAudioMuted = false,
  setIsAudioMuted
}) {
  const [data, setData] = useState({ mcq: [], written: [], totalMcq: 0, totalWritten: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Active view filters
  const [activeTab, setActiveTab] = useState(initialMode || 'mcq'); // 'mcq' | 'written'
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || 'ALL');
  const [selectedYear, setSelectedYear] = useState(initialYear || 'ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [onlySaved, setOnlySaved] = useState(false);
  const [isLargeFont, setIsLargeFont] = useState(false);

  // Synchronize when parent changes initial props
  useEffect(() => {
    if (initialMode) setActiveTab(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (initialYear) setSelectedYear(initialYear);
  }, [initialYear]);

  useEffect(() => {
    if (initialSubject) setSelectedSubject(initialSubject);
  }, [initialSubject]);

  // Pagination for smooth scrolling
  const [visibleCount, setVisibleCount] = useState(25);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // User interactions: Bookmarks & Answer Selections
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DU_BOOKMARKS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [userAnswers, setUserAnswers] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_DU_MCQ_ANSWERS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Track expanded explanations (question id set)
  const [expandedExplanations, setExpandedExplanations] = useState(new Set());

  // Load dataset on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    loadDuQuestions()
      .then(res => {
        if (!isMounted) return;
        if (res.error && res.mcq.length === 0) {
          setLoadError(res.error);
        } else {
          setData(res);
        }
        setIsLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        setLoadError(err.message);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Save bookmarks
  const toggleBookmark = (id) => {
    sound.playClick();
    setBookmarkedIds(prev => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY_DU_BOOKMARKS, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save bookmark', e);
      }
      return next;
    });
  };

  // Answer an MCQ question
  const handleSelectOption = (question, selectedOptionKey) => {
    if (userAnswers[question.id]) return; // already answered

    const isCorrect = selectedOptionKey === question.correctKey;
    if (isCorrect) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }

    const nextAnswers = {
      ...userAnswers,
      [question.id]: {
        selected: selectedOptionKey,
        isCorrect,
        answeredAt: Date.now()
      }
    };
    setUserAnswers(nextAnswers);
    try {
      sessionStorage.setItem(STORAGE_KEY_DU_MCQ_ANSWERS, JSON.stringify(nextAnswers));
    } catch {}

    // Auto expand explanation on answering if wrong, or let user reveal
    if (!isCorrect) {
      setExpandedExplanations(prev => new Set([...prev, question.id]));

      try {
        const chosenText = question.cleanOptions?.[selectedOptionKey] || selectedOptionKey;
        const correctText = question.cleanOptions?.[question.correctKey] || question.correctKey;
        mistakeManager.recordMistake({
          id: `du_q_${question.id || question.question_no}_${question.subject}`,
          source: 'du_mcq_bank',
          subject: question.subject,
          subTitle: `${question.subject} • ${question.session_year} প্রশ্নব্যাংক`,
          questionText: question.questionText || question.question,
          userAnswer: `${selectedOptionKey}. ${chosenText}`,
          correctAnswer: `${question.correctKey}. ${correctText}`,
          explanation: question.explanationText || question.explanation || ''
        });
      } catch (err) {
        console.warn('Failed to record MCQ bank mistake:', err);
      }
    }
  };

  const toggleExplanation = (id) => {
    sound.playClick();
    setExpandedExplanations(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Scroll to top tracking
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(25);
  }, [activeTab, selectedSubject, selectedYear, searchTerm, onlySaved]);

  // Compute filtered items
  const filteredMcqItems = useMemo(() => {
    if (activeTab !== 'mcq') return [];
    return filterMcqQuestions(data.mcq, {
      subject: selectedSubject,
      year: selectedYear,
      searchTerm,
      bookmarks: bookmarkedIds,
      onlyBookmarked: onlySaved
    });
  }, [activeTab, data.mcq, selectedSubject, selectedYear, searchTerm, bookmarkedIds, onlySaved]);

  const filteredWrittenItems = useMemo(() => {
    if (activeTab !== 'written') return [];
    return filterWrittenQuestions(data.written, {
      subject: selectedSubject,
      year: selectedYear,
      searchTerm
    });
  }, [activeTab, data.written, selectedSubject, selectedYear, searchTerm]);

  const totalFilteredCount = activeTab === 'mcq' ? filteredMcqItems.length : filteredWrittenItems.length;

  // Stats calculation
  const stats = useMemo(() => {
    const totalAnswered = Object.keys(userAnswers).length;
    const correctCount = Object.values(userAnswers).filter(a => a.isCorrect).length;
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    return { totalAnswered, correctCount, accuracy };
  }, [userAnswers]);

  const handleResetSession = () => {
    sound.playClick();
    if (window.confirm('Reset all your answered questions for this session?')) {
      setUserAnswers({});
      try {
        sessionStorage.removeItem(STORAGE_KEY_DU_MCQ_ANSWERS);
      } catch {}
    }
  };

  // Subject filter chips list based on active tab
  const availableSubjects = useMemo(() => {
    if (activeTab === 'written') {
      return [
        { id: 'ALL', label: 'সব বিষয়' },
        { id: 'বাংলা', label: 'বাংলা' },
        { id: 'English', label: 'English' }
      ];
    }
    return [
      { id: 'ALL', label: 'সব বিষয়' },
      { id: 'বাংলা', label: 'বাংলা' },
      { id: 'English', label: 'English' },
      { id: 'সাধারণ জ্ঞান', label: 'সাধারণ জ্ঞান' }
    ];
  }, [activeTab]);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none pb-16 bg-[#0a0a0c] min-h-screen text-neutral-100 font-sans">
      
      {/* 1. ULTRA-COMPACT STICKY HEADER */}
      <header 
        className="sticky top-0 z-40 w-full bg-[#0a0a0c] border-b border-neutral-800 px-3 py-2.5 shadow-sm space-y-2"
        style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0px))' }}
      >
        {/* Row 1: Back Navigation, Search, Font Toggle & Sound */}
        <div className="flex items-center justify-between gap-2 w-full">
          {/* Back button */}
          <button
            onClick={() => {
              sound.playClick();
              if (onBackToHub) onBackToHub();
            }}
            className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-white text-xs font-bold shrink-0 transition cursor-pointer active:scale-95"
            title="Back to Year List"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">BACK</span>
          </button>

          {/* Integrated Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search questions, topics..."
              className="w-full pl-8 pr-7 py-1.5 bg-[#1e293b] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold p-0.5 cursor-pointer"
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>

          {/* Controls: Font Size, Count & Audio */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Reading Font Size Toggle for Written */}
            {activeTab === 'written' && (
              <button
                onClick={() => {
                  sound.playClick();
                  setIsLargeFont(!isLargeFont);
                }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer text-xs font-bold font-mono active:scale-95 ${
                  isLargeFont ? 'bg-[#2563eb] text-white' : 'bg-[#1e293b] text-slate-300 hover:text-white'
                }`}
                title={isLargeFont ? 'Standard Text Size' : 'Large Text Size'}
              >
                Aa
              </button>
            )}

            {/* Counter Pill */}
            <span className="font-mono text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-[#1e293b] text-white">
              {totalFilteredCount} {activeTab === 'mcq' ? 'MCQ' : 'Written'}
            </span>

            {setIsAudioMuted && (
              <button
                onClick={() => {
                  const next = !isAudioMuted;
                  setIsAudioMuted(next);
                  sound.enabled = !next;
                }}
                className="w-8 h-8 rounded-lg bg-[#1e293b] hover:bg-[#334155] flex items-center justify-center text-white transition cursor-pointer active:scale-90"
                title={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Subject Filter Chips */}
        <div className="w-full flex items-center overflow-x-auto scrollbar-none whitespace-nowrap touch-pan-x py-0.5 space-x-1.5">
          {availableSubjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                sound.playClick();
                setSelectedSubject(sub.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs transition cursor-pointer font-sans ${
                selectedSubject === sub.id
                  ? 'bg-[#2563eb] text-white font-bold'
                  : 'bg-[#1e293b] text-slate-300 hover:text-white font-medium'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      </header>

      {/* Accuracy & Score Bar (MCQ Mode Only) */}
      {activeTab === 'mcq' && stats.totalAnswered > 0 && (
        <div className="w-full px-3.5 pt-3 pb-1 flex items-center justify-between text-[11px] text-slate-300 font-mono">
          <div className="flex items-center space-x-2">
            <span>Score: <strong className="text-emerald-400 font-bold">{stats.correctCount}</strong> / {stats.totalAnswered}</span>
            <span className="text-slate-600">•</span>
            <span>Accuracy: <strong className="text-amber-300 font-bold">{stats.accuracy}%</strong></span>
          </div>
          <button
            onClick={handleResetSession}
            className="text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
            title="Reset answers"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      )}

      {/* 2. MAIN CONTENT AREA */}
      <main className="w-full px-3.5 pt-3 space-y-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent animate-spin rounded-full" />
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Loading Question Bank...
            </p>
          </div>
        )}

        {loadError && (
          <div className="w-full p-4 bg-[#b91c1c] rounded-2xl text-center space-y-2 text-white shadow-sm">
            <p className="text-xs font-bold">Failed to load question bank</p>
            <p className="text-[11px] font-mono opacity-90">{loadError}</p>
          </div>
        )}

        {!isLoading && !loadError && totalFilteredCount === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-2 bg-[#1e293b] rounded-2xl p-6 shadow-sm">
            <HelpCircle className="w-8 h-8 text-slate-400" />
            <p className="text-sm font-bold text-white">No questions found</p>
            <p className="text-xs text-slate-400">
              Try adjusting your search terms, year, or subject filters.
            </p>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* A. MCQ PRACTICE VIEW                                          */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'mcq' && (
          <div className="space-y-4">
            {filteredMcqItems.slice(0, visibleCount).map((item, idx) => {
              const ansState = userAnswers[item.id];
              const isAnswered = Boolean(ansState);
              const isBookmarked = bookmarkedIds.includes(item.id);
              const isExplanationOpen = expandedExplanations.has(item.id);

              return (
                <article
                  key={item.id || idx}
                  className="w-full bg-[#1e293b] rounded-2xl p-4.5 sm:p-5 space-y-3.5 shadow-sm text-left"
                >
                  {/* Card Header: Subject, Year, Question No. & Bookmark */}
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="font-bold text-white bg-[#0f172a] px-2.5 py-1 rounded-lg">
                        {item.subject}
                      </span>
                      <span className="font-mono text-slate-300">
                        {item.session_year}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="font-mono text-slate-300">
                        Q.{item.question_no || idx + 1}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleBookmark(item.id)}
                      className="p-1.5 rounded-lg bg-[#0f172a] text-slate-400 hover:text-amber-400 transition cursor-pointer active:scale-95"
                      title={isBookmarked ? 'Remove Bookmark' : 'Save Question'}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Question Prompt */}
                  <div className="text-white font-bold text-sm sm:text-base leading-relaxed font-sans">
                    {item.questionText}
                  </div>

                  {/* Options (A, B, C, D) */}
                  <div className="space-y-2 pt-1">
                    {Object.entries(item.cleanOptions).map(([optKey, optVal]) => {
                      const isSelected = ansState?.selected === optKey;
                      const isCorrect = item.correctKey === optKey;

                      let btnStyle = 'bg-[#0f172a] hover:bg-[#182033] text-white';
                      if (isAnswered) {
                        if (isCorrect) {
                          btnStyle = 'bg-[#059669] text-white font-bold';
                        } else if (isSelected) {
                          btnStyle = 'bg-[#b91c1c] text-white font-bold';
                        } else {
                          btnStyle = 'bg-[#0f172a] text-slate-400 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={optKey}
                          onClick={() => handleSelectOption(item, optKey)}
                          disabled={isAnswered}
                          className={`w-full text-left p-3 rounded-xl text-xs sm:text-sm transition flex items-start space-x-2.5 cursor-pointer shadow-sm ${btnStyle}`}
                        >
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-xs ${
                            isAnswered && isCorrect
                              ? 'bg-[#047857] text-white'
                              : isAnswered && isSelected && !isCorrect
                              ? 'bg-[#7f1d1d] text-white'
                              : 'bg-[#1e293b] text-blue-300'
                          }`}>
                            {optKey}
                          </span>
                          <span className="flex-1 leading-snug pt-0.5">
                            {optVal}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Result & Explanation Trigger */}
                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      {isAnswered ? (
                        <div className="flex items-center space-x-1.5 font-bold">
                          {ansState.isCorrect ? (
                            <span className="text-emerald-400 flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>সঠিক উত্তর (Correct)</span>
                            </span>
                          ) : (
                            <span className="text-rose-400 flex items-center space-x-1">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>ভুল উত্তর • সঠিক: ({item.correctKey})</span>
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>

                    {item.explanationText && (
                      <button
                        onClick={() => toggleExplanation(item.id)}
                        className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-bold py-1 px-2.5 rounded-lg bg-[#0f172a] transition cursor-pointer active:scale-95"
                      >
                        <span>{isExplanationOpen ? 'ব্যাখ্যা লুকান' : 'ব্যাখ্যা দেখুন'}</span>
                        {isExplanationOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                  {/* Explanation Block */}
                  {isExplanationOpen && item.explanationText && (
                    <div className="mt-2.5 p-4 rounded-xl bg-[#0f172a] text-slate-100 space-y-1.5 animate-pop border-l-4 border-blue-500">
                      <div className="font-bold text-amber-300 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>ব্যাখ্যা ও বিশ্লেষণ (Explanation)</span>
                      </div>
                      <FormattedAnswerText text={item.explanationText} />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* B. WRITTEN STUDY VIEW (ENHANCED READING SYSTEM)               */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'written' && (
          <div className="space-y-4">
            {filteredWrittenItems.slice(0, visibleCount).map((item, idx) => {
              return (
                <article
                  key={item.id || idx}
                  className="w-full bg-[#1e293b] rounded-2xl p-4.5 sm:p-5 space-y-4 shadow-sm text-left"
                >
                  {/* Header: Subject, Year & Marks */}
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white bg-[#0f172a] px-2.5 py-1 rounded-lg">
                        {item.subject}
                      </span>
                      <span className="font-mono text-slate-300">
                        {item.session_year}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="font-bold text-white">
                        প্রশ্ন {item.question_no || idx + 1}
                      </span>
                    </div>

                    {item.marksText && (
                      <span className="font-mono text-xs font-bold text-amber-300 bg-[#0f172a] px-2.5 py-1 rounded-lg">
                        নম্বর: {item.marksText}
                      </span>
                    )}
                  </div>

                  {/* Instruction / Direction */}
                  {item.instructionText && (
                    <div className="text-xs sm:text-sm font-bold text-white bg-[#0f172a] p-3 rounded-xl leading-relaxed flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{item.instructionText}</span>
                    </div>
                  )}

                  {/* PROMINENT READING PASSAGE (মূল পাঠ / অনুচ্ছেদ) */}
                  {item.contextPassage && (
                    <div className="bg-[#0f172a] rounded-xl p-4 sm:p-5 border-l-4 border-amber-400 space-y-2 shadow-xs">
                      <div className="flex items-center justify-between text-amber-300 font-bold text-xs uppercase tracking-wider">
                        <div className="flex items-center space-x-1.5">
                          <BookOpen className="w-4 h-4 text-amber-400" />
                          <span>মূল পাঠ / অনুচ্ছেদ (Reading Passage)</span>
                        </div>
                      </div>
                      <FormattedAnswerText text={item.contextPassage} isLargeFont={isLargeFont} />
                    </div>
                  )}

                  {/* Sub Questions & Model Answers */}
                  {item.subQuestions && item.subQuestions.length > 0 && (
                    <div className="space-y-3 pt-1">
                      {item.subQuestions.map((sub, sIdx) => (
                        <div key={sIdx} className="bg-[#0f172a] rounded-xl p-4 space-y-3">
                          {/* Question Row */}
                          <div className="flex items-start space-x-2.5 text-white">
                            <span className="w-6 h-6 rounded-lg bg-[#2563eb] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {sub.label || sIdx + 1}
                            </span>
                            <span className={`flex-1 font-bold text-white leading-snug ${
                              isLargeFont ? 'text-base' : 'text-sm sm:text-base'
                            }`}>
                              {sub.question}
                            </span>
                          </div>

                          {/* Model Answer Section */}
                          {sub.answer && (
                            <div className="bg-[#1e293b] rounded-xl p-3.5 sm:p-4 border-l-4 border-emerald-400 space-y-1.5">
                              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>মডেল উত্তর</span>
                              </div>
                              <FormattedAnswerText text={sub.answer} isLargeFont={isLargeFont} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Single Answer if no sub-questions */}
                  {(!item.subQuestions || item.subQuestions.length === 0) && item.answer && (
                    <div className="bg-[#0f172a] rounded-xl p-4 border-l-4 border-emerald-400 space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>মডেল উত্তর</span>
                      </div>
                      <FormattedAnswerText text={item.answer} isLargeFont={isLargeFont} />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {totalFilteredCount > visibleCount && (
          <div className="w-full pt-2 pb-8 flex justify-center">
            <button
              onClick={() => {
                sound.playClick();
                setVisibleCount(prev => prev + 25);
              }}
              className="px-6 py-3 bg-[#1e293b] hover:bg-[#283548] rounded-xl text-white text-xs font-mono font-bold tracking-wider transition cursor-pointer active:scale-95 shadow-sm"
            >
              LOAD MORE ({totalFilteredCount - visibleCount} REMAINING)
            </button>
          </div>
        )}
      </main>

      {/* Back to Top Floating Button */}
      {showScrollTop && (
        <button
          onClick={() => {
            sound.playClick();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="fixed bottom-6 right-6 z-50 p-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl shadow-xl transition active:scale-90 cursor-pointer"
          title="Back to Top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
