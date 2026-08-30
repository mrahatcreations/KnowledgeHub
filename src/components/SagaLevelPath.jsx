import React, { useState } from 'react';
import { Star, Lock, Trophy, Sparkles, Gift, Crown } from 'lucide-react';
import { sound } from '../audio/SoundSynthesizer';

export default function SagaLevelPath({ levels, unlockedLevel, levelStars, onSelectLevel }) {
  const [selectedUnit, setSelectedUnit] = useState('ALL');

  const units = ['ALL', ...new Set(levels.map(l => l.unit || l.category).filter(Boolean))];
  const filteredLevels = selectedUnit === 'ALL' ? levels : levels.filter(l => (l.unit || l.category) === selectedUnit);

  const totalMastered = Object.values(levelStars).filter(s => Number(s) >= 5 || Number(s) === 10).length;
  const totalStarsEarned = Number(
    Object.values(levelStars).reduce((sum, s) => {
      const num = Number(s) || 0;
      return sum + (num > 5 ? num * 0.5 : num);
    }, 0).toFixed(1)
  );

  const formatUnitName = (u) => {
    if (u === 'ALL') return 'সব লেভেল';
    const match = u.match(/(?:Unit|Image)\s*[-:]?\s*(\d+)/i);
    if (match) {
      return `ইউনিট ${match[1]}`;
    }
    return u;
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-28 sm:pb-32 pt-3 flex flex-col items-center select-none">
      {/* Top Banner / Progress Trophy Card */}
      <div className="w-full bg-slate-900/90 rounded-2xl p-4 border border-slate-800 mb-4 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>শব্দভাণ্ডার অভিযান</span>
          </div>
          <div className="text-sm font-bold text-white flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span>দক্ষতা অর্জন: {totalMastered} / {levels.length} লেভেল</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            মোট সংগৃহীত স্টার: <span className="text-amber-400 font-bold font-mono">{String(totalStarsEarned).replace('.0', '')}</span> / {levels.length * 5}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl text-amber-300 shrink-0">
          <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span className="text-[10px] font-bold mt-0.5">৫-স্টার লক্ষ্য</span>
        </div>
      </div>

      {/* Unit Filter Horizontal Pills - Padded and non-clipping */}
      <div className="w-full flex items-center space-x-2 overflow-x-auto px-1 py-1.5 mb-5 scrollbar-none whitespace-nowrap touch-pan-x">
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
            {formatUnitName(u)}
          </button>
        ))}
      </div>

      {/* Vertical Winding Saga Path */}
      <div className="relative w-full flex flex-col items-center space-y-8 sm:space-y-9 py-2">
        {filteredLevels.map((lvl, index) => {
          const isUnlocked = lvl.level_id <= unlockedLevel;
          const isCurrent = lvl.level_id === unlockedLevel;
          const rawStars = levelStars[lvl.level_id] || 0;
          const displayStars = rawStars > 5 ? Number((rawStars * 0.5).toFixed(1)) : Number(Number(rawStars).toFixed(1));
          const isMastered = displayStars >= 5.0;
          const isMilestone = lvl.level_id % 5 === 0;

          // S-Curve Winding Calculation (Clamped to [-36px, +36px] for seamless mobile layout down to 320px)
          const curveOffsets = [0, 24, 36, 24, 0, -24, -36, -24];
          const xOffset = curveOffsets[index % curveOffsets.length];

          return (
            <React.Fragment key={lvl.level_id}>
              {/* Milestone Chest / Reward Checkpoint every 5 levels */}
              {isMilestone && index > 0 && (
                <div 
                  style={{ transform: `translateX(${xOffset * 0.4}px)` }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-amber-500/15 via-slate-900/95 to-amber-500/15 border border-amber-500/40 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-amber-300 text-xs font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)] my-1 animate-float"
                >
                  <Gift className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>মাইলস্টোন রিওয়ার্ড #{lvl.level_id / 5} (+৫০ Gems)</span>
                </div>
              )}

              <div
                style={{ transform: `translateX(${xOffset}px)` }}
                className="relative flex flex-col items-center transition-transform duration-300"
              >
                {/* Level Node Button - 72px x 72px on mobile (w-18 h-18 sm:w-20 sm:h-20) */}
                <button
                  onClick={() => {
                    if (isUnlocked) {
                      sound.playClick();
                      onSelectLevel(lvl);
                    }
                  }}
                  disabled={!isUnlocked}
                  className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center font-black transition-all active:scale-95 game-btn-3d ${
                    isMastered
                      ? 'game-btn-amber text-amber-950 animate-gold-glow'
                      : isCurrent
                      ? 'game-btn-indigo text-white animate-pulse-glow ring-2 ring-indigo-400/60'
                      : isUnlocked
                      ? 'game-btn-slate text-white hover:border-indigo-400/50'
                      : 'bg-slate-900/60 border border-slate-800 text-slate-600 cursor-not-allowed shadow-none'
                  }`}
                >
                  {/* Mastered Crown Badge */}
                  {isMastered && (
                    <div className="absolute -top-2.5 sm:-top-3 bg-amber-400 border border-amber-200 rounded-full p-1 shadow-[0_0_8px_rgba(251,191,36,0.6)]">
                      <Crown className="w-3.5 h-3.5 fill-amber-950 text-amber-950" />
                    </div>
                  )}

                  {/* Node Content */}
                  {isUnlocked ? (
                    <>
                      <span className="text-xl sm:text-2xl font-black font-mono leading-none tracking-tight">
                        {lvl.level_id}
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider opacity-90 mt-0.5 sm:mt-1">
                        LEVEL
                      </span>
                    </>
                  ) : (
                    <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
                  )}
                </button>

                {/* 5-Star Indicator Container Centered Under Node */}
                <div className="flex items-center justify-center space-x-1 mt-2 bg-slate-900/95 px-2.5 py-0.5 rounded-full border border-slate-800 shadow-sm">
                  <Star
                    className={`w-3 h-3 transition-all shrink-0 ${
                      displayStars > 0
                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]'
                        : 'text-slate-700'
                    }`}
                  />
                  <span className={`text-[10px] font-mono font-bold tracking-tight ${displayStars >= 5 ? 'text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.6)]' : displayStars > 0 ? 'text-slate-200' : 'text-slate-600'}`}>
                    {String(displayStars).replace('.0', '')}/5
                  </span>
                </div>

                {/* Current Active Level Tooltip Indicator */}
                {isCurrent && (
                  <div className="absolute -bottom-6 whitespace-nowrap bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.6)] border border-indigo-300 animate-bounce pointer-events-none z-10">
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
