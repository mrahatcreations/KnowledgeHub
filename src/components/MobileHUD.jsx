import React from 'react';
import { Star, Volume2, VolumeX, ArrowLeft, Trophy } from 'lucide-react';
import { sound } from '../audio/SoundSynthesizer';
import StarRating from './StarRating';

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
  const earnedCorrectStages = Array.isArray(stageStars) ? stageStars.filter(Boolean).length : 0;
  const currentEarnedStars = Number((earnedCorrectStages * 0.5).toFixed(1));
  const progressPercent = Math.min(100, Math.max(0, ((stageIndex) / effectiveTotalStages) * 100));

  const totalEarnedStars = Number(
    Object.values(levelStars || {}).reduce((sum, s) => {
      const num = Number(s) || 0;
      return sum + (num > 5 ? num * 0.5 : num);
    }, 0).toFixed(1)
  );
  const totalMasteredLevels = Object.values(levelStars || {}).filter(s => Number(s) >= 5 || Number(s) === 10).length;

  return (
    <header 
      className="sticky top-0 z-40 bg-[#0b0f19] border-b border-slate-800 text-white px-3.5 pb-2.5 shadow-sm select-none safe-top"
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)' }}
    >
      {/* Top Mobile Status Mini-Bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between gap-2">
        {/* Left Side: Back Arrow (In-Game) or Brand Badge (In-Map) */}
        {currentLevel ? (
          <button
            onClick={onBackToMap}
            className="h-9 px-3 flex items-center justify-center space-x-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 transition border border-slate-700 text-slate-200 shrink-0"
            title="Back to Map"
            aria-label="Back to Map"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs font-bold font-mono">Level {currentLevel.level_id}</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 border border-indigo-400/40 flex items-center justify-center font-black text-white text-sm shrink-0">
              V
            </div>
            <div className="flex flex-col shrink-0">
              <span className="font-bold text-sm tracking-tight text-white leading-tight">VocabMaster</span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider leading-none">201 Levels</span>
            </div>
          </div>
        )}

        {/* Center: 5-Star Meter with 0.5 per stage OR In-Map Stats */}
        {currentLevel ? (
          <div 
            className="flex items-center justify-center bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 shrink-0 select-none"
            title={`Stage ${stageIndex + 1}/${effectiveTotalStages} (Stars: ${currentEarnedStars}/5.0)`}
          >
            <StarRating stars={currentEarnedStars} maxStars={5} size="sm" />
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs font-bold shrink-0">
            {/* Total Stars Collected */}
            <div 
              className="flex items-center space-x-1.5 bg-amber-500/10 text-amber-400 px-2.5 py-1.5 rounded-xl border border-amber-500/20 shrink-0"
              title="Total Stars Collected"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
              <span className="font-mono text-xs leading-none">{String(totalEarnedStars).replace('.0', '')}</span>
            </div>

            {/* Mastered Levels */}
            <div 
              className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-1.5 rounded-xl border border-emerald-500/20 shrink-0"
              title="Mastered Levels"
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
            title={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isAudioMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Volume2 className="w-4 h-4 text-indigo-400 shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* In-Game 10-Stage Progress Bar Indicator with 5-Star scale */}
      {currentLevel && (
        <div className="max-w-md mx-auto w-full mt-2 pt-0.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1 px-0.5 leading-none whitespace-nowrap">
            <span className="text-indigo-300 font-medium">
              Stage {stageIndex + 1}/{effectiveTotalStages}
            </span>
            <span className="text-amber-300 flex items-center space-x-1 font-mono">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline shrink-0" />
              <span>{currentEarnedStars.toFixed(1).replace('.0', '')}/5 Stars (0.5/stage)</span>
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
