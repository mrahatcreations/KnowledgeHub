import React from 'react';
import { Star, Volume2, VolumeX, ArrowLeft, Trophy } from 'lucide-react';
import { sound } from '../audio/SoundSynthesizer';

export default function MobileHUD({ 
  currentLevel, 
  stageIndex = 0, 
  stageStars = [], 
  totalStages = 10, 
  isAudioMuted = false, 
  setIsAudioMuted, 
  onBackToMap, 
  levelStars = {}
}) {
  const toggleAudio = () => {
    const next = !isAudioMuted;
    if (setIsAudioMuted) setIsAudioMuted(next);
    sound.enabled = !next;
  };

  const effectiveTotalStages = totalStages || (stageStars && stageStars.length) || 10;
  const starsArray = Array.from({ length: effectiveTotalStages });
  const earnedStarsCount = Array.isArray(stageStars) ? stageStars.filter(Boolean).length : 0;
  const progressPercent = Math.min(100, Math.max(0, ((stageIndex) / effectiveTotalStages) * 100));

  const totalEarnedStars = Object.values(levelStars || {}).reduce((sum, s) => sum + (Number(s) || 0), 0);
  const totalMasteredLevels = Object.values(levelStars || {}).filter(s => s === 10 || s === 5).length;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white px-3 sm:px-4 py-2.5 shadow-sm select-none safe-top">
      {/* Top Mobile Status Mini-Bar */}
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Left Side: Back Arrow (In-Game) or Brand Badge (In-Map) */}
        {currentLevel ? (
          <button
            onClick={onBackToMap}
            className="h-9 px-3 flex items-center justify-center space-x-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 transition border border-slate-700 text-slate-200 shrink-0"
            title="লেভেল ম্যাপে ফিরে যান"
            aria-label="লেভেল ম্যাপে ফিরে যান"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs font-bold font-mono">লেভেল {currentLevel.level_id}</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 border border-indigo-400/40 flex items-center justify-center font-black text-white text-sm shrink-0">
              V
            </div>
            <div className="flex flex-col shrink-0">
              <span className="font-bold text-sm tracking-tight text-white leading-tight">VocabMaster</span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider leading-none">২০১টি লেভেল</span>
            </div>
          </div>
        )}

        {/* Center: In-Game 10-Star Node Step Meter OR In-Map Stats */}
        {currentLevel ? (
          <div 
            className="flex items-center justify-center gap-1 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 overflow-x-hidden shrink"
            title={`ধাপ ${stageIndex + 1}/${effectiveTotalStages} (স্টার: ${earnedStarsCount})`}
          >
            {starsArray.map((_, idx) => {
              const isPast = idx < stageIndex;
              const isEarned = isPast && Boolean(stageStars[idx]);
              const isCurrent = idx === stageIndex;

              return (
                <div key={idx} className="relative flex items-center justify-center shrink-0">
                  <Star
                    className={`w-3.5 h-3.5 transition-all duration-200 shrink-0 ${
                      isEarned
                        ? 'text-amber-400 fill-amber-400'
                        : isCurrent
                        ? 'text-indigo-400 fill-indigo-400/20 stroke-2'
                        : isPast
                        ? 'text-slate-600 stroke-1 opacity-50'
                        : 'text-slate-700 stroke-1'
                    }`}
                  />
                  {isCurrent && (
                    <span className="absolute -bottom-1 w-1 h-1 bg-indigo-400 rounded-full animate-ping" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs font-bold shrink-0">
            {/* Total Stars Collected */}
            <div 
              className="flex items-center space-x-1.5 bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-xl border border-amber-500/20 shrink-0"
              title="মোট সংগৃহীত স্টার"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
              <span className="font-mono text-xs leading-none">{totalEarnedStars}</span>
            </div>

            {/* Mastered Levels */}
            <div 
              className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-xl border border-emerald-500/20 shrink-0"
              title="মাস্টার করা লেভেল"
            >
              <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-mono text-xs leading-none">{totalMasteredLevels}</span>
            </div>
          </div>
        )}

        {/* Right Side: Sound Toggle */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={toggleAudio}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition active:scale-95 shrink-0"
            title={isAudioMuted ? 'শব্দ চালু করুন' : 'শব্দ বন্ধ করুন'}
            aria-label={isAudioMuted ? 'শব্দ চালু করুন' : 'শব্দ বন্ধ করুন'}
          >
            {isAudioMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Volume2 className="w-4 h-4 text-indigo-400 shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* In-Game 10-Stage Progress Bar Indicator */}
      {currentLevel && (
        <div className="max-w-md mx-auto w-full mt-2 pt-0.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1 px-0.5 leading-none whitespace-nowrap">
            <span className="text-indigo-300 font-medium">
              ধাপ {stageIndex + 1}/{effectiveTotalStages}
            </span>
            <span className="text-amber-300 flex items-center space-x-1 font-mono">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline shrink-0" />
              <span>{earnedStarsCount}/{effectiveTotalStages} স্টার</span>
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </header>
  );
}
