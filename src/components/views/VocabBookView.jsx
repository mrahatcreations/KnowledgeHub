import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Volume2, 
  Bookmark, 
  ArrowLeft, 
  ArrowUp,
  Headphones
} from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';
import { getPosInfo, getVerbForms } from '../../utils/grammarHelper';

export default function VocabBookView({ 
  levels = [], 
  levelStars = {}, 
  onBackToHub, 
  initialFilter = 'ALL',
  onOpenAudioSettings
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(initialFilter || 'ALL');
  const [speakingWord, setSpeakingWord] = useState(null);
  const [visibleCount, setVisibleCount] = useState(40);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [bookmarkedWords, setBookmarkedWords] = useState(() => {
    try {
      const saved = localStorage.getItem('vocabmaster_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Track window scroll for "Back to Top" button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pre-load voices for instant mobile audio
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }, []);

  // Extract and normalize all vocabulary words across levels
  const allVocabItems = useMemo(() => {
    const list = [];
    const seen = new Set();

    (levels || []).forEach(lvl => {
      (lvl.items || []).forEach(it => {
        if (it && it.word && !seen.has(it.word.toLowerCase())) {
          seen.add(it.word.toLowerCase());

          // Extract synonyms and antonyms safely
          let syns = [];
          if (Array.isArray(it.synonyms)) {
            syns = it.synonyms;
          } else if (it.raw_synonyms) {
            syns = it.raw_synonyms.split(/[,;|]+/).map(s => s.trim()).filter(Boolean);
          }

          let ants = [];
          if (Array.isArray(it.antonyms)) {
            ants = it.antonyms;
          } else if (it.raw_antonyms) {
            ants = it.raw_antonyms.split(/[,;|]+/).map(a => a.trim()).filter(Boolean);
          }

          const inferredPos = it.pos || getPosInfo(it.pos, it.word, it.meaning).short.toLowerCase();
          const posInfo = getPosInfo(it.pos, it.word, it.meaning);
          const tier = lvl.level_id > 130 ? 'Advanced' : lvl.level_id > 60 ? 'Intermediate' : 'Beginner';

          list.push({
            ...it,
            levelId: lvl.level_id,
            levelTitle: lvl.title,
            tier: tier,
            synonymsList: syns,
            antonymsList: ants,
            verbForms: getVerbForms(it.word, inferredPos),
            posInfo: posInfo,
            isMastered: (levelStars[lvl.level_id] || 0) >= 5 || (levelStars[lvl.level_id] || 0) === 10
          });
        }
      });
    });

    return list.sort((a, b) => a.word.localeCompare(b.word));
  }, [levels, levelStars]);

  // Filtered Items Logic
  const filteredItems = useMemo(() => {
    return allVocabItems.filter(item => {
      // 1. Search Query
      const query = searchTerm.toLowerCase().trim();
      const matchSearch = !query || 
        item.word.toLowerCase().includes(query) ||
        (item.meaning && item.meaning.toLowerCase().includes(query)) ||
        (item.raw_synonyms && item.raw_synonyms.toLowerCase().includes(query)) ||
        (item.raw_antonyms && item.raw_antonyms.toLowerCase().includes(query));

      // 2. Category Filter
      let matchCategory = true;
      const p = String(item.pos || '').toLowerCase();
      if (selectedFilter === 'BOOKMARKS') {
        matchCategory = bookmarkedWords.includes(item.word);
      } else if (selectedFilter === 'MASTERED') {
        matchCategory = item.isMastered;
      } else if (selectedFilter === 'VERBS') {
        matchCategory = p === 'v' || (p.includes('v') && !p.includes('adv'));
      } else if (selectedFilter === 'NOUNS') {
        matchCategory = p === 'n';
      } else if (selectedFilter === 'ADJECTIVES') {
        matchCategory = p === 'adj';
      } else if (selectedFilter === 'PREPOSITIONS') {
        matchCategory = p === 'prep' || (item.unit && item.unit.toLowerCase().includes('preposition'));
      } else if (selectedFilter === 'IDIOMS') {
        matchCategory = p === 'phrase' || p === 'idiom' || (item.unit && item.unit.toLowerCase().includes('idiom'));
      }

      return matchSearch && matchCategory;
    });
  }, [allVocabItems, searchTerm, selectedFilter, bookmarkedWords]);

  // Reset pagination on filter change
  useEffect(() => {
    setVisibleCount(40);
  }, [searchTerm, selectedFilter]);

  const toggleBookmark = (word) => {
    sound.playClick();
    const next = bookmarkedWords.includes(word)
      ? bookmarkedWords.filter(w => w !== word)
      : [...bookmarkedWords, word];
    setBookmarkedWords(next);
    try {
      localStorage.setItem('vocabmaster_bookmarks', JSON.stringify(next));
    } catch (e) {}
  };

  const handleSpeak = (text) => {
    if (!text) return;
    setSpeakingWord(text);
    sound.speak(text);
    setTimeout(() => {
      setSpeakingWord(prev => (prev === text ? null : prev));
    }, 1500);
  };

  const scrollToTop = () => {
    sound.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none pb-12 bg-[#0a0a0c] min-h-screen text-neutral-100 font-sans">
      {/* 1. ULTRA-COMPACT 2-ROW EDITORIAL HEADER */}
      <header 
        className="sticky top-0 z-40 w-full bg-[#0a0a0c] border-b border-neutral-800 px-3.5 pt-2 pb-2 space-y-2 shadow-sm"
        style={{ top: 0, paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0px))' }}
      >
        {/* Row 1: Back + Unified Search Input + Audio Pack Button */}
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={() => {
              sound.playClick();
              if (onBackToHub) onBackToHub();
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-white bg-[#1e293b] hover:bg-[#334155] rounded-xl transition active:scale-95 cursor-pointer shrink-0 font-mono text-xs font-bold"
            title="Back to Hub"
            aria-label="Back to Hub"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>HUB</span>
          </button>

          {/* Integrated Slim Search Bar */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${allVocabItems.length} words...`}
              className="w-full pl-8 pr-7 py-2 rounded-xl bg-[#1e293b] text-xs font-medium text-white placeholder-slate-400 focus:outline-none transition font-montserrat"
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

          {/* Offline Audio Pack Quick Launcher */}
          {onOpenAudioSettings && (
            <button
              onClick={onOpenAudioSettings}
              className="px-2.5 py-2 rounded-xl bg-[#1e293b] hover:bg-[#334155] active:scale-95 transition text-[11px] font-mono font-bold text-amber-300 flex items-center space-x-1 shrink-0 cursor-pointer"
              title="Offline Audio Pack Settings"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Audio</span>
            </button>
          )}
        </div>

        {/* Row 2: Horizontal Filter Chips Strip */}
        <div className="w-full flex items-center overflow-x-auto scrollbar-none whitespace-nowrap touch-pan-x py-0.5 space-x-1.5">
          {[
            { id: 'ALL', label: `All (${allVocabItems.length})` },
            { id: 'VERBS', label: 'Verbs' },
            { id: 'ADJECTIVES', label: 'Adjectives' },
            { id: 'NOUNS', label: 'Nouns' },
            { id: 'PREPOSITIONS', label: 'Prepositions' },
            { id: 'IDIOMS', label: 'Idioms' },
            { id: 'BOOKMARKS', label: `Saved (${bookmarkedWords.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setSelectedFilter(tab.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer font-montserrat ${
                selectedFilter === tab.id
                  ? 'bg-[#2563eb] text-white font-bold'
                  : 'bg-[#1e293b] text-slate-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* 2. DISTINCT, CLEARLY SEPARATED CARDS WITH FULL AUDIO SUPPORT */}
      <div className="w-full space-y-3.5 px-3.5 pt-3">
        {filteredItems.slice(0, visibleCount).map((item, idx) => {
          const isBookmarked = bookmarkedWords.includes(item.word);
          const isMainWordSpeaking = speakingWord === item.word;
          const pos = item.posInfo || getPosInfo(item.pos, item.word, item.meaning);
          const verbForms = item.verbForms;
          const cleanWordTitle = String(item.word || '').replace(/\s+/g, ' ').trim();

          return (
            <article
              key={item.id || `${item.word}_${idx}`}
              className="w-full bg-[#1e293b] rounded-2xl p-4.5 space-y-3 shadow-sm transition"
            >
              {/* SECTION 1: Header (Word Title, Tag & Actions) */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-700/60">
                <div 
                  onClick={() => handleSpeak(item.word)}
                  className="cursor-pointer group"
                  title="Tap to listen pronunciation"
                >
                  <h3 className={`font-montserrat text-xl sm:text-2xl font-bold tracking-tight leading-snug transition flex items-center space-x-2 ${
                    isMainWordSpeaking ? 'text-amber-300' : 'text-white group-hover:text-amber-200'
                  }`}>
                    <span>{cleanWordTitle}</span>
                  </h3>
                  <div className="flex items-center space-x-2 mt-1 text-xs text-slate-300">
                    <span className="font-medium text-white bg-[#0f172a] px-2.5 py-0.5 rounded-lg">
                      {pos.full}
                    </span>
                    <span>•</span>
                    <span className="text-slate-300">{item.tier}</span>
                    {item.ipa && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-slate-300">{item.ipa}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1.5 shrink-0 pt-0.5">
                  <button
                    onClick={() => handleSpeak(item.word)}
                    className={`w-8 h-8 rounded-xl bg-[#0f172a] hover:bg-[#182033] flex items-center justify-center transition cursor-pointer active:scale-90 ${
                      isMainWordSpeaking ? 'text-amber-300 animate-pulse' : 'text-slate-300 hover:text-white'
                    }`}
                    title="Listen Pronunciation"
                    aria-label="Listen Pronunciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleBookmark(item.word)}
                    className={`w-8 h-8 rounded-xl bg-[#0f172a] hover:bg-[#182033] flex items-center justify-center transition cursor-pointer active:scale-90 ${
                      isBookmarked
                        ? 'text-amber-400'
                        : 'text-slate-300 hover:text-white'
                    }`}
                    title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                    aria-label="Bookmark Word"
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* SECTION 2: Bengali Meaning & Verb Forms (With Audio on Forms) */}
              <div className="space-y-1">
                <p className="text-[15px] sm:text-base font-semibold text-neutral-100 leading-snug font-sans break-words">
                  {item.meaning}
                </p>

                {/* Verb Conjugation (Large & Clear) */}
                {verbForms && pos.short === 'VERB' && (
                  <div className="text-xs sm:text-sm font-mono text-neutral-300 pt-0.5 flex items-center flex-wrap gap-x-2 gap-y-1">
                    <span className="text-neutral-500 font-sans mr-0.5 font-medium">Forms:</span>
                    <button
                      onClick={() => handleSpeak(verbForms.v1)}
                      className={`hover:text-amber-300 hover:underline transition cursor-pointer font-semibold ${
                        speakingWord === verbForms.v1 ? 'text-amber-300' : 'text-neutral-200'
                      }`}
                      title={`Tap to listen ${verbForms.v1}`}
                    >
                      {verbForms.v1}
                    </button>
                    <span className="text-neutral-600 font-bold">•</span>
                    <button
                      onClick={() => handleSpeak(verbForms.v2)}
                      className={`hover:text-amber-300 hover:underline transition cursor-pointer font-semibold ${
                        speakingWord === verbForms.v2 ? 'text-amber-300' : 'text-neutral-200'
                      }`}
                      title={`Tap to listen ${verbForms.v2}`}
                    >
                      {verbForms.v2}
                    </button>
                    <span className="text-neutral-600 font-bold">•</span>
                    <button
                      onClick={() => handleSpeak(verbForms.v3)}
                      className={`hover:text-amber-300 hover:underline transition cursor-pointer font-semibold ${
                        speakingWord === verbForms.v3 ? 'text-amber-300' : 'text-neutral-200'
                      }`}
                      title={`Tap to listen ${verbForms.v3}`}
                    >
                      {verbForms.v3}
                    </button>
                  </div>
                )}
              </div>

              {/* SECTION 3: Synonyms & Antonyms (Editorial Layout, No Word Breaking) */}
              {(item.synonymsList?.length > 0 || item.antonymsList?.length > 0) && (
                <div className="pt-2.5 border-t border-neutral-800/80 space-y-2 text-xs sm:text-sm text-neutral-200">
                  {item.synonymsList && item.synonymsList.length > 0 && (
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className="font-bold text-neutral-400 uppercase tracking-wider text-[11px] shrink-0 font-mono mt-0.5">
                        SYNONYMS:
                      </span>
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-1 font-montserrat text-xs sm:text-sm font-medium text-white flex-1 min-w-0">
                        {item.synonymsList.map((syn, sIdx) => {
                          const isSynSpeaking = speakingWord === syn;
                          return (
                            <React.Fragment key={sIdx}>
                              <span
                                onClick={() => handleSpeak(syn)}
                                className={`cursor-pointer whitespace-nowrap hover:underline transition ${
                                  isSynSpeaking ? 'text-amber-300 font-bold' : 'hover:text-amber-300 text-white'
                                }`}
                                title="Tap to listen pronunciation"
                              >
                                {syn}
                              </span>
                              {sIdx < item.synonymsList.length - 1 && (
                                <span className="text-neutral-500 font-bold select-none">•</span>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {item.antonymsList && item.antonymsList.length > 0 && (
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className="font-bold text-neutral-400 uppercase tracking-wider text-[11px] shrink-0 font-mono mt-0.5">
                        ANTONYMS:
                      </span>
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-1 font-montserrat text-xs sm:text-sm font-medium text-white flex-1 min-w-0">
                        {item.antonymsList.map((ant, aIdx) => {
                          const isAntSpeaking = speakingWord === ant;
                          return (
                            <React.Fragment key={aIdx}>
                              <span
                                onClick={() => handleSpeak(ant)}
                                className={`cursor-pointer whitespace-nowrap hover:underline transition ${
                                  isAntSpeaking ? 'text-amber-300 font-bold' : 'hover:text-amber-300 text-white'
                                }`}
                                title="Tap to listen pronunciation"
                              >
                                {ant}
                              </span>
                              {aIdx < item.antonymsList.length - 1 && (
                                <span className="text-neutral-500 font-bold select-none">•</span>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 4: Example Sentence */}
              {item.sentence && (
                <div 
                  className={`bg-[#0f172a] border-l-4 border-amber-400 px-3.5 py-2.5 rounded-xl mt-2 space-y-1.5 transition ${
                    speakingWord === item.sentence ? 'bg-[#182033]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      Example
                    </span>
                    <button
                      onClick={() => handleSpeak(item.sentence)}
                      className="text-slate-400 hover:text-white transition cursor-pointer p-1 -mr-1 flex items-center space-x-1 text-xs"
                      title="Listen full sentence"
                      aria-label="Listen full sentence"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono">Full</span>
                    </button>
                  </div>
                  <p className="italic text-xs sm:text-sm text-slate-100 font-montserrat leading-relaxed">
                    “{item.sentence.split(/\s+/).map((word, wIdx) => {
                      const cleanW = word.replace(/[^a-zA-Z]/g, '');
                      const isWordSpeaking = speakingWord === cleanW;
                      return (
                        <span
                          key={wIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (cleanW) handleSpeak(cleanW);
                          }}
                          className={`cursor-pointer transition mr-1 inline-block ${
                            isWordSpeaking ? 'text-amber-300 font-bold underline' : 'hover:text-amber-300 hover:underline'
                          }`}
                          title={`Tap to listen "${cleanW}"`}
                        >
                          {word}
                        </span>
                      );
                    })}”
                  </p>
                  {item.sentence_meaning && (
                    <p className="text-xs text-slate-400 font-sans leading-normal pt-1 border-t border-slate-700/60">
                      {item.sentence_meaning}
                    </p>
                  )}
                </div>
              )}
            </article>
          );
        })}

        {/* Load More Button */}
        {visibleCount < filteredItems.length && (
          <div className="pt-2 pb-4">
            <button
              onClick={() => {
                sound.playClick();
                setVisibleCount(prev => prev + 40);
              }}
              className="w-full bg-[#131418] hover:bg-[#1c1d22] border border-neutral-800 text-neutral-300 font-mono text-xs uppercase tracking-wider py-3 rounded-none flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm transition active:scale-[0.99]"
            >
              <span>LOAD MORE WORDS ({filteredItems.length - visibleCount} REMAINING)</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="w-full p-12 text-center space-y-2">
            <p className="text-sm font-bold text-neutral-300 font-mono">No words found</p>
            <p className="text-xs text-neutral-500">Try changing your search term or filter category.</p>
          </div>
        )}
      </div>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-10 h-10 rounded-none bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white shadow-lg flex items-center justify-center cursor-pointer active:scale-90 transition z-40"
          title="Back to top"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}
    </div>
  );
}