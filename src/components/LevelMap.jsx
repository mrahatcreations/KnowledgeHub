import React, { useState } from 'react';
import { Star, Lock, Play, CheckCircle2, Sparkles, Filter, Crown } from 'lucide-react';
import { sound } from '../audio/SoundSynthesizer';

export default function LevelMap({ levels, unlockedLevel, levelStars, onSelectLevel }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', ...new Set(levels.map(l => l.category || l.unit).filter(Boolean))];

  const filteredLevels = selectedCategory === 'ALL'
    ? levels
    : levels.filter(l => (l.category || l.unit) === selectedCategory);

  const totalMastered = Object.values(levelStars).filter(s => s >= 10 || s === 5).length;
  const totalStarsEarned = Object.values(levelStars).reduce((sum, s) => sum + s, 0);

  const formatCategoryName = (cat) => {
    if (cat === 'ALL') return 'সব ক্যাটাগরি';
    const match = cat.match(/(?:Unit|Image)\s*[-:]?\s*(\d+)/i);
    if (match) {
      return `ইউনিট ${match[1]}`;
    }
    return cat;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-3 pb-28 sm:pb-32 select-none">
      {/* Top Banner / Stats */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 rounded-3xl p-5 sm:p-7 border border-indigo-500/30 shadow-2xl mb-6 sm:mb-8 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>শব্দভাণ্ডার অভিযান (Grid Overview)</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">ইংরেজি ভোকাবুলারি জার্নি</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md">
            প্রতিটি লেভেলে ১০টি আকর্ষণীয় স্টেজ রয়েছে। ১ম সুযোগেই সবগুলো স্টেজ সঠিক করে ১০-স্টার অর্জন করুন এবং নতুন লেভেল আনলক করুন!
          </p>
        </div>

        <div className="flex sm:flex-col items-center justify-center gap-3 sm:gap-1 bg-amber-500/10 border border-amber-400/30 px-5 py-3.5 rounded-2xl text-center min-w-[140px] shrink-0">
          <Crown className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
          <div>
            <span className="text-[11px] text-amber-300 uppercase font-bold tracking-wider">মাস্টার লেভেল</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              {totalMastered} <span className="text-xs font-normal text-slate-400">/ {levels.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="w-full flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-3 mb-6 scrollbar-none whitespace-nowrap touch-pan-x">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
        {categories.map((cat, i) => (
          <button
            key={i}
            onClick={() => {
              setSelectedCategory(cat);
              sound.playClick();
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap shrink-0 transition-all shadow-md active:scale-95 ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white border-2 border-indigo-400 shadow-indigo-500/30 scale-105'
                : 'bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {formatCategoryName(cat)}
          </button>
        ))}
      </div>

      {/* Level Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
        {filteredLevels.map((lvl) => {
          const isUnlocked = lvl.level_id <= unlockedLevel;
          const isCurrent = lvl.level_id === unlockedLevel;
          const stars = levelStars[lvl.level_id] || 0;
          const isMastered = stars >= 10 || stars === 5;

          return (
            <div
              key={lvl.level_id}
              onClick={() => {
                if (isUnlocked) {
                  sound.playClick();
                  onSelectLevel(lvl);
                }
              }}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between relative overflow-hidden ${
                isMastered
                  ? 'bg-slate-900/90 border-amber-500/40 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10 cursor-pointer'
                  : isCurrent
                  ? 'bg-slate-900/90 border-indigo-500 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/20 ring-2 ring-indigo-400/30 cursor-pointer'
                  : isUnlocked
                  ? 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/60 hover:shadow-md cursor-pointer'
                  : 'bg-slate-950/60 border-slate-900 opacity-60 cursor-not-allowed'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    isUnlocked ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60' : 'bg-slate-900 text-slate-500'
                  }`}>
                    {lvl.category || 'Vocabulary'}
                  </span>

                  {isMastered ? (
                    <span className="flex items-center space-x-1 text-amber-400 bg-amber-500/10 border border-amber-400/30 px-2 py-0.5 rounded-full text-xs font-bold">
                      <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>মাস্টার্ড</span>
                    </span>
                  ) : !isUnlocked ? (
                    <Lock className="w-4 h-4 text-slate-500" />
                  ) : null}
                </div>

                <h3 className="text-base font-bold text-white mt-3 flex items-center justify-between">
                  <span>{lvl.title}</span>
                  {isCurrent && (
                    <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                      বর্তমান
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 mt-1 break-words">{lvl.unit || ''}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                {/* 10-Star Indicator */}
                <div className="flex items-center space-x-1 bg-slate-950/80 px-2.5 py-1 rounded-full border border-slate-800">
                  <Star
                    className={`w-3.5 h-3.5 shrink-0 ${
                      stars > 0 ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]' : 'text-slate-700'
                    }`}
                  />
                  <span className={`text-xs font-mono font-black ${stars >= 10 ? 'text-amber-400' : stars > 0 ? 'text-slate-200' : 'text-slate-600'}`}>
                    {stars}/10
                  </span>
                </div>

                <span className={`text-xs font-bold flex items-center space-x-1 ${
                  isUnlocked ? 'text-indigo-400' : 'text-slate-500'
                }`}>
                  {isUnlocked && <Play className="w-3 h-3 fill-indigo-400 text-indigo-400" />}
                  <span>{isUnlocked ? 'খেলুন' : 'লকড'}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
