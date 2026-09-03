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
      className="sticky top-0 z-40 bg-[#0a0a0c] border-b border-neutral-800 text-white px-3 pb-2 shadow-sm select-none safe-top"
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 6px)' }}
    >
      {/* Top Mobile Status Mini-Bar (Row 1) */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between gap-2">
        {/* Left Side: Back Arrow (In-Game) or Brand Badge (In-Map) */}
        {currentLevel ? (
          <button
            onClick={onBackToMap}
            className="h-8 px-3 flex items-center justify-center space-x-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] active:scale-95 transition text-white shrink-0 cursor-pointer"
            title="Back to Map"
            aria-label="Back to Map"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-xs font-bold font-mono tracking-wide">LVL {currentLevel.level_id}</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#2563eb] flex items-center justify-center font-black text-white text-xs shrink-0">
              K
            </div>
            <div className="flex flex-col shrink-0">
              <span className="font-bold text-xs tracking-tight text-white leading-tight uppercase font-mono">Knowledge Hub</span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none">English • 201 Levels</span>
            </div>
          </div>
        )}

        {/* Center: 5-Star Meter with 0.5 per stage OR In-Map Stats */}
        {currentLevel ? (
          <div 
            className="flex items-center justify-center bg-[#1e293b] px-2.5 py-1 rounded-lg shrink-0 select-none"
            title={`Stage ${stageIndex + 1}/${effectiveTotalStages} (${currentEarnedStars}/5.0 Stars)`}
          >
            <StarRating stars={currentEarnedStars} maxStars={5} size="sm" />
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs font-bold shrink-0">
            {/* Total Stars Collected */}
            <div 
              className="flex items-center space-x-1 bg-[#1e293b] text-amber-400 px-2.5 py-1 rounded-lg shrink-0"
              title="Total Stars Collected"
            >
              <Star className="w-3 h-3 fill-amber-400 shrink-0" />
              <span className="font-mono text-xs leading-none font-bold text-white">{String(totalEarnedStars).replace('.0', '')}</span>
            </div>

            {/* Mastered Levels */}
            <div 
              className="flex items-center space-x-1 bg-[#1e293b] text-emerald-400 px-2.5 py-1 rounded-lg shrink-0"
              title="Mastered Levels"
            >
              <Trophy className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="font-mono text-xs leading-none font-bold text-white">{totalMasteredLevels}</span>
            </div>
          </div>
        )}

        {/* Right Side: Sound Toggle */}
        <div className="flex items-center shrink-0">
          <button
            onClick={toggleAudio}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1e293b] hover:bg-[#334155] text-white transition active:scale-95 shrink-0 cursor-pointer"
            title={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isAudioMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-white shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* In-Game 10-Stage Progress Bar Indicator */}
      {currentLevel && (
        <div className="max-w-md mx-auto w-full mt-2 pt-0.5">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1 px-0.5 leading-none font-mono">
            <span className="text-blue-300 font-semibold tracking-wider">
              STAGE {stageIndex + 1}/{effectiveTotalStages}
            </span>
            <span className="text-amber-400 flex items-center gap-1 font-bold">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 inline shrink-0" />
              <span className="text-white">{currentEarnedStars.toFixed(1).replace('.0', '')} / 5.0 STARS</span>
            </span>
          </div>
          <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#2563eb] h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </header>
  );
}
