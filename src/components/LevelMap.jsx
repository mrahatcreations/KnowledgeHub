import React, { useState } from 'react';
import { Star, Lock, Play, CheckCircle2, Sparkles, Filter } from 'lucide-react';
import { sound } from '../audio/SoundSynthesizer';

export default function LevelMap({ levels, unlockedLevel, levelStars, onSelectLevel }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', ...new Set(levels.map(l => l.category).filter(Boolean))];

  const filteredLevels = selectedCategory === 'ALL'
    ? levels
    : levels.filter(l => l.category === selectedCategory);

  const totalMastered = Object.values(levelStars).filter(s => s === 5).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Banner / Stats */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Vocabulary Journey (Interactive Learning)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">ইংরেজি ভোকাবুলারি জার্নি</h2>
          <p className="text-sm text-indigo-100 mt-2 max-w-md">
            প্রতিটি লেভেলে ৫টি ধাপ রয়েছে। পরবর্তী লেভেল আনলক করতে ১ম সুযোগেই সবকটি ধাপ সঠিক করে ৫-স্টার অর্জন করুন!
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center min-w-[150px]">
          <span className="text-xs text-indigo-200 uppercase font-semibold">Mastered (৫-স্টার)</span>
          <div className="text-3xl font-black text-amber-300 mt-0.5">
            {totalMastered} <span className="text-sm font-normal text-white">/ {levels.length}</span>
          </div>
          <div className="flex items-center justify-center space-x-1 mt-1 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="text-[11px] font-bold text-indigo-100">5-Star Required</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              sound.playClick();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat === 'ALL' ? 'সব ক্যাটাগরি' : cat}
          </button>
        ))}
      </div>

      {/* Level Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredLevels.map((lvl) => {
          const isUnlocked = lvl.level_id <= unlockedLevel;
          const stars = levelStars[lvl.level_id] || 0;
          const isMastered = stars === 5;

          return (
            <div
              key={lvl.level_id}
              onClick={() => {
                if (isUnlocked) {
                  sound.playClick();
                  onSelectLevel(lvl);
                }
              }}
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between relative overflow-hidden ${
                isUnlocked
                  ? 'bg-white border-slate-200 hover:border-indigo-500 hover:shadow-lg cursor-pointer'
                  : 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    isUnlocked ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {lvl.category || 'Vocabulary'}
                  </span>

                  {isMastered ? (
                    <span className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mastered</span>
                    </span>
                  ) : !isUnlocked ? (
                    <Lock className="w-4 h-4 text-slate-400" />
                  ) : null}
                </div>

                <h3 className="text-base font-bold text-slate-800 mt-3">{lvl.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{lvl.unit || ''}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s < stars ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>

                <span className={`text-xs font-bold flex items-center space-x-1 ${
                  isUnlocked ? 'text-indigo-600' : 'text-slate-400'
                }`}>
                  {isUnlocked && <Play className="w-3 h-3 fill-indigo-600" />}
                  <span>{isUnlocked ? 'Play' : 'Locked'}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
