import React, { useMemo } from 'react';
import { 
  ArrowLeft, 
  Star, 
  Play, 
  Volume2, 
  VolumeX, 
  Trophy,
  CheckCircle2,
  Sparkles,
  BookOpen,
  HelpCircle,
  Globe
} from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';
import { 
  DU_SUBJECTS, 
  getDuGameLevels, 
  getDuSavedStars, 
  getDuSubjectTotalStars 
} from '../../utils/duDataHelper';

export default function DuLevelMap({
  subject = DU_SUBJECTS.BANGLA, // 'বাংলা' | 'English' | 'সাধারণ জ্ঞান'
  onSelectLevel,
  onBack,
  isAudioMuted = false,
  setIsAudioMuted
}) {
  const levels = useMemo(() => getDuGameLevels(subject), [subject]);
  const savedStarsMap = useMemo(() => getDuSavedStars(), []);
  const subjectStars = savedStarsMap[subject] || {};
  const totalStarsEarned = useMemo(() => getDuSubjectTotalStars(subject, savedStarsMap), [subject, savedStarsMap]);

  // Subject title & color accents
  const subjectMeta = useMemo(() => {
    switch (subject) {
      case DU_SUBJECTS.BANGLA:
        return {
          title: 'DU Bangla Master',
          banglaTitle: 'ঢাবি বাংলা গেম',
          icon: BookOpen,
          accentColor: 'text-rose-400',
          borderColor: 'border-rose-500/40',
          badgeBg: 'bg-rose-950/40 text-rose-300 border-rose-800/60',
          btnBg: 'bg-rose-600 hover:bg-rose-500 text-white'
        };
      case DU_SUBJECTS.ENGLISH:
        return {
          title: 'DU English Master',
          banglaTitle: 'ঢাবি ইংরেজি গেম',
          icon: HelpCircle,
          accentColor: 'text-amber-400',
          borderColor: 'border-amber-500/40',
          badgeBg: 'bg-amber-950/40 text-amber-300 border-amber-800/60',
          btnBg: 'bg-amber-600 hover:bg-amber-500 text-white'
        };
      case DU_SUBJECTS.GK:
      default:
        return {
          title: 'DU GK Master',
          banglaTitle: 'ঢাবি সাধারণ জ্ঞান গেম',
          icon: Globe,
          accentColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/40',
          badgeBg: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60',
          btnBg: 'bg-emerald-600 hover:bg-emerald-500 text-white'
        };
    }
  }, [subject]);

  const IconComponent = subjectMeta.icon;

  const handleLevelClick = (level) => {
    sound.playClick();
    if (onSelectLevel) {
      onSelectLevel(level);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none pb-16 bg-[#0a0a0c] min-h-screen text-neutral-100 font-sans px-3">
      {/* 1. ULTRA-COMPACT EDITORIAL STICKY HEADER (Budget <= 80px) */}
      <header 
        className="sticky top-0 z-40 w-full bg-[#0a0a0c] border-b border-neutral-800 py-2.5 space-y-2 shadow-sm mb-3"
        style={{ paddingTop: 'max(0.6rem, env(safe-area-inset-top, 0px))' }}
      >
        {/* Row 1: Back + Title + Stars Counter + Sound */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2 min-w-0">
            <button
              onClick={() => {
                sound.playClick();
                if (onBack) onBack();
              }}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-white text-xs font-semibold shrink-0 transition cursor-pointer active:scale-95"
              title="Back to Hub"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] font-bold">HUB</span>
            </button>

            <div className="flex items-center space-x-1.5 min-w-0">
              <IconComponent className={`w-4 h-4 ${subjectMeta.accentColor} shrink-0`} />
              <h1 className="text-sm font-bold text-white tracking-tight truncate">
                {subjectMeta.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <div className="flex items-center space-x-1 px-2.5 py-1 bg-[#1e293b] rounded-lg">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-mono text-xs font-bold text-white">
                {totalStarsEarned}/100
              </span>
            </div>

            {setIsAudioMuted && (
              <button
                onClick={() => {
                  const next = !isAudioMuted;
                  setIsAudioMuted(next);
                  sound.enabled = !next;
                }}
                className="w-7 h-7 rounded-lg bg-[#1e293b] hover:bg-[#334155] flex items-center justify-center text-white transition cursor-pointer active:scale-90"
                title={isAudioMuted ? 'Unmute' : 'Mute'}
              >
                {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
              </button>
            )}
          </div>
        </div>

      </header>

      {/* 2. 10 UNLOCKED LEVELS LIST - SOLID FLAT + ROUNDED */}
      <div className="w-full space-y-2 pt-1">
        {levels.map((lvl) => {
          const earnedStars = subjectStars[lvl.year] || 0;
          const isMastered = earnedStars === 10;
          const isPlayed = earnedStars > 0;

          return (
            <div
              key={lvl.levelId}
              onClick={() => handleLevelClick(lvl)}
              className="w-full bg-[#1e293b] hover:bg-[#283548] rounded-xl p-3.5 transition cursor-pointer flex items-center justify-between active:scale-[0.99] shadow-sm"
            >
              {/* Left: Level badge + Info */}
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                <div className="w-9 h-9 rounded-lg bg-[#0f172a] flex flex-col items-center justify-center shrink-0">
                  <span className="font-mono text-[8px] font-bold tracking-widest text-slate-400">LVL</span>
                  <span className="font-mono text-xs font-bold text-white leading-none">{lvl.levelId}</span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-sm font-bold text-white font-sans tracking-tight">
                      {lvl.year}
                    </h2>
                    <span className="text-[10px] font-mono text-slate-300">
                      {lvl.questionCount} Qs
                    </span>
                    {lvl.levelId === 1 && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-[#059669] text-white font-bold">
                        Latest
                      </span>
                    )}
                  </div>

                  {/* Star indicators (10 Stars mini bar) */}
                  <div className="flex items-center space-x-0.5 mt-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-2.5 h-2.5 ${
                          i < earnedStars 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-slate-600'
                        }`} 
                      />
                    ))}
                    <span className="text-[10px] font-mono font-bold text-white ml-1.5">
                      {earnedStars}/10
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Action Button */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLevelClick(lvl);
                  }}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-bold text-xs font-mono transition cursor-pointer active:scale-95 ${
                    isMastered
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-[#059669] hover:bg-[#047857] text-white'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isPlayed ? 'REPLAY' : 'PLAY'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
