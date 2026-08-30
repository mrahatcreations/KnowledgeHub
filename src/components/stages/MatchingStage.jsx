import React, { useState } from 'react';
import { CheckCircle2, XCircle, Sparkles, Volume2, AlertCircle, Link2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../audio/SoundSynthesizer';

// Bengali number converter helper
const toBnDigits = (num) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bnDigits[Number(d)]);
};

export default function MatchingStage({ stage, onSubmitAnswer, isSecondChance }) {
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [errorLeftId, setErrorLeftId] = useState(null);
  const [errorRightId, setErrorRightId] = useState(null);
  const [recentMatchedId, setRecentMatchedId] = useState(null);
  const [hadMistake, setHadMistake] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const totalPairs = stage.totalPairs || stage.leftItems?.length || 5;
  const matchedCount = matchedIds.length;
  const progressPercent = Math.min(100, Math.round((matchedCount / totalPairs) * 100));

  // Handle English Word Click (Left Column)
  const handleLeftClick = (item) => {
    if (matchedIds.includes(item.id) || errorLeftId || isFinished) return;
    
    sound.playClick();
    sound.speak(item.text);
    setSelectedLeft(item);

    if (selectedRight) {
      checkMatch(item, selectedRight);
    }
  };

  // Handle Bengali Meaning Click (Right Column)
  const handleRightClick = (item) => {
    if (matchedIds.includes(item.id) || errorRightId || isFinished) return;
    
    sound.playClick();
    setSelectedRight(item);

    if (selectedLeft) {
      checkMatch(selectedLeft, item);
    }
  };

  // Check Match Logic
  const checkMatch = (left, right) => {
    if (!left || !right) return;

    if (left.id === right.id) {
      // Correct Match
      sound.playCorrect();
      const updatedMatches = [...matchedIds, left.id];
      setMatchedIds(updatedMatches);
      setRecentMatchedId(left.id);
      setSelectedLeft(null);
      setSelectedRight(null);

      // Trigger sparkle micro-burst
      try {
        confetti({
          particleCount: 18,
          spread: 45,
          startVelocity: 20,
          origin: { y: 0.55 },
          colors: ['#10b981', '#34d399', '#6ee7b7', '#f59e0b', '#38bdf8']
        });
      } catch (e) {}

      // Clear recent match sparkle tag after animation
      setTimeout(() => {
        setRecentMatchedId(null);
      }, 1200);

      // Check if all pairs are matched
      if (updatedMatches.length >= totalPairs) {
        setIsFinished(true);
        sound.playVictory();
        
        try {
          confetti({
            particleCount: 75,
            spread: 80,
            origin: { y: 0.5 }
          });
        } catch (e) {}

        setTimeout(() => {
          onSubmitAnswer(true);
        }, 750);
      }
    } else {
      // Mismatch Error
      sound.playWrong();
      setErrorLeftId(left.id);
      setErrorRightId(right.id);

      if (!hadMistake) {
        setHadMistake(true);
        sound.playSecondChance();
      }

      // Shake and auto-reset error state
      setTimeout(() => {
        setErrorLeftId(null);
        setErrorRightId(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 550);
    }
  };

  // Pronounce word without triggering selection change if already matched
  const handleSpeakOnly = (e, text) => {
    e.stopPropagation();
    sound.speak(text);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col space-y-4 animate-pop select-none">
      {/* Dynamic Progress & Match Counter Header */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-3.5 border border-slate-800 shadow-xl flex flex-col space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-white tracking-wide">জোড়া মেলানোর অগ্রগতি</span>
              <div className="text-[11px] text-slate-400 font-medium">
                বাম ও ডান পাশ থেকে সঠিক জোড়া নির্বাচন করুন
              </div>
            </div>
          </div>

          {/* Pairs Counter Badge */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 text-xs font-black transition-all ${
            matchedCount === totalPairs
              ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-lg shadow-emerald-500/20 animate-pulse'
              : 'bg-slate-800 border-slate-700 text-indigo-300'
          }`}>
            <Sparkles className={`w-3.5 h-3.5 ${matchedCount === totalPairs ? 'text-amber-400 fill-amber-400' : 'text-indigo-400'}`} />
            <span>{toBnDigits(matchedCount)} / {toBnDigits(totalPairs)} জোড়া</span>
          </div>
        </div>

        {/* Progress Bar with Glowing Head */}
        <div className="w-full bg-slate-800/80 rounded-full h-2.5 p-0.5 overflow-hidden border border-slate-700/60 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400 transition-all duration-500 relative shadow-sm"
            style={{ width: `${progressPercent}%` }}
          >
            {progressPercent > 0 && progressPercent < 100 && (
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full animate-pulse shadow-md" />
            )}
          </div>
        </div>
      </div>

      {/* Mistake Alert Banner if occurred */}
      {(hadMistake || isSecondChance) && !isFinished && (
        <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center justify-center space-x-2 animate-pulse shadow-md">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>ভুল মিলকরণ হয়েছে! সতর্কভাবে বাকি জোড়াগুলো মেলান (২য় সুযোগ)</span>
        </div>
      )}

      {/* Success Banner when all matched */}
      {isFinished && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs font-black flex items-center justify-center space-x-2 shadow-lg shadow-emerald-900/40 animate-pop">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>চমৎকার! সবকটি জোড়া সফলভাবে মেলানো সম্পন্ন হয়েছে!</span>
        </div>
      )}

      {/* Dual-Column Tile Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-1">
        {/* Left Column (English Words) */}
        <div className="flex flex-col space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
              <span>ইংরেজি শব্দ</span>
            </span>
            <span className="text-[10px] text-slate-500 font-bold font-mono">EN</span>
          </div>

          <div className="flex flex-col space-y-2.5">
            {stage.leftItems?.map((item) => {
              const isMatched = matchedIds.includes(item.id);
              const isSelected = selectedLeft?.id === item.id;
              const isError = errorLeftId === item.id;
              const isRecent = recentMatchedId === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleLeftClick(item)}
                  disabled={isMatched || isFinished}
                  className={`game-btn-3d w-full min-h-[58px] p-3 rounded-2xl font-black text-sm text-left transition-all duration-200 flex items-center justify-between group relative overflow-hidden ${
                    isMatched
                      ? 'bg-gradient-to-r from-emerald-900/80 to-teal-900/80 border-2 border-emerald-400/80 text-emerald-100 shadow-[0_4px_0_#064e3b,0_0_15px_rgba(16,185,129,0.3)] opacity-90'
                      : isError
                      ? 'bg-gradient-to-r from-rose-900/90 to-red-900/90 border-2 border-rose-400 text-rose-100 shadow-[0_4px_0_#881337,0_0_20px_rgba(244,63,94,0.5)] animate-shake ring-2 ring-rose-400/60'
                      : isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 border-2 border-indigo-300 text-white shadow-[0_4px_0_#312e81,0_0_22px_rgba(99,102,241,0.6)] scale-[1.03] ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 animate-pulse-glow z-10'
                      : 'bg-slate-800/95 border-2 border-slate-700/90 hover:border-indigo-400 text-slate-100 hover:text-white shadow-[0_5px_0_#0f172a,0_4px_10px_rgba(0,0,0,0.3)] hover:shadow-[0_5px_0_#1e1b4b,0_6px_14px_rgba(99,102,241,0.2)] active:shadow-[0_2px_0_#0f172a]'
                  }`}
                >
                  {/* Glowing Edge highlight */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20 pointer-events-none" />

                  <div className="flex items-center space-x-2 truncate mr-1">
                    <span className="tracking-wide font-extrabold break-words leading-tight">{item.text}</span>
                  </div>

                  {/* Right-side status icon */}
                  <div className="shrink-0 flex items-center space-x-1">
                    {isMatched ? (
                      <div className="flex items-center space-x-1">
                        {isRecent && <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-star" />}
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-emerald-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                      </div>
                    ) : isError ? (
                      <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-400/60 flex items-center justify-center text-rose-300">
                        <XCircle className="w-4 h-4 text-rose-400" />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleSpeakOnly(e, item.text)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-white/10 transition"
                        title="উচ্চারণ শুনুন"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column (Bengali Meanings) */}
        <div className="flex flex-col space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block" />
              <span>বাংলা অর্থ</span>
            </span>
            <span className="text-[10px] text-slate-500 font-bold font-mono">BN</span>
          </div>

          <div className="flex flex-col space-y-2.5">
            {stage.rightItems?.map((item) => {
              const isMatched = matchedIds.includes(item.id);
              const isSelected = selectedRight?.id === item.id;
              const isError = errorRightId === item.id;
              const isRecent = recentMatchedId === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleRightClick(item)}
                  disabled={isMatched || isFinished}
                  className={`game-btn-3d w-full min-h-[58px] p-3 rounded-2xl font-bold text-sm text-left transition-all duration-200 flex items-center justify-between group relative overflow-hidden ${
                    isMatched
                      ? 'bg-gradient-to-r from-emerald-900/80 to-teal-900/80 border-2 border-emerald-400/80 text-emerald-100 shadow-[0_4px_0_#064e3b,0_0_15px_rgba(16,185,129,0.3)] opacity-90'
                      : isError
                      ? 'bg-gradient-to-r from-rose-900/90 to-red-900/90 border-2 border-rose-400 text-rose-100 shadow-[0_4px_0_#881337,0_0_20px_rgba(244,63,94,0.5)] animate-shake ring-2 ring-rose-400/60'
                      : isSelected
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 border-2 border-teal-300 text-white shadow-[0_4px_0_#064e3b,0_0_22px_rgba(20,184,166,0.6)] scale-[1.03] ring-2 ring-teal-400 ring-offset-2 ring-offset-slate-900 animate-pulse-glow z-10'
                      : 'bg-slate-800/95 border-2 border-slate-700/90 hover:border-teal-400 text-slate-200 hover:text-white shadow-[0_5px_0_#0f172a,0_4px_10px_rgba(0,0,0,0.3)] hover:shadow-[0_5px_0_#064e3b,0_6px_14px_rgba(20,184,166,0.2)] active:shadow-[0_2px_0_#0f172a]'
                  }`}
                >
                  {/* Glowing Edge highlight */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20 pointer-events-none" />

                  <span className="leading-snug tracking-wide text-xs sm:text-sm break-words mr-1">{item.text}</span>

                  {/* Status Indicator Icon */}
                  <div className="shrink-0">
                    {isMatched ? (
                      <div className="flex items-center space-x-1">
                        {isRecent && <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-star" />}
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-emerald-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                      </div>
                    ) : isError ? (
                      <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-400/60 flex items-center justify-center text-rose-300">
                        <XCircle className="w-4 h-4 text-rose-400" />
                      </div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-600 group-hover:bg-teal-400 transition" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
