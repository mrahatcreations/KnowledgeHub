import React, { useState, useMemo } from 'react';
import { Search, Volume2, Bookmark, BookmarkCheck, BookOpen, Star, Sparkles, Filter, ChevronDown, ArrowLeft } from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

export default function VocabBookView({ levels, levelStars, onBackToHub }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('ALL');
  const [bookmarkedWords, setBookmarkedWords] = useState(() => {
    try {
      const saved = localStorage.getItem('vocabmaster_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Extract all vocabulary words across levels
  const allVocabItems = useMemo(() => {
    const list = [];
    const seen = new Set();
    levels.forEach(lvl => {
      (lvl.items || []).forEach(it => {
        if (it && it.word && !seen.has(it.word.toLowerCase())) {
          seen.add(it.word.toLowerCase());
          list.push({
            ...it,
            levelId: lvl.level_id,
            levelTitle: lvl.title,
            isMastered: (levelStars[lvl.level_id] || 0) >= 5 || (levelStars[lvl.level_id] || 0) === 10
          });
        }
      });
    });
    return list;
  }, [levels, levelStars]);

  const units = ['ALL', ...new Set(levels.map(l => l.unit || l.category).filter(Boolean))];

  const filteredItems = useMemo(() => {
    return allVocabItems.filter(item => {
      const matchSearch = 
        item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.meaning && item.meaning.includes(searchTerm)) ||
        (item.raw_synonyms && item.raw_synonyms.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchUnit = selectedUnit === 'ALL' || (item.unit || item.category) === selectedUnit;

      return matchSearch && matchUnit;
    });
  }, [allVocabItems, searchTerm, selectedUnit]);

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

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-12 pt-2 animate-pop">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => {
              sound.playClick();
              if (onBackToHub) onBackToHub();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 transition border border-slate-700 text-slate-200 cursor-pointer shadow-xs"
            title="Back to Subject Hub"
            aria-label="Back to Subject Hub"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-bold text-xs text-white">Back to Hub</span>
          </button>

          <div className="flex items-center space-x-1.5 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Word Vault</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">Vocabulary Vault</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Total <span className="text-amber-400 font-bold font-mono">{allVocabItems.length}</span> English vocabulary words
        </p>

        {/* Search Input Bar */}
        <div className="relative mt-3">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search English words, meanings, or synonyms..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs sm:text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Unit Filter Pills - Non-clipping */}
      <div className="w-full flex items-center space-x-2 overflow-x-auto px-1 py-1.5 mb-4 scrollbar-none whitespace-nowrap touch-pan-x">
        {units.map((u, i) => (
          <button
            key={i}
            onClick={() => {
              setSelectedUnit(u);
              sound.playClick();
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all active:scale-95 ${
              selectedUnit === u
                ? 'bg-indigo-600 text-white border border-indigo-400/50 shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {u === 'ALL' ? 'All Words' : u.replace(/Image\s*(\d+):?/i, 'Unit $1').replace(/Unit-(\d+)/i, 'Unit $1')}
          </button>
        ))}
      </div>

      {/* Word Cards List */}
      <div className="space-y-2.5">
        {filteredItems.slice(0, 50).map((item, idx) => {
          const isBookmarked = bookmarkedWords.includes(item.word);
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg hover:border-indigo-500/50 transition-all flex flex-col space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-black text-white font-mono tracking-tight">
                    {item.word}
                  </h3>
                  {item.pos && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                      {item.pos}
                    </span>
                  )}
                  {item.isMastered && (
                    <span className="flex items-center space-x-0.5 text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-lg text-[10px] font-black border border-amber-500/30">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>Mastered</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => sound.speak(item.word)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 transition active:scale-90"
                    title="Listen pronunciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleBookmark(item.word)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition active:scale-90"
                    title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 fill-amber-400" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-base font-bold text-amber-300">
                {item.meaning}
              </div>

              {item.raw_synonyms && (
                <div className="text-xs text-slate-300 pt-1 border-t border-slate-800/80">
                  <span className="text-indigo-400 font-bold">Synonyms: </span>
                  {item.raw_synonyms}
                </div>
              )}

              {item.raw_antonyms && (
                <div className="text-xs text-slate-400">
                  <span className="text-rose-400 font-bold">Antonyms: </span>
                  {item.raw_antonyms}
                </div>
              )}
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">
            No words found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
