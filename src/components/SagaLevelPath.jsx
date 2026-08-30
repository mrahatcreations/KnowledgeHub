import React, { useState } from 'react';
import { Star, Lock, Trophy, Sparkles, Check, Flame, Gift, Crown, Award, ChevronRight } from 'lucide-react';
import { sound } from '../audio/SoundSynthesizer';

export default function SagaLevelPath({ levels, unlockedLevel, levelStars, onSelectLevel }) {
  const [selectedUnit, setSelectedUnit] = useState('ALL');

  const units = ['ALL', ...new Set(levels.map(l => l.unit || l.category).filter(Boolean))];
  const filteredLevels = selectedUnit === 'ALL' ? levels : levels.filter(l => (l.unit || l.category) === selectedUnit);

  const totalMastered = Object.values(levelStars).filter(s => s === 5).length;
  const totalStarsEarned = Object.values(levelStars).reduce((sum, s) => sum + s, 0);

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-32 pt-3 flex flex-col items-center select-none">
      {/* Top Banner / Progress Trophy Card */}
      <div className="w-full bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 rounded-3xl p-4 border border-indigo-500/30 mb-5 shadow-2xl flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>শব্দভাণ্ডার অভিযান</span>
          </div>
          <div className="text-sm font-black text-white flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span>দক্ষতা অর্জন: {totalMastered} / {levels.length} লেভেল</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            মোট সংগৃহীত স্টার: <span className="text-amber-400 font-bold font-mono">{totalStarsEarned}</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-amber-500/10 border border-amber-400/30 px-3 py-2 rounded-2xl text-amber-300">
          <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span className="text-[10px] font-black mt-0.5">৫-স্টার লক্ষ্য</span>
        </div>
      </div>

      {/* Unit Filter Horizontal Pills */}
      <div className="w-full flex items-center space-x-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {units.slice(0, 10).map((u, i) => (
          <button
            key={i}
            onClick={() => {
              setSelectedUnit(u);
              sound.playClick();
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all shadow-md active:scale-95 ${
              selectedUnit === u
                ? 'bg-indigo-600 text-white border-2 border-indigo-400 shadow-indigo-500/30 scale-105'
                : 'bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {u === 'ALL' 
              ? 'সব লেভেল' 
              : u.replace(/Image\s*(\d+):?/i, 'ইউনিট $1').replace(/Unit-(\d+)/i, 'ইউনিট $1')}
          </button>
        ))}
      </div>

      {/* Vertical Winding Saga Path */}
      <div className="relative w-full flex flex-col items-center space-y-9 py-4">
        {filteredLevels.map((lvl, index) => {
          const isUnlocked = lvl.level_id <= unlockedLevel;
          const isCurrent = lvl.level_id === unlockedLevel;
          const stars = levelStars[lvl.level_id] || 0;
          const isMastered = stars === 5;
          const isMilestone = lvl.level_id % 5 === 0;

          // S-Curve Winding Calculation (Mobile Math for Duolingo/Candy Crush snake layout)
          const curveOffsets = [0, 48, 88, 48, 0, -48, -88, -48];
          const xOffset = curveOffsets[index % curveOffsets.length];

          return (
            <React.Fragment key={lvl.level_id}>
              {/* Milestone Chest / Reward Checkpoint every 5 levels */}
              {isMilestone && index > 0 && (
                <div 
                  style={{ transform: `translateX(${xOffset * 0.4}px)` }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-amber-500/20 via-indigo-900/40 to-amber-500/20 border border-amber-500/40 px-4 py-2 rounded-2xl text-amber-300 text-xs font-black shadow-lg my-1 animate-float"
                >
                  <Gift className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span>মাইলস্টোন রিওয়ার্ড #{lvl.level_id / 5} (+৫০ Gems)</span>
                </div>
              )}

              <div
                style={{ transform: `translateX(${xOffset}px)` }}
                className="relative flex flex-col items-center transition-transform duration-300"
              >
                {/* Level 3D Node Button */}
                <button
                  onClick={() => {
                    if (isUnlocked) {
                      sound.playClick();
                      onSelectLevel(lvl);
                    }
                  }}
                  disabled={!isUnlocked}
                  className={`relative w-20 h-20 rounded-3xl flex flex-col items-center justify-center font-black transition-all active:scale-95 game-btn-3d ${
                    isMastered
                      ? 'game-btn-amber text-amber-950 ring-4 ring-amber-400/30'
                      : isCurrent
                      ? 'game-btn-indigo text-white ring-4 ring-indigo-400/40 animate-pulse-glow'
                      : isUnlocked
                      ? 'game-btn-slate text-white'
                      : 'bg-slate-900/60 border-2 border-slate-800 text-slate-600 cursor-not-allowed shadow-none'
                  }`}
                >
                  {/* Mastered Crown Badge */}
                  {isMastered && (
                    <div className="absolute -top-3.5 bg-gradient-to-tr from-amber-500 to-amber-300 border-2 border-white rounded-full p-1 shadow-lg">
                      <Crown className="w-4 h-4 fill-amber-950 text-amber-950" />
                    </div>
                  )}

                  {/* Node Content */}
                  {isUnlocked ? (
                    <>
                      <span className="text-2xl font-black font-mono leading-none tracking-tight">
                        {lvl.level_id}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider opacity-90 mt-1">
                        LEVEL
                      </span>
                    </>
                  ) : (
                    <Lock className="w-6 h-6 text-slate-600" />
                  )}
                </button>

                {/* 5-Star Indicator Container */}
                <div className="flex items-center space-x-1 mt-2.5 bg-slate-900/95 px-2.5 py-1 rounded-full border border-slate-800 shadow-md">
                  {[0, 1, 2, 3, 4].map(s => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 transition-all ${
                        s < stars 
                          ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]' 
                          : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>

                {/* Current Active Level Tooltip Indicator */}
                {isCurrent && (
                  <div className="absolute -bottom-7 whitespace-nowrap bg-indigo-600 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-xl border border-indigo-400 animate-bounce">
                    বর্তমান লেভেল
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

