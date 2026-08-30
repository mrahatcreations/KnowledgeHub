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
  Play, 
  Compass, 
  Swords,
  BookMarked,
  Heart
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

  const currentLvlNum = Math.min(unlockedLevel, levels.length || 201);
  const totalLevels = levels.length || 201;
  const progressPercent = Math.min(100, Math.round(((currentLvlNum - 1) / totalLevels) * 100));

  const handlePlaySubject = (subjectId) => {
    sound.playClick();
    if (onSelectSubject) {
      onSelectSubject(subjectId);
    }
  };

  const handleLockedClick = (subjectName) => {
    sound.playWrong();
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none pt-2 pb-16 px-3.5 space-y-4 animate-pop">
      {/* 1. TOP ARCADE GAME HUD (Lives ❤️, Streak 🔥, Gems 💎, Stars ⭐, Audio 🔊) */}
      <header 
        className="w-full bg-[#0e1626] border-2 border-slate-800 rounded-3xl p-3 shadow-[0_8px_0_#060a12]"
        style={{ marginTop: 'max(env(safe-area-inset-top, 0px), 4px)' }}
      >
        <div className="flex items-center justify-between gap-1.5">
          {/* Hearts / Lives */}
          <div className="flex items-center space-x-1 bg-rose-950/80 border border-rose-500/40 px-2.5 py-1.5 rounded-2xl text-rose-300 shadow-xs">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
            <span className="font-mono font-black text-xs">{lives}</span>
          </div>

          {/* Streak Flame */}
          <div className="flex items-center space-x-1 bg-amber-950/80 border border-amber-500/40 px-2.5 py-1.5 rounded-2xl text-amber-300 shadow-xs">
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
            <span className="font-mono font-black text-xs">{streak}</span>
          </div>

          {/* Gems */}
          <div className="flex items-center space-x-1 bg-blue-950/80 border border-blue-500/40 px-2.5 py-1.5 rounded-2xl text-blue-300 shadow-xs">
            <span className="text-xs">💎</span>
            <span className="font-mono font-black text-xs">{gems}</span>
          </div>

          {/* Total Stars */}
          <div className="flex items-center space-x-1 bg-amber-500/15 border border-amber-400/40 px-2.5 py-1.5 rounded-2xl text-amber-300 shadow-xs">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-mono font-black text-xs">{String(totalStarsEarned).replace('.0', '')}</span>
          </div>

          {/* Sound Mute Toggle */}
          <button
            onClick={toggleAudio}
            className="w-8 h-8 flex items-center justify-center rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-90 transition border border-slate-700 text-slate-300 cursor-pointer shadow-xs shrink-0"
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
      </header>

      {/* 2. MAIN TITLE BANNER */}
      <div className="w-full flex items-center justify-between px-2 pt-1">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
          <span className="font-black text-xs uppercase tracking-widest text-blue-400">CHOOSE GAME WORLD</span>
        </div>
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">3 WORLDS • 1 VAULT</span>
      </div>

      {/* 3. GAME WORLDS (3 PLAYING WORLDS) */}
      <div className="w-full space-y-3.5">
        {/* WORLD 1: 🇬🇧 ENGLISH REALM (Active & Playable) */}
        <div className="w-full bg-gradient-to-b from-[#162746] to-[#0d172a] border-3 border-blue-500 rounded-3xl p-4 shadow-[0_8px_0_#0f172a] relative overflow-hidden group">
          {/* Glowing World Tag */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl shadow-[0_4px_0_#1d4ed8] border-2 border-blue-200">
                🇬🇧
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-black text-white tracking-tight uppercase">ENGLISH SAGA</h2>
                  <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    ACTIVE
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-300 mt-0.5">
                  <span>201 Levels</span>
                  <span>•</span>
                  <span>1,005 Words</span>
                  <span>•</span>
                  <span className="text-amber-400">👑 {totalMastered} Mastered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Level Progress Bar inside Card */}
          <div className="bg-slate-950/80 rounded-2xl p-3 border border-blue-500/20 mb-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-slate-300">
                Current: <span className="text-blue-400 font-mono text-sm">Level {currentLvlNum}</span> / {totalLevels}
              </span>
              <span className="text-amber-400 font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
          </div>

          {/* Big Duolingo-style 3D Play Button */}
          <button
            onClick={() => handlePlaySubject('english')}
            className="w-full game-btn-3d bg-emerald-500 hover:bg-emerald-400 border-2 border-emerald-300 text-white font-black text-base uppercase tracking-wider py-3.5 px-4 rounded-2xl shadow-[0_6px_0_#047857] flex items-center justify-center space-x-2 cursor-pointer active:translate-y-1.5 active:shadow-none transition-all"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>PLAY LEVEL {currentLvlNum}</span>
          </button>
        </div>

        {/* WORLD 2: 🇧🇩 BANGLA KINGDOM (Coming Soon) */}
        <div 
          onClick={() => handleLockedClick('Bangla')}
          className="w-full bg-gradient-to-b from-[#2a131b] to-[#170a0f] border-2 border-rose-900/60 rounded-3xl p-4 shadow-[0_6px_0_#0a0407] opacity-80 cursor-pointer hover:opacity-100 transition"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-rose-700 to-rose-900 flex items-center justify-center text-white text-xl shadow-[0_4px_0_#4c0519] border border-rose-500/40">
                🇧🇩
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-black text-slate-200 tracking-tight uppercase">BANGLA MASTER</h2>
                  <span className="bg-slate-800 text-slate-400 font-black text-[9px] px-2 py-0.5 rounded-full flex items-center space-x-1 border border-slate-700">
                    <Lock className="w-2.5 h-2.5" />
                    <span>LOCKED</span>
                  </span>
                </div>
                <p className="text-xs font-bold text-rose-300/70 mt-0.5">বাংলা সাহিত্য ও ব্যাকরণ কুইজ</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-900/80 border border-rose-900/50 flex items-center justify-center text-rose-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          <div className="w-full bg-slate-950/60 border border-slate-800/80 text-slate-400 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center space-x-2">
            <Lock className="w-3.5 h-3.5" />
            <span>UNLOCKED IN NEXT QUEST PACK</span>
          </div>
        </div>

        {/* WORLD 3: 🌍 GK ODYSSEY (General Knowledge - Coming Soon) */}
        <div 
          onClick={() => handleLockedClick('GK')}
          className="w-full bg-gradient-to-b from-[#211438] to-[#120a21] border-2 border-purple-900/60 rounded-3xl p-4 shadow-[0_6px_0_#0b0514] opacity-80 cursor-pointer hover:opacity-100 transition"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-purple-600 to-purple-900 flex items-center justify-center text-white text-xl shadow-[0_4px_0_#3b0764] border border-purple-400/40">
                🌍
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-black text-slate-200 tracking-tight uppercase">GENERAL KNOWLEDGE</h2>
                  <span className="bg-slate-800 text-slate-400 font-black text-[9px] px-2 py-0.5 rounded-full flex items-center space-x-1 border border-slate-700">
                    <Lock className="w-2.5 h-2.5" />
                    <span>LOCKED</span>
                  </span>
                </div>
                <p className="text-xs font-bold text-purple-300/70 mt-0.5">বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলি</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-900/80 border border-purple-900/50 flex items-center justify-center text-purple-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          <div className="w-full bg-slate-950/60 border border-slate-800/80 text-slate-400 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center space-x-2">
            <Lock className="w-3.5 h-3.5" />
            <span>UNLOCKED IN NEXT QUEST PACK</span>
          </div>
        </div>

        {/* 4. LEARNING SECTION: 📖 WORD VAULT & DICTIONARY */}
        <div className="pt-1">
          <div className="px-2 mb-2 flex items-center space-x-1.5">
            <BookMarked className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-black text-xs uppercase tracking-widest text-amber-400">STUDY & WORD VAULT</span>
          </div>

          <div className="w-full bg-gradient-to-b from-[#2d210b] to-[#181105] border-3 border-amber-500 rounded-3xl p-4 shadow-[0_8px_0_#0f0b03] relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center text-white text-xl shadow-[0_4px_0_#78350f] border border-amber-200">
                  📖
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-black text-amber-200 tracking-tight uppercase">VOCABULARY VAULT</h2>
                    <span className="bg-amber-500/20 text-amber-300 font-black text-[9px] px-2 py-0.5 rounded-full border border-amber-400/40 uppercase">
                      STUDY
                    </span>
                  </div>
                  <p className="text-xs font-bold text-amber-300/80 mt-0.5">1,005 Words • Audio Pronunciation & Bookmarks</p>
                </div>
              </div>
            </div>

            {/* 3D Gold Action Button */}
            <button
              onClick={() => handlePlaySubject('learning')}
              className="w-full game-btn-3d bg-amber-500 hover:bg-amber-400 border-2 border-amber-300 text-amber-950 font-black text-sm uppercase tracking-wider py-3 px-4 rounded-2xl shadow-[0_5px_0_#78350f] flex items-center justify-center space-x-2 cursor-pointer active:translate-y-1.5 active:shadow-none transition-all"
            >
              <BookOpen className="w-4 h-4 fill-amber-950 text-amber-950" />
              <span>OPEN WORD VAULT (১,০০৫ শব্দ)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
