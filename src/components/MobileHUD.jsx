import React from 'react';
import { Star, Flame, Diamond, Heart, Volume2, VolumeX, Settings, ArrowLeft, Shield } from 'lucide-react';
import { sound } from '../audio/SoundSynthesizer';

export default function MobileHUD({ 
  currentLevel, 
  stageIndex, 
  stageStars, 
  isAudioMuted, 
  setIsAudioMuted, 
  onBackToMap, 
  onOpenSettings,
  streak = 5,
  gems = 240,
  lives = 5
}) {
  const toggleAudio = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    sound.enabled = !next;
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-lg border-b border-slate-800/80 text-white px-3 sm:px-4 py-2.5 shadow-xl transition-all">
      {/* Top Mobile Status Mini-Bar */}
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Left Side: Back Arrow (In-Game) or Brand/Rank Badge (In-Map) */}
        {currentLevel ? (
          <button
            onClick={onBackToMap}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 transition border border-slate-700 text-slate-200"
            title="লেভেল থেকে প্রস্থান করুন"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold font-mono">L{currentLevel.level_id}</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 border border-indigo-400 flex items-center justify-center font-black text-white text-base shadow-md shadow-indigo-500/20">
              V
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight text-white leading-none">VocabMaster</span>
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest leading-tight">Pro Game</span>
            </div>
          </div>
        )}

        {/* Center: Stage Stars Progress (In-Game) OR Streak, Gems, Lives (In-Map) */}
        {currentLevel ? (
          <div className="flex items-center space-x-1.5 bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-700/80 shadow-inner">
            {[0, 1, 2, 3, 4].map((idx) => {
              const isFilled = idx < stageIndex ? stageStars[idx] : false;
              const isCurrent = idx === stageIndex;
              return (
                <Star
                  key={idx}
                  className={`w-4 h-4 transition-all duration-300 ${
                    isFilled
                      ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                      : isCurrent
                      ? 'text-indigo-400 animate-pulse stroke-2 scale-105'
                      : 'text-slate-600 stroke-1'
                  }`}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs font-black">
            {/* Streak Flame */}
            <div 
              className="flex items-center space-x-1 bg-amber-500/15 text-amber-400 px-2.5 py-1 rounded-xl border border-amber-500/30 shadow-xs"
              title="টানা শেখার স্ট্রিক"
            >
              <Flame className="w-4 h-4 fill-amber-400 animate-bounce" />
              <span className="font-mono text-xs">{streak}</span>
            </div>

            {/* Gems */}
            <div 
              className="flex items-center space-x-1 bg-cyan-500/15 text-cyan-400 px-2.5 py-1 rounded-xl border border-cyan-500/30 shadow-xs"
              title="অর্জিত রত্ন (Gems)"
            >
              <Diamond className="w-3.5 h-3.5 fill-cyan-400" />
              <span className="font-mono text-xs">{gems}</span>
            </div>

            {/* Lives */}
            <div 
              className="flex items-center space-x-1 bg-rose-500/15 text-rose-400 px-2.5 py-1 rounded-xl border border-rose-500/30 shadow-xs"
              title="জীবন / হার্টস"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-400" />
              <span className="font-mono text-xs">{lives}</span>
            </div>
          </div>
        )}

        {/* Right Side: Sound Toggle & Settings */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={toggleAudio}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 transition active:scale-95"
            title={isAudioMuted ? "শব্দ চালু করুন" : "শব্দ বন্ধ করুন"}
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

      {/* In-Game 5-Stage Line Progress Indicator */}
      {currentLevel && (
        <div className="max-w-md mx-auto w-full bg-slate-800/80 h-1.5 mt-2 rounded-full overflow-hidden border border-slate-700/50">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 h-full transition-all duration-300 ease-out"
            style={{ width: `${(stageIndex / 5) * 100}%` }}
          />
        </div>
      )}
    </header>
  );
}

