import React, { useState, useMemo } from 'react';
import { 
  Star, 
  Flame, 
  Volume2, 
  VolumeX, 
  Play, 
  Heart,
  Sparkles,
  Trophy,
  BookOpen,
  BookText,
  Languages,
  Globe2,
  ChevronRight,
  Sparkle,
  Headphones
} from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

export default function SubjectHubView({
  levels = [],
  unlockedLevel = 1,
  levelStars = {},
  gems = 240,
  streak = 5,
  lives = 5,
  isAudioMuted = false,
  setIsAudioMuted,
  activeMode = 'practice',
  onModeChange,
  onSelectSubject,
  onStartLevel,
  onOpenAudioSettings
}) {
  // 2 Primary Modes: 'practice' (Game Style) vs 'learning' (Learning Subject Hub)
  const [internalMode, setInternalMode] = useState(activeMode);
  const currentMode = onModeChange ? activeMode : internalMode;
  const setMode = (mode) => {
    if (onModeChange) onModeChange(mode);
    setInternalMode(mode);
  };

  const toggleAudio = () => {
    const next = !isAudioMuted;
    if (setIsAudioMuted) setIsAudioMuted(next);
    sound.enabled = !next;
  };

  // Compute Total Mastered Levels
  const totalMastered = useMemo(() => {
    return Object.values(levelStars || {}).filter(stars => (stars >= 5 || stars >= 10)).length;
  }, [levelStars]);

  // Compute Total Cumulative Stars Earned across all levels
  const totalStarsEarned = useMemo(() => {
    const total = Object.values(levelStars || {}).reduce((acc, stars) => {
      const num = Number(stars) || 0;
      const normalized = num > 5 ? Number((num * 0.5).toFixed(1)) : num;
      return acc + normalized;
    }, 0);
    return Number(total.toFixed(1));
  }, [levelStars]);

  const totalLevels = levels?.length || 201;
  const currentLvlNum = Math.min(totalLevels, Math.max(1, unlockedLevel || 1));
  const progressPercent = Math.min(100, Math.round(((currentLvlNum - 1) / totalLevels) * 100));

  const currentLevelData = useMemo(() => {
    return (levels || []).find(lvl => lvl.level_id === currentLvlNum) || levels[0] || {};
  }, [levels, currentLvlNum]);

  // Clean level title to avoid duplicate "Level 1: Level 1:"
  const cleanLevelTitle = useMemo(() => {
    const raw = currentLevelData?.title || 'Vocabulary Quest';
    return raw.replace(/^Level\s*\d+\s*:\s*/i, '').trim();
  }, [currentLevelData]);

  const handlePlayPractice = (subjectId = 'english') => {
    sound.playClick();
    if (onStartLevel && currentLevelData) {
      onStartLevel(currentLevelData);
      return;
    }
    if (onSelectSubject) {
      onSelectSubject(subjectId);
    }
  };

  const handleOpenLearningSubject = (subjectId = 'learning') => {
    sound.playClick();
    if (onSelectSubject) {
      onSelectSubject(subjectId);
    }
  };

  const handleLockedClick = () => {
    sound.playWrong();
  };

  // =========================================================================
  // 1. PRACTICE MODE (GAME STYLE UI)
  // =========================================================================
  if (currentMode === 'practice') {
    return (
      <div className="w-full max-w-md mx-auto flex flex-col items-center select-none pt-1 pb-16 px-1 space-y-3.5">
        {/* TOP GAME STATUS HUD */}
        <header 
          className="w-full bg-[#0e1626]/95 backdrop-blur-md border border-slate-800/90 rounded-none px-3.5 py-2.5 shadow-sm"
          style={{ marginTop: 'max(env(safe-area-inset-top, 0px), 2px)' }}
        >
          <div className="flex items-center justify-between w-full">
            {/* Stats Metrics (Lives, Streak, Gems, Stars) */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center space-x-1.5" title="Lives">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
                <span className="font-mono font-bold text-xs text-rose-200">{lives}</span>
              </div>

              <div className="w-px h-3.5 bg-slate-800" />

              <div className="flex items-center space-x-1.5" title="Daily Streak">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                <span className="font-mono font-bold text-xs text-orange-200">{streak}</span>
              </div>

              <div className="w-px h-3.5 bg-slate-800" />

              <div className="flex items-center space-x-1.5" title="Gems">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                <span className="font-mono font-bold text-xs text-blue-200">{gems}</span>
              </div>

              <div className="w-px h-3.5 bg-slate-800" />

              <div className="flex items-center space-x-1.5" title="Total Stars Earned">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-mono font-bold text-xs text-amber-200">
                  {String(totalStarsEarned).replace('.0', '')}
                </span>
              </div>
            </div>

              {/* Actions: Audio Pack Settings & Sound Mute Toggle */}
              <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                {onOpenAudioSettings && (
                  <button
                    onClick={onOpenAudioSettings}
                    className="h-8 px-2.5 flex items-center space-x-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-90 transition border border-slate-700/80 text-amber-400 cursor-pointer shadow-xs shrink-0 text-xs font-semibold"
                    title="Offline Audio Pack Settings"
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">Audio Pack</span>
                  </button>
                )}

                <button
                  onClick={toggleAudio}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-90 transition border border-slate-700/80 text-slate-300 cursor-pointer shadow-xs shrink-0"
                  title={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
                  aria-label="Toggle Sound"
                >
                  {isAudioMuted ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-blue-400" />
                  )}
                </button>
              </div>
          </div>
        </header>

        {/* 2-MODE SEGMENTED SWITCHER (PRACTICE VS LEARNING) */}
        <div className="w-full flex items-center p-1 bg-[#0e1626] border border-slate-800/90 rounded-none shadow-sm">
          <button
            onClick={() => {
              sound.playClick();
              setMode('practice');
            }}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-none font-bold text-xs uppercase tracking-wider transition cursor-pointer bg-blue-600 text-white shadow-md"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Practice</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setMode('learning');
            }}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-none font-bold text-xs uppercase tracking-wider transition cursor-pointer text-slate-400 hover:text-slate-200"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Learning</span>
          </button>
        </div>

        {/* HERO FEATURE CARD: ENGLISH SAGA QUEST */}
        <div className="w-full bg-gradient-to-b from-[#13223f] to-[#0c1527] border border-blue-500/30 rounded-none p-5 shadow-lg relative overflow-hidden space-y-4 animate-pop">
          {/* Top: Flag / Title / Active Tag */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-11 h-11 rounded-none bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 font-bold text-sm shadow-md shrink-0">
                <Languages className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-black text-white tracking-tight uppercase">ENGLISH SAGA</h2>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[9px] px-2 py-0.5 rounded-none uppercase tracking-wider">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-blue-200/90 font-medium mt-0.5 truncate">
                  Level {currentLvlNum}: {cleanLevelTitle}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-bold text-amber-400 block">
                {progressPercent}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Progress</span>
            </div>
          </div>

          {/* Progress Bar & Stats */}
          <div className="space-y-2">
            <div className="w-full h-2 bg-slate-950 rounded-none border border-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 rounded-none transition-all duration-500"
                style={{ width: `${Math.max(4, progressPercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>{totalLevels} Levels • 1,005 Words</span>
              <span className="text-amber-400 font-semibold flex items-center space-x-1">
                <Trophy className="w-3 h-3 inline" />
                <span>{totalMastered} Mastered</span>
              </span>
            </div>
          </div>

          {/* Tactile Play & Saga Map Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 w-full">
            <button
              onClick={() => handlePlayPractice('english')}
              className="flex-1 game-btn-3d bg-emerald-500 hover:bg-emerald-400 border-2 border-emerald-300 text-white font-black text-sm uppercase tracking-wider py-3.5 px-4 rounded-none shadow-[0_5px_0_#047857] flex items-center justify-center space-x-2 cursor-pointer active:translate-y-1 active:shadow-none transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>CONTINUE LEVEL {currentLvlNum}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                if (onSelectSubject) onSelectSubject('english');
              }}
              className="px-4 py-3 bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 hover:border-blue-400 text-blue-300 font-bold text-xs uppercase tracking-wider rounded-none transition flex items-center justify-center space-x-1.5 cursor-pointer"
              title="Explore all 201 levels on the Saga Map"
            >
              <span>SAGA MAP</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* UPCOMING QUEST PACKS */}
        <div className="w-full space-y-2 pt-1">
          <div className="flex items-center space-x-1.5 px-1">
            <Sparkle className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-500">UPCOMING QUESTS</span>
          </div>

          <div className="space-y-2 w-full">
            {/* World 2: Bangla Master */}
            <div 
              onClick={handleLockedClick}
              className="w-full bg-[#0e1626]/50 border border-slate-800/80 rounded-none p-3 flex items-center justify-between opacity-75 hover:opacity-100 transition cursor-pointer"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-none bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  <BookText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-300 truncate">Bangla Master</h4>
                  <p className="text-[10px] text-slate-500 truncate">বাংলা সাহিত্য ও ব্যাকরণ কুইজ</p>
                </div>
              </div>

              <span className="text-slate-500 font-mono text-[10px] tracking-wider shrink-0">
                SOON
              </span>
            </div>

            {/* World 3: General Knowledge */}
            <div 
              onClick={handleLockedClick}
              className="w-full bg-[#0e1626]/50 border border-slate-800/80 rounded-none p-3 flex items-center justify-between opacity-75 hover:opacity-100 transition cursor-pointer"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-none bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-300 truncate">General Knowledge</h4>
                  <p className="text-[10px] text-slate-500 truncate">বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলি</p>
                </div>
              </div>

              <span className="text-slate-500 font-mono text-[10px] tracking-wider shrink-0">
                SOON
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. LEARNING HOME PAGE (PURE EDITORIAL SUBJECT SELECTION)
  // =========================================================================
  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none pb-16 bg-[#0a0a0c] min-h-screen text-neutral-100 font-sans px-3">
      {/* 1. EDITORIAL HEADER */}
      <header 
        className="sticky top-0 z-40 w-full bg-[#0a0a0c]/98 backdrop-blur-md border-b border-neutral-800/80 py-3 space-y-3 shadow-sm mb-4"
        style={{ paddingTop: 'max(0.6rem, env(safe-area-inset-top, 0px))' }}
      >
        {/* Row 1: Mode Switcher + Audio Toggle */}
        <div className="flex items-center justify-between w-full">
          {/* Minimal Editorial Mode Switcher */}
          <div className="flex items-center p-0.5 bg-[#141518] border border-neutral-800 rounded-none">
            <button
              onClick={() => {
                sound.playClick();
                setMode('practice');
              }}
              className="px-3 py-1.5 rounded-none text-xs font-medium text-neutral-400 hover:text-white transition cursor-pointer"
            >
              Practice
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setMode('learning');
              }}
              className="px-3 py-1.5 rounded-none text-xs font-bold bg-neutral-200 text-neutral-950 shadow-xs transition cursor-pointer"
            >
              Learning
            </button>
          </div>

          {/* Sound Toggle & Audio Pack */}
          <div className="flex items-center space-x-1.5">
            {onOpenAudioSettings && (
              <button
                onClick={onOpenAudioSettings}
                className="h-8 px-2.5 rounded-none bg-[#141518] hover:bg-[#1c1d22] border border-neutral-800 flex items-center space-x-1.5 text-amber-300 text-xs font-semibold transition cursor-pointer active:scale-95"
                title="Offline Audio Pack Settings"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Audio Pack</span>
              </button>
            )}

            <button
              onClick={toggleAudio}
              className="w-8 h-8 rounded-none bg-[#141518] hover:bg-[#1c1d22] border border-neutral-800 flex items-center justify-center text-neutral-300 transition cursor-pointer active:scale-90"
              title={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
              aria-label="Toggle Sound"
            >
              {isAudioMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-neutral-300" />
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Learning Hub Heading */}
        <div className="space-y-0.5 pt-0.5">
          <h1 className="font-luxury-serif italic text-2xl text-white font-bold tracking-tight">
            Subjects
          </h1>
          <p className="text-xs text-neutral-400">
            পড়াশোনা শুরু করতে নিচের বিষয়গুলোর মধ্য থেকে যেকোনো একটি বেছে নিন:
          </p>
        </div>
      </header>

      {/* 2. SUBJECTS LIST (CLEAN EDITORIAL CARDS - NO BOX INCEPTION) */}
      <div className="w-full space-y-3">
        {/* SUBJECT 1: ENGLISH (ACTIVE) */}
        <div 
          onClick={() => handleOpenLearningSubject('learning')}
          className="w-full bg-[#121316] hover:bg-[#16181d] border border-neutral-800 hover:border-neutral-700 rounded-none p-4.5 transition cursor-pointer flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center space-x-3.5 min-w-0 pr-2">
            <div className="w-11 h-11 rounded-none bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 group-hover:text-white transition shrink-0">
              <Languages className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white font-sans tracking-tight">
                English <span className="text-neutral-400 font-normal">| ইংরেজি</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                ১,০০৫ শব্দকোষ • অডিও উচ্চারণ • অর্থ ও ব্যাকরণ
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[11px] font-mono text-neutral-400">1,005 Words</span>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition" />
          </div>
        </div>

        {/* SUBJECT 2: BANGLA (COMING SOON) */}
        <div 
          onClick={handleLockedClick}
          className="w-full bg-[#121316]/60 border border-neutral-800/60 rounded-none p-4.5 flex items-center justify-between opacity-70 hover:opacity-90 transition cursor-pointer"
        >
          <div className="flex items-center space-x-3.5 min-w-0 pr-2">
            <div className="w-11 h-11 rounded-none bg-neutral-900/80 border border-neutral-800/60 flex items-center justify-center text-neutral-500 shrink-0">
              <BookText className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-neutral-300 font-sans tracking-tight">
                Bangla <span className="text-neutral-500 font-normal">| বাংলা</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                বাংলা সাহিত্য ও ব্যাকরণ হ্যান্ডনোট
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-neutral-500 shrink-0">
            Coming Soon
          </span>
        </div>

        {/* SUBJECT 3: GENERAL KNOWLEDGE (COMING SOON) */}
        <div 
          onClick={handleLockedClick}
          className="w-full bg-[#121316]/60 border border-neutral-800/60 rounded-none p-4.5 flex items-center justify-between opacity-70 hover:opacity-90 transition cursor-pointer"
        >
          <div className="flex items-center space-x-3.5 min-w-0 pr-2">
            <div className="w-11 h-11 rounded-none bg-neutral-900/80 border border-neutral-800/60 flex items-center justify-center text-neutral-500 shrink-0">
              <Globe2 className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-neutral-300 font-sans tracking-tight">
                General Knowledge <span className="text-neutral-500 font-normal">| সাধারণ জ্ঞান</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলি
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-neutral-500 shrink-0">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
}
