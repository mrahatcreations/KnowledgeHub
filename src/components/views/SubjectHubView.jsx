import React, { useMemo } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Star, 
  Crown, 
  Flame, 
  Volume2, 
  VolumeX, 
  Lock, 
  GraduationCap, 
  Compass, 
  Calculator,
  ChevronRight,
  Layers
} from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

export default function SubjectHubView({
  levels = [],
  unlockedLevel = 1,
  levelStars = {},
  gems = 100,
  streak = 1,
  lives = 5,
  isAudioMuted = false,
  setIsAudioMuted,
  onSelectSubject
}) {
  const toggleAudio = () => {
    const next = !isAudioMuted;
    if (setIsAudioMuted) setIsAudioMuted(next);
    sound.enabled = !next;
  };

  // Global Mastery and Star statistics
  const totalMastered = useMemo(() => {
    return Object.values(levelStars).filter(s => Number(s) >= 5 || Number(s) === 10).length;
  }, [levelStars]);

  const totalStarsEarned = useMemo(() => {
    return Number(
      Object.values(levelStars).reduce((sum, s) => {
        const num = Number(s) || 0;
        return sum + (num > 5 ? num * 0.5 : num);
      }, 0).toFixed(1)
    );
  }, [levelStars]);

  const progressPercent = Math.min(
    100, 
    Math.round((Math.min(unlockedLevel - 1, levels.length || 201) / (levels.length || 201)) * 100)
  );

  const handleSubjectClick = (subjectId) => {
    sound.playClick();
    if (onSelectSubject) {
      onSelectSubject(subjectId);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none pt-3 pb-12 animate-pop px-3.5">
      {/* 1. TOP HEADER & APP BRANDING */}
      <header 
        className="w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-5 mb-4 shadow-xl backdrop-blur-md"
        style={{ marginTop: 'max(env(safe-area-inset-top, 0px), 4px)' }}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white text-lg shrink-0 shadow-md shadow-blue-500/20 border border-blue-400/30">
              K
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center space-x-1.5">
                <h1 className="font-black text-lg text-white tracking-tight leading-tight">Knowledge Hub</h1>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-extrabold px-2 py-0.5 rounded-full border border-blue-500/30">
                  v1.0.1
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Select a learning path to begin</p>
            </div>
          </div>

          {/* Sound Mute Toggle */}
          <button
            onClick={toggleAudio}
            className="w-9 h-9 flex items-center justify-center rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 transition border border-slate-700 text-slate-300 shrink-0 cursor-pointer shadow-sm"
            title={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label="Toggle sound"
          >
            {isAudioMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-blue-400" />
            )}
          </button>
        </div>

        {/* User Stats Pill Bar */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
          {/* Total Stars */}
          <div className="flex flex-col items-center justify-center bg-slate-950/60 rounded-xl py-2 px-1 border border-amber-500/20">
            <div className="flex items-center space-x-1 text-amber-400 mb-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
              <span className="font-mono text-xs font-black">{String(totalStarsEarned).replace('.0', '')}</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Stars</span>
          </div>

          {/* Mastered Levels */}
          <div className="flex flex-col items-center justify-center bg-slate-950/60 rounded-xl py-2 px-1 border border-emerald-500/20">
            <div className="flex items-center space-x-1 text-emerald-400 mb-0.5">
              <Crown className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400 shrink-0" />
              <span className="font-mono text-xs font-black">{totalMastered}</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Mastered</span>
          </div>

          {/* Gems */}
          <div className="flex flex-col items-center justify-center bg-slate-950/60 rounded-xl py-2 px-1 border border-blue-500/20">
            <div className="flex items-center space-x-1 text-blue-400 mb-0.5">
              <span className="text-xs">💎</span>
              <span className="font-mono text-xs font-black">{gems}</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Gems</span>
          </div>

          {/* Streak */}
          <div className="flex flex-col items-center justify-center bg-slate-950/60 rounded-xl py-2 px-1 border border-orange-500/20">
            <div className="flex items-center space-x-1 text-orange-400 mb-0.5">
              <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400 shrink-0" />
              <span className="font-mono text-xs font-black">{streak}d</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Streak</span>
          </div>
        </div>
      </header>

      {/* 2. SUBJECT CATEGORIES */}
      <div className="w-full space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black tracking-wider uppercase text-slate-400 flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Available Subjects</span>
          </span>
          <span className="text-[11px] font-bold text-blue-400">2 Active</span>
        </div>

        {/* PRIMARY SUBJECT 1: English Vocabulary Saga (Level Path) */}
        <button
          onClick={() => handleSubjectClick('english')}
          className="w-full text-left bg-gradient-to-br from-blue-950/70 via-slate-900/90 to-slate-950 border-2 border-blue-600/50 hover:border-blue-400 rounded-3xl p-5 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-blue-950/30 group relative overflow-hidden cursor-pointer"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-600/40 border border-blue-400/40 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-blue-300 transition-colors">
                    English Vocabulary
                  </h2>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                    Active
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">201 Levels • 10-Stage Quizzes</p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3.5">
            Master 1,000+ words through interactive Flashcards, Matching pairs, Drag & Drop sentences, and True/False challenges.
          </p>

          {/* Progress bar inside the card */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-400">
                Level <span className="text-blue-300 font-mono font-black">{Math.min(unlockedLevel, levels.length || 201)}</span> of {levels.length || 201}
              </span>
              <span className="text-amber-400 font-mono font-black">
                {progressPercent}% Complete
              </span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(4, progressPercent)}%` }}
              />
            </div>
          </div>
        </button>

        {/* PRIMARY SUBJECT 2: Vocabulary Vault & Dictionary */}
        <button
          onClick={() => handleSubjectClick('learning')}
          className="w-full text-left bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-slate-950 border-2 border-indigo-600/40 hover:border-indigo-400 rounded-3xl p-5 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-indigo-950/30 group relative overflow-hidden cursor-pointer"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-600/40 border border-indigo-400/40 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                    Vocabulary Vault
                  </h2>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-extrabold px-2 py-0.5 rounded-full border border-indigo-500/30 uppercase">
                    Dictionary
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">Word Bank • Pronunciation & Bookmarks</p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Instant search across 1,000+ words with Bengali meanings, synonyms, antonyms, and natural voice audio pronunciation.
          </p>
        </button>

        {/* 3. FUTURE EXPANSIONS (COMING SOON) */}
        <div className="pt-2">
          <div className="px-1 mb-2.5">
            <span className="text-[11px] font-black tracking-wider uppercase text-slate-500 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-slate-500" />
              <span>Upcoming Courses</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* General Knowledge */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between opacity-60">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-[9px] bg-slate-800 text-slate-400 font-bold px-1.5 py-0.5 rounded-md flex items-center space-x-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Soon</span>
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-300">General Knowledge</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Bangladesh & World Affairs</p>
            </div>

            {/* Mathematics */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between opacity-60">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center">
                  <Calculator className="w-4 h-4" />
                </div>
                <span className="text-[9px] bg-slate-800 text-slate-400 font-bold px-1.5 py-0.5 rounded-md flex items-center space-x-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Soon</span>
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-300">Mental Math</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Speed arithmetic & tricks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
