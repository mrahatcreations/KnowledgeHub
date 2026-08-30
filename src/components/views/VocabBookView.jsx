import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Volume2, 
  Bookmark, 
  BookmarkCheck, 
  BookOpen, 
  Star, 
  Sparkles, 
  Filter, 
  ArrowLeft, 
  Tag, 
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';
import { getPosInfo, getVerbForms } from '../../utils/grammarHelper';

const ALPHABET = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

export default function VocabBookView({ levels = [], levelStars = {}, onBackToHub }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL' | 'BOOKMARKS' | 'MASTERED' | 'VERBS' | 'NOUNS' | 'ADJECTIVES'
  const [speakingWord, setSpeakingWord] = useState(null);
  const [visibleCount, setVisibleCount] = useState(40);

  const [bookmarkedWords, setBookmarkedWords] = useState(() => {
    try {
      const saved = localStorage.getItem('vocabmaster_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

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

          list.push({
            ...it,
            levelId: lvl.level_id,
            levelTitle: lvl.title,
            synonymsList: syns,
            antonymsList: ants,
            verbForms: getVerbForms(it.word, it.pos),
            posInfo: getPosInfo(it.pos),
            isMastered: (levelStars[lvl.level_id] || 0) >= 5 || (levelStars[lvl.level_id] || 0) === 10
          });
        }
      });
    });

    // Sort alphabetically by English word (A to Z)
    return list.sort((a, b) => a.word.localeCompare(b.word));
  }, [levels, levelStars]);

  // Mastered words count
  const masteredCount = useMemo(() => {
    return allVocabItems.filter(it => it.isMastered).length;
  }, [allVocabItems]);

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

      // 2. Letter Filter
      const firstChar = item.word.charAt(0).toUpperCase();
      const matchLetter = selectedLetter === 'ALL' || firstChar === selectedLetter;

      // 3. Category Filter
      let matchCategory = true;
      if (selectedFilter === 'BOOKMARKS') {
        matchCategory = bookmarkedWords.includes(item.word);
      } else if (selectedFilter === 'MASTERED') {
        matchCategory = item.isMastered;
      } else if (selectedFilter === 'VERBS') {
        matchCategory = item.pos && String(item.pos).toLowerCase().includes('v') && !String(item.pos).toLowerCase().includes('adv');
      } else if (selectedFilter === 'NOUNS') {
        matchCategory = item.pos && String(item.pos).toLowerCase().includes('n');
      } else if (selectedFilter === 'ADJECTIVES') {
        matchCategory = item.pos && String(item.pos).toLowerCase().includes('adj');
      }

      return matchSearch && matchLetter && matchCategory;
    });
  }, [allVocabItems, searchTerm, selectedLetter, selectedFilter, bookmarkedWords]);

  // Reset pagination on filter change
  useEffect(() => {
    setVisibleCount(40);
  }, [searchTerm, selectedLetter, selectedFilter]);

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

  const handleSpeak = (word) => {
    setSpeakingWord(word);
    sound.speak(word);
    setTimeout(() => setSpeakingWord(null), 1200);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none pt-2 pb-16 px-3.5 animate-pop">
      {/* 1. TOP HEADER & SEARCH CARD */}
      <div 
        className="w-full bg-[#0e1626] border-2 border-slate-800 rounded-3xl p-4 shadow-[0_6px_0_#060a12] mb-3.5"
        style={{ marginTop: 'max(env(safe-area-inset-top, 0px), 4px)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => {
              sound.playClick();
              if (onBackToHub) onBackToHub();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 transition border border-slate-700 text-slate-200 cursor-pointer shadow-xs"
            title="Back to Game Hub"
            aria-label="Back to Game Hub"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="font-black text-xs text-white">HUB</span>
          </button>

          <div className="flex items-center space-x-1.5 bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/40 text-xs font-black">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>১,০০৫ শব্দকোষ</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-black text-white tracking-tight uppercase">VOCABULARY VAULT</h1>
          <span className="text-xs font-mono font-bold text-slate-400">
            <span className="text-amber-400 font-black">{filteredItems.length}</span> / {allVocabItems.length}
          </span>
        </div>
        <p className="text-xs font-semibold text-slate-400 mb-3">
          A-Z বর্ণানুক্রমিক শব্দার্থ, সমার্থক, বিপরীতার্থক ও গ্রামার রুলস
        </p>

        {/* Search Bar with Clear Button */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search word, meaning, synonym, or antonym..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-950/90 border-2 border-slate-700 text-xs sm:text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-black p-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. ALPHABETICAL A-Z SERIAL SELECTOR */}
      <div className="w-full mb-3">
        <div className="flex items-center justify-between px-1 mb-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-blue-400 flex items-center space-x-1">
            <Tag className="w-3 h-3 text-blue-400" />
            <span>ALPHABETICAL A-Z INDEX</span>
          </span>
          <span className="text-[10px] font-bold text-slate-400">
            {selectedLetter === 'ALL' ? 'All Letters' : `Letter '${selectedLetter}'`}
          </span>
        </div>

        <div className="w-full flex items-center space-x-1.5 overflow-x-auto px-1 py-1.5 scrollbar-none whitespace-nowrap touch-pan-x bg-slate-900/80 border border-slate-800 rounded-2xl">
          {ALPHABET.map((letter) => {
            const isSelected = selectedLetter === letter;
            return (
              <button
                key={letter}
                onClick={() => {
                  sound.playClick();
                  setSelectedLetter(letter);
                }}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black shrink-0 transition-all active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-[0_3px_0_#1d4ed8] border border-blue-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. GRAMMAR & SMART FILTER CHIPS */}
      <div className="w-full flex items-center space-x-1.5 overflow-x-auto px-1 pb-3 mb-1 scrollbar-none whitespace-nowrap touch-pan-x">
        <button
          onClick={() => {
            sound.playClick();
            setSelectedFilter('ALL');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
            selectedFilter === 'ALL'
              ? 'bg-indigo-600 text-white border border-indigo-400/50 shadow-xs'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All ({allVocabItems.length})
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setSelectedFilter('BOOKMARKS');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center space-x-1 cursor-pointer ${
            selectedFilter === 'BOOKMARKS'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
              : 'bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-800'
          }`}
        >
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span>Bookmarks ({bookmarkedWords.length})</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setSelectedFilter('MASTERED');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center space-x-1 cursor-pointer ${
            selectedFilter === 'MASTERED'
              ? 'bg-emerald-600 text-white font-black shadow-xs'
              : 'bg-slate-900 border border-slate-800 text-emerald-400 hover:bg-slate-800'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>Mastered ({masteredCount})</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setSelectedFilter('VERBS');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
            selectedFilter === 'VERBS'
              ? 'bg-blue-600 text-white font-black shadow-xs'
              : 'bg-slate-900 border border-slate-800 text-blue-300 hover:bg-slate-800'
          }`}
        >
          Verbs (V1/V2/V3)
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setSelectedFilter('NOUNS');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
            selectedFilter === 'NOUNS'
              ? 'bg-purple-600 text-white font-black shadow-xs'
              : 'bg-slate-900 border border-slate-800 text-purple-300 hover:bg-slate-800'
          }`}
        >
          Nouns
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setSelectedFilter('ADJECTIVES');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
            selectedFilter === 'ADJECTIVES'
              ? 'bg-teal-600 text-white font-black shadow-xs'
              : 'bg-slate-900 border border-slate-800 text-teal-300 hover:bg-slate-800'
          }`}
        >
          Adjectives
        </button>
      </div>

      {/* 4. VOCABULARY CARDS LIST */}
      <div className="w-full space-y-3">
        {filteredItems.slice(0, visibleCount).map((item, idx) => {
          const isBookmarked = bookmarkedWords.includes(item.word);
          const isSpeaking = speakingWord === item.word;
          const pos = item.posInfo || getPosInfo(item.pos);
          const verbForms = item.verbForms;

          return (
            <div
              key={item.id || idx}
              style={{ contentVisibility: 'auto', containIntrinsicSize: '150px 220px' }}
              className="w-full bg-[#0e1626] border-2 border-slate-800 rounded-3xl p-4 shadow-[0_5px_0_#060a12] flex flex-col space-y-3 transition hover:border-blue-500/50"
            >
              {/* Card Top: Word, Level Badge, Grammar Badge, Speaker & Bookmark */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <h3 className="text-xl font-black text-white font-mono tracking-tight">
                      {item.word}
                    </h3>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase ${pos.color}`}>
                      {pos.full}
                    </span>
                    {item.isMastered && (
                      <span className="flex items-center space-x-1 text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-black">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        <span>Mastered</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 mt-0.5">
                    Level {item.levelId} • {item.levelTitle || 'Vocabulary Unit'}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  {/* Speaker Pronunciation */}
                  <button
                    onClick={() => handleSpeak(item.word)}
                    className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all border active:scale-90 cursor-pointer ${
                      isSpeaking
                        ? 'bg-blue-600 border-blue-400 text-white animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-blue-400'
                    }`}
                    title="Listen Pronunciation"
                    aria-label="Listen Pronunciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  {/* Bookmark Toggle */}
                  <button
                    onClick={() => toggleBookmark(item.word)}
                    className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all border active:scale-90 cursor-pointer ${
                      isBookmarked
                        ? 'bg-amber-500/20 border-amber-400/50 text-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400'
                    }`}
                    title={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                    aria-label="Bookmark Word"
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Bengali Meaning Highlight Banner */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 flex items-center space-x-2">
                <span className="text-amber-400 font-bold text-xs uppercase shrink-0">অর্থ:</span>
                <span className="text-base font-bold text-amber-300 tracking-tight break-words">
                  {item.meaning}
                </span>
              </div>

              {/* Grammar Section: Verb Conjugation Forms (V1, V2, V3) */}
              {verbForms && (
                <div className="bg-blue-950/30 border border-blue-500/30 rounded-2xl p-2.5 space-y-1">
                  <div className="flex items-center space-x-1 text-[10px] font-black uppercase tracking-wider text-blue-300">
                    <Tag className="w-3 h-3 text-blue-400" />
                    <span>VERB CONJUGATION FORMS (ক্রিয়ার রূপ)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                    <div className="bg-slate-950/70 border border-blue-500/20 rounded-xl p-1.5">
                      <span className="text-[9px] font-black text-slate-400 block uppercase">V1 (Base)</span>
                      <span className="text-xs font-black text-blue-200 truncate block">{verbForms.v1}</span>
                    </div>
                    <div className="bg-slate-950/70 border border-blue-500/20 rounded-xl p-1.5">
                      <span className="text-[9px] font-black text-slate-400 block uppercase">V2 (Past)</span>
                      <span className="text-xs font-black text-blue-200 truncate block">{verbForms.v2}</span>
                    </div>
                    <div className="bg-slate-950/70 border border-blue-500/20 rounded-xl p-1.5">
                      <span className="text-[9px] font-black text-slate-400 block uppercase">V3 (Past Part.)</span>
                      <span className="text-xs font-black text-blue-200 truncate block">{verbForms.v3}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Synonyms Badges */}
              {item.synonymsList && item.synonymsList.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    <span>SYNONYMS (সমার্থক শব্দ):</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.synonymsList.map((syn, sIdx) => (
                      <span
                        key={sIdx}
                        onClick={() => sound.speak(syn)}
                        className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-xl text-xs font-bold font-mono cursor-pointer hover:bg-emerald-900/60 transition active:scale-95"
                        title="Tap to listen"
                      >
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Antonyms Badges */}
              {item.antonymsList && item.antonymsList.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
                    <span>ANTONYMS (বিপরীত শব্দ):</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.antonymsList.map((ant, aIdx) => (
                      <span
                        key={aIdx}
                        onClick={() => sound.speak(ant)}
                        className="bg-rose-950/60 border border-rose-500/40 text-rose-300 px-2.5 py-1 rounded-xl text-xs font-bold font-mono cursor-pointer hover:bg-rose-900/60 transition active:scale-95"
                        title="Tap to listen"
                      >
                        {ant}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Example Context Sentence */}
              {item.sentence && (
                <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300 italic leading-relaxed">
                  <span className="text-slate-400 font-bold not-italic">বাক্য প্রয়োগ: </span>
                  "{item.sentence}"
                </div>
              )}
            </div>
          );
        })}

        {/* Load More Button */}
        {visibleCount < filteredItems.length && (
          <button
            onClick={() => {
              sound.playClick();
              setVisibleCount(prev => prev + 40);
            }}
            className="w-full game-btn-3d bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-black text-xs uppercase py-3 rounded-2xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-md active:translate-y-1"
          >
            <span>LOAD MORE WORDS ({filteredItems.length - visibleCount} REMAINING)</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        )}

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="w-full bg-[#0e1626] border-2 border-slate-800 rounded-3xl p-8 text-center space-y-2">
            <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-black text-slate-300">No words found</p>
            <p className="text-xs text-slate-500">Try changing your search term or letter filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
