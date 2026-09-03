import React from 'react';
import { 
  ArrowLeft, 
  HelpCircle, 
  PenTool, 
  ChevronRight, 
  Volume2, 
  VolumeX,
  GraduationCap
} from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

export default function DuHomeView({
  onSelectCategory,
  onBack,
  isAudioMuted = false,
  setIsAudioMuted
}) {
  const handlePickCategory = (categoryKey) => {
    sound.playClick();
    if (onSelectCategory) {
      onSelectCategory(categoryKey); // 'mcq' | 'written'
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none pb-16 bg-[#0a0a0c] min-h-screen text-neutral-100 font-sans px-3">
      {/* 1. ULTRA-COMPACT EDITORIAL STICKY HEADER (Budget <= 80px) */}
      <header 
        className="sticky top-0 z-40 w-full bg-[#0a0a0c]/98 backdrop-blur-md border-b border-neutral-800/80 py-2.5 space-y-2 shadow-sm mb-3"
        style={{ paddingTop: 'max(0.6rem, env(safe-area-inset-top, 0px))' }}
      >
        {/* Row 1: Back Navigation + Title + Sound */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                sound.playClick();
                if (onBack) onBack();
              }}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-neutral-300 hover:text-white text-xs font-semibold shrink-0 transition cursor-pointer active:scale-95"
              title="Back to Learning Hub"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] font-bold">HUB</span>
            </button>

            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white tracking-tight truncate">
                ঢাবি 'খ' ইউনিট প্রশ্নব্যাংক
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="font-mono text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 font-bold rounded-md">
              ২০১৫-২০২৫
            </span>

            {setIsAudioMuted && (
              <button
                onClick={() => {
                  const next = !isAudioMuted;
                  setIsAudioMuted(next);
                  sound.enabled = !next;
                }}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 flex items-center justify-center text-neutral-300 transition cursor-pointer active:scale-90"
                title={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-neutral-300" />}
              </button>
            )}
          </div>
        </div>

      </header>

      {/* 2. CATEGORY CARDS (SOLID FLAT + WHITE TEXT) */}
      <div className="w-full space-y-3 pt-1">
        {/* CARD 1: MCQ প্রশ্নব্যাংক (SOLID AMBER + WHITE TEXT) */}
        <div 
          onClick={() => handlePickCategory('mcq')}
          className="w-full bg-[#b45309] rounded-2xl p-4.5 transition cursor-pointer flex items-center justify-between active:scale-[0.99] shadow-sm"
        >
          <div className="flex items-center space-x-3.5 min-w-0 pr-2">
            <div className="w-11 h-11 rounded-xl bg-[#92400e] flex items-center justify-center text-white transition shrink-0">
              <HelpCircle className="w-6 h-6 stroke-[1.75]" />
            </div>
            <h2 className="text-base font-bold text-white font-sans tracking-tight truncate">
              MCQ প্রশ্নব্যাংক
            </h2>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs font-mono font-bold bg-[#92400e] text-white px-3 py-1 rounded-xl">760 Qs</span>
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* CARD 2: WRITTEN প্রশ্নব্যাংক (SOLID INDIGO + WHITE TEXT) */}
        <div 
          onClick={() => handlePickCategory('written')}
          className="w-full bg-[#4338ca] rounded-2xl p-4.5 transition cursor-pointer flex items-center justify-between active:scale-[0.99] shadow-sm"
        >
          <div className="flex items-center space-x-3.5 min-w-0 pr-2">
            <div className="w-11 h-11 rounded-xl bg-[#3730a3] flex items-center justify-center text-white transition shrink-0">
              <PenTool className="w-6 h-6 stroke-[1.75]" />
            </div>
            <h2 className="text-base font-bold text-white font-sans tracking-tight truncate">
              Written প্রশ্নব্যাংক
            </h2>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs font-mono font-bold bg-[#3730a3] text-white px-3 py-1 rounded-xl">38 Qs</span>
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
