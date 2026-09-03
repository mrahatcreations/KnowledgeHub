import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Volume2, 
  BookOpen, 
  Languages, 
  HelpCircle,
  Sparkles,
  ArrowUp,
  RotateCcw
} from 'lucide-react';
import { mistakeManager } from '../../utils/mistakeManager';
import { sound } from '../../audio/SoundSynthesizer';

export default function MyMistakesView({
  onBack,
  isAudioMuted = false,
  setIsAudioMuted
}) {
  const [mistakes, setMistakes] = useState(() => mistakeManager.getAllMistakes());
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedExplanations, setExpandedExplanations] = useState(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Subscribe to mistake updates
  useEffect(() => {
    return mistakeManager.onUpdate(() => {
      setMistakes(mistakeManager.getAllMistakes());
    });
  }, []);

  // Scroll listener for back to top
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Category stats
  const stats = useMemo(() => {
    return mistakeManager.getMistakeStats();
  }, [mistakes]);

  // Categories list
  const categories = [
    { id: 'ALL', label: 'সব ভুল', count: mistakes.length },
    { id: 'Vocabulary', label: 'Vocabulary', count: stats.vocabulary },
    { id: 'বাংলা', label: 'ঢাবি বাংলা', count: stats.bangla },
    { id: 'General English', label: 'ঢাবি English', count: stats.english },
    { id: 'সাধারণ জ্ঞান', label: 'ঢাবি সাধারণ জ্ঞান', count: stats.gk },
  ];

  // Filtered mistakes
  const filteredMistakes = useMemo(() => {
    return mistakes.filter(m => {
      // Category filter
      if (selectedCategory !== 'ALL') {
        const subj = String(m.subject || '').toLowerCase();
        const target = selectedCategory.toLowerCase();
        if (target === 'vocabulary' && !subj.includes('vocab')) return false;
        if (target === 'বাংলা' && !subj.includes('বাংলা') && !subj.includes('bangla')) return false;
        if (target === 'general english' && !subj.includes('english')) return false;
        if (target === 'সাধারণ জ্ঞান' && !subj.includes('জ্ঞান') && !subj.includes('gk')) return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = String(m.questionText || '').toLowerCase().includes(q);
        const matchAns = String(m.correctAnswer || '').toLowerCase().includes(q);
        const matchSub = String(m.subTitle || '').toLowerCase().includes(q);
        if (!matchTitle && !matchAns && !matchSub) return false;
      }

      return true;
    });
  }, [mistakes, selectedCategory, searchTerm]);

  const handleResolve = (id) => {
    sound.playCorrect();
    mistakeManager.resolveMistake(id);
  };

  const handleClearAll = () => {
    sound.playClick();
    if (window.confirm('আপনি কি এই ক্যাটাগরির সব ভুলের ইতিহাস মুছে ফেলতে চান?')) {
      mistakeManager.clearMistakes(selectedCategory === 'ALL' ? null : selectedCategory);
      setMistakes(mistakeManager.getAllMistakes());
    }
  };

  const toggleExplanation = (id) => {
    sound.playClick();
    setExpandedExplanations(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSpeak = (text) => {
    if (isAudioMuted || !text) return;
    try {
      sound.playClick();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {}
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans pb-24 select-none">
      {/* ULTRA-COMPACT STICKY HEADER (Row 1: Nav/Search/Count; Row 2: Category Chips) */}
      <header className="sticky top-0 z-40 bg-[#0f172a] border-b border-slate-800 shadow-md">
        <div className="max-w-3xl mx-auto px-3.5 py-2.5 space-y-2">
          {/* Row 1: Unified Navigation, Title/Search, and Count */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => {
                  sound.playClick();
                  if (onBack) onBack();
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#1e293b] hover:bg-[#334155] text-slate-200 font-bold text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>HUB</span>
              </button>
            </div>

            {/* Middle Title / Search Toggle */}
            <div className="flex-1 flex items-center justify-center min-w-0 px-1">
              {isSearchOpen ? (
                <div className="relative w-full max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ভুল প্রশ্ন বা শব্দ খুঁজুন..."
                    autoFocus
                    className="w-full bg-[#1e293b] text-white text-xs pl-8 pr-7 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ) : (
                <h1 className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>আমার ভুলসমূহ</span>
                </h1>
              )}
            </div>

            {/* Right: Search Toggle, Count Badge, Clear Button */}
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsSearchOpen(prev => !prev);
                  if (isSearchOpen) setSearchTerm('');
                }}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition cursor-pointer ${
                  isSearchOpen ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-[#1e293b] text-slate-300 hover:text-white'
                }`}
                title="Search mistakes"
              >
                <Search className="w-3.5 h-3.5" />
              </button>

              <span className="px-2.5 py-1 rounded-lg bg-[#1e293b] text-rose-300 border border-slate-700 font-mono text-xs font-bold shrink-0">
                {filteredMistakes.length}
              </span>

              {mistakes.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="w-7 h-7 rounded-lg bg-[#1e293b] hover:bg-rose-950/80 text-rose-400 flex items-center justify-center transition cursor-pointer"
                  title="ক্যাটাগরির সব ভুল মুছুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Category Filter Chips (Horizontal Scrollable) */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {categories.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-[#2563eb] text-white shadow-xs'
                      : 'bg-[#1e293b] text-slate-300 hover:bg-[#334155] hover:text-white'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#0f172a] text-slate-400'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-3xl mx-auto w-full px-3.5 py-4 space-y-3.5">
        {/* Empty State */}
        {filteredMistakes.length === 0 ? (
          <div className="w-full bg-[#0f172a] rounded-2xl p-8 text-center space-y-3 border border-slate-800 my-8">
            <div className="w-14 h-14 rounded-2xl bg-[#1e293b] flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">
              {mistakes.length === 0 ? 'চমৎকার! কোনো ভুলের রেকর্ড নেই' : 'এই ক্যাটাগরিতে কোনো ভুল পাওয়া যায়নি'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              {mistakes.length === 0 
                ? 'ইংরেজি ভোকাবুলারি বা ঢাকা বিশ্ববিদ্যালয়ের প্রশ্ন সমাধানের সময় কোনো উত্তর ভুল হলে তা স্বয়ংক্রিয়ভাবে এখানে সংরক্ষিত হবে।'
                : 'অন্য ক্যাটাগরি নির্বাচন করুন অথবা নতুন প্রশ্ন অনুশীলন করুন।'}
            </p>
          </div>
        ) : (
          /* Mistakes List */
          filteredMistakes.map((m, idx) => {
            const isExpanded = expandedExplanations.has(m.id);
            const isVocab = m.source === 'vocab_game' || m.subject === 'Vocabulary';

            return (
              <div 
                key={m.id || idx}
                className="bg-[#0f172a] rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3 shadow-xs hover:border-slate-700 transition"
              >
                {/* Card Top: Source Badge & Fail Count */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.8 rounded-lg bg-[#1e293b] text-amber-300 font-bold text-[11px] uppercase tracking-wide border border-slate-700">
                      {m.subject || 'Vocabulary'}
                    </span>
                    {m.subTitle && (
                      <span className="text-[11px] text-slate-400 font-medium truncate max-w-[180px] sm:max-w-xs">
                        {m.subTitle}
                      </span>
                    )}
                  </div>

                  {m.failCount > 1 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 text-[10px] font-bold font-mono">
                      {m.failCount} বার ভুল হয়েছে
                    </span>
                  )}
                </div>

                {/* Question / Word Title */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug flex-1">
                    {m.questionText}
                  </h3>
                  {isVocab && (
                    <button
                      onClick={() => handleSpeak(m.questionText)}
                      className="w-7 h-7 rounded-lg bg-[#1e293b] text-amber-300 hover:text-white flex items-center justify-center shrink-0 cursor-pointer"
                      title="উচ্চারণ শুনুন"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Answer Comparison Box (2-Color Solid: Rose for Wrong, Emerald for Correct) */}
                <div className="space-y-2 pt-0.5">
                  {/* User Wrong Answer */}
                  {m.userAnswer && (
                    <div className="flex items-start space-x-2 px-3 py-2 rounded-xl bg-[#1e293b] border-l-4 border-rose-500 text-xs">
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <span className="text-rose-300 font-bold block text-[10px] uppercase tracking-wider">
                          আপনার ভুল উত্তর:
                        </span>
                        <span className="text-slate-200 font-medium break-words">
                          {m.userAnswer}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Correct Answer */}
                  <div className="flex items-start space-x-2 px-3 py-2 rounded-xl bg-[#1e293b] border-l-4 border-emerald-400 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <span className="text-emerald-300 font-bold block text-[10px] uppercase tracking-wider">
                        সঠিক উত্তর:
                      </span>
                      <span className="text-white font-bold break-words">
                        {m.correctAnswer}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Explanation Toggle */}
                {m.explanation && (
                  <div className="pt-1">
                    {isExpanded ? (
                      <div className="p-3 rounded-xl bg-[#162032] border border-slate-700/80 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-amber-300 font-bold text-[11px]">
                          <span>ব্যাখ্যা / উদাহরণ:</span>
                          <button
                            onClick={() => toggleExplanation(m.id)}
                            className="text-slate-400 hover:text-white text-[10px] cursor-pointer"
                          >
                            লুকান
                          </button>
                        </div>
                        <p className="text-slate-200 whitespace-pre-line leading-relaxed font-normal">
                          {m.explanation}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleExplanation(m.id)}
                        className="text-[11px] text-amber-300 hover:underline font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>ব্যাখ্যা দেখুন</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Action Row: Mark as Mastered */}
                <div className="flex items-center justify-end pt-1 border-t border-slate-800">
                  <button
                    onClick={() => handleResolve(m.id)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] active:scale-95 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                    title="এই প্রশ্নটি আমার শেখা হয়েছে (তালিকা থেকে সরান)"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>আয়ত্ত করেছি (Mastered)</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Floating Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-5 z-40 w-10 h-10 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shadow-lg active:scale-95 transition cursor-pointer"
          title="উপরে যান"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
