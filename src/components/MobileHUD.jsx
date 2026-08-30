import React from 'react';
import { Star, Flame, Diamond, Heart, Volume2, VolumeX, Settings, ArrowLeft } from 'lucide-react';
import { sound } from '../audio/SoundSynthesizer';

export default function MobileHUD({ 
  currentLevel, 
  stageIndex = 0, 
  stageStars = [], 
  totalStages = 10,
  isAudioMuted = false, 
  setIsAudioMuted, 
  onBackToMap, 
  onOpenSettings,
  streak = 5,
  gems = 240,
  lives = 5
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

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-lg border-b border-slate-800/80 text-white px-3 sm:px-4 py-2.5 shadow-xl select-none transition-all">
      {/* Top Mobile Status Mini-Bar */}
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Left Side: Back Arrow (In-Game) or Brand Badge (In-Map) */}
        {currentLevel ? (
          <button
            onClick={onBackToMap}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 transition border border-slate-700 text-slate-200 shrink-0"
            title="লেভেল থেকে প্রস্থান করুন"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-black font-mono">L{currentLevel.level_id}</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 border border-indigo-400 flex items-center justify-center font-black text-white text-base shadow-md shadow-indigo-500/20">
              V
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight text-white leading-none">VocabMaster</span>
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest leading-tight">Pro Game</span>
            </div>
          </div>
        )}

        {/* Center: In-Game 10-Star Node Step Meter OR In-Map Stats */}
        {currentLevel ? (
          <div 
            className="flex items-center justify-center space-x-0.5 sm:space-x-1 bg-slate-900/90 px-2 py-1 rounded-full border border-slate-700/80 shadow-inner overflow-x-hidden"
            title={`ধাপ ${stageIndex + 1} / ${effectiveTotalStages} (স্টার: ${earnedStarsCount})`}
          >
            {starsArray.map((_, idx) => {
              const isPast = idx < stageIndex;
              const isEarned = isPast && Boolean(stageStars[idx]);
              const isCurrent = idx === stageIndex;

              return (
                <div key={idx} className="relative flex items-center justify-center">
                  <Star
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-all duration-300 shrink-0 ${
                      isEarned
                        ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                        : isCurrent
                        ? 'text-indigo-400 fill-indigo-400/20 animate-pulse stroke-2 scale-110'
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
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs font-black">
            {/* Streak Flame */}
            <div 
              className="flex items-center space-x-1 bg-amber-500/15 text-amber-400 px-2 sm:px-2.5 py-1 rounded-xl border border-amber-500/30 shadow-xs"
              title="টানা অনুশীলনের স্ট্রিক"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-400 animate-bounce" />
              <span className="font-mono text-xs">{streak}</span>
            </div>

            {/* Gems */}
            <div 
              className="flex items-center space-x-1 bg-cyan-500/15 text-cyan-400 px-2 sm:px-2.5 py-1 rounded-xl border border-cyan-500/30 shadow-xs"
              title="অর্জিত রত্ন (Gems)"
            >
              <Diamond className="w-3.5 h-3.5 fill-cyan-400" />
              <span className="font-mono text-xs">{gems}</span>
            </div>

            {/* Lives */}
            <div 
              className="flex items-center space-x-1 bg-rose-500/15 text-rose-400 px-2 sm:px-2.5 py-1 rounded-xl border border-rose-500/30 shadow-xs"
              title="জীবন / হার্টস"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-400" />
              <span className="font-mono text-xs">{lives}</span>
            </div>
          </div>
        )}

        {/* Right Side: Sound Toggle & Settings */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={toggleAudio}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 transition active:scale-95"
            title={isAudioMuted ? 'শব্দ চালু করুন' : 'শব্দ বন্ধ করুন'}
          >
            {isAudioMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          {!currentLevel && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 transition active:scale-95"
              title="সেটিংস ও ডেটাবেজ সিঙ্ক"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* In-Game 10-Stage Progress Bar Indicator */}
      {currentLevel && (
        <div className="max-w-md mx-auto w-full mt-2 pt-0.5">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1 px-0.5">
            <span className="text-indigo-300">
              ধাপ {stageIndex + 1} / {effectiveTotalStages}
            </span>
            <span className="text-amber-300 flex items-center space-x-1 font-mono">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline shrink-0" />
              <span>{earnedStarsCount} / {effectiveTotalStages} স্টার</span>
            </span>
          </div>
          <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(99,102,241,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </header>
  );
}

