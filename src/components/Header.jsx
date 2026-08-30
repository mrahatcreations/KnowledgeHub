import React from 'react';
import { Star, Volume2, VolumeX, Settings, ArrowLeft } from 'lucide-react';
import { sound } from '../audio/SoundSynthesizer';

export default function Header({ 
  currentLevel, 
  stageIndex, 
  stageStars, 
  isAudioMuted, 
  setIsAudioMuted, 
  onBackToMap, 
  onOpenSettings 
}) {
  const toggleAudio = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    sound.enabled = !next;
  };

  const progressPercent = ((stageIndex) / 5) * 100;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Back & Level Title */}
        <div className="flex items-center space-x-3">
          {currentLevel && (
            <button
              onClick={onBackToMap}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition active:scale-95"
              title="Back to Map"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                {currentLevel ? currentLevel.title : 'VocabMaster'}
              </h1>
              {currentLevel && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {currentLevel.unit || currentLevel.category}
                </span>
              )}
            </div>
            {currentLevel && (
              <p className="text-xs text-slate-400 font-medium">ধাপ {stageIndex + 1} / 5</p>
            )}
          </div>
        </div>

        {/* Center: 5 Stars Indicator */}
        {currentLevel && (
          <div className="hidden sm:flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            {[0, 1, 2, 3, 4].map((idx) => {
              const isFilled = idx < stageIndex ? stageStars[idx] : false;
              const isCurrent = idx === stageIndex;
              return (
                <Star
                  key={idx}
                  className={`w-5 h-5 transition-all ${
                    isFilled
                      ? 'text-amber-400 fill-amber-400 scale-110'
                      : isCurrent
                      ? 'text-indigo-500 animate-pulse stroke-2'
                      : 'text-slate-300 stroke-1'
                  }`}
                />
              );
            })}
          </div>
        )}

        {/* Right: Audio & Settings */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleAudio}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition active:scale-95"
            title={isAudioMuted ? 'Unmute' : 'Mute'}
          >
            {isAudioMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-indigo-600" />}
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition active:scale-95"
            title="Settings & Sync"
          >
            <Settings className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {currentLevel && (
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-indigo-600 h-1.5 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </header>
  );
}
