import React, { useState } from 'react';
import { CheckCircle2, XCircle, Sparkles, Volume2, AlertCircle, Link2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../audio/SoundSynthesizer';


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
          particleCount: 15,
          spread: 45,
          startVelocity: 15,
          origin: { y: 0.55 },
          colors: ['#10b981', '#34d399', '#f59e0b', '#6366f1']
        });
      } catch (e) {}

      setTimeout(() => {
        setRecentMatchedId(null);
      }, 1000);

      // Check if all pairs are matched
      if (updatedMatches.length >= totalPairs) {
        setIsFinished(true);
        sound.playVictory();
        
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.5 }
          });
        } catch (e) {}

        setTimeout(() => {
          onSubmitAnswer(true);
        }, 700);
      }
    } else {
      // Mismatch Error
      sound.playWrong();
      setErrorLeftId(left.id);
      setErrorRightId(right.id);
      setHadMistake(true);

      setTimeout(() => {
        setErrorLeftId(null);
        setErrorRightId(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 700);
    }
  };

  const handleSpeakOnly = (e, text) => {
    e.stopPropagation();
    sound.speak(text);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col space-y-3.5 sm:space-y-4 animate-pop select-none">
      {/* Progress & Match Counter Header */}
      <div className="bg-slate-900/90 rounded-2xl p-3 sm:p-3.5 border border-slate-800 shadow-sm flex flex-col space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide truncate block">Matching Progress</span>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate block">
                Select matching pairs from left and right columns
              </div>
            </div>
          </div>

          {/* Pairs Counter Badge */}
          <div className={`shrink-0 px-2.5 sm:px-3 py-1 rounded-xl border flex items-center space-x-1 sm:space-x-1.5 text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all ${
            matchedCount === totalPairs
              ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300'
              : 'bg-slate-800 border-slate-700 text-indigo-300'
          }`}>
            <Sparkles className={`w-3 h-3 ${matchedCount === totalPairs ? 'text-amber-400 fill-amber-400' : 'text-indigo-400'}`} />
            <span>{matchedCount} / {totalPairs} Pairs</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Mistake Alert Banner if occurred */}
      {(hadMistake || isSecondChance) && !isFinished && (
        <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[11px] sm:text-xs font-semibold flex items-center justify-center space-x-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Incorrect match! Carefully match the remaining pairs (2nd Chance)</span>
        </div>
      )}

      {/* Success Banner when all matched */}
      {isFinished && (
        <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 animate-pop">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Excellent! All pairs successfully matched!</span>
        </div>
      )}

      {/* Dual-Column Tile Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
        {/* Left Column (English Words) */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 inline-block" />
              <span className="truncate">English Words</span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold font-mono shrink-0">EN</span>
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
                  className={`w-full min-h-[50px] sm:min-h-[56px] p-3 rounded-2xl font-bold text-xs sm:text-sm text-left transition-all duration-150 flex items-center justify-between group relative border-2 cursor-pointer ${
                    isMatched
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_3px_0_#065f46] opacity-90'
                      : isError
                      ? 'bg-rose-600 border-rose-400 text-white animate-shake shadow-[0_3px_0_#9f1239]'
                      : isSelected
                      ? 'bg-blue-600 border-blue-300 text-white shadow-[0_3px_0_#1d4ed8] scale-[1.02]'
                      : 'bg-slate-900 border-slate-800 hover:border-blue-500 text-white shadow-[0_3px_0_#020617] active:translate-y-1 active:shadow-none'
                  }`}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0 mr-1">
                    <span className="tracking-tight font-black break-words min-w-0 leading-tight text-sm sm:text-base">{item.text}</span>
                  </div>

                  {/* Status icon */}
                  <div className="shrink-0 flex items-center space-x-1">
                    {isMatched ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-700 flex items-center justify-center text-white">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    ) : isError ? (
                      <div className="w-6 h-6 rounded-full bg-rose-700 flex items-center justify-center text-white">
                        <XCircle className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleSpeakOnly(e, item.text)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/80 transition shrink-0"
                        title="Listen pronunciation"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column (Meanings / Definitions) */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-teal-400 flex items-center space-x-1 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 inline-block" />
              <span className="truncate">Meaning / Definition</span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold font-mono shrink-0">DEF</span>
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
                  className={`w-full min-h-[50px] sm:min-h-[56px] p-3 rounded-2xl font-bold text-xs sm:text-sm text-left transition-all duration-150 flex items-center justify-between group relative border-2 cursor-pointer ${
                    isMatched
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_3px_0_#065f46] opacity-90'
                      : isError
                      ? 'bg-rose-600 border-rose-400 text-white animate-shake shadow-[0_3px_0_#9f1239]'
                      : isSelected
                      ? 'bg-teal-600 border-teal-300 text-white shadow-[0_3px_0_#0f766e] scale-[1.02]'
                      : 'bg-slate-900 border-slate-800 hover:border-teal-500 text-white shadow-[0_3px_0_#020617] active:translate-y-1 active:shadow-none'
                  }`}
                >
                  <div className="flex-1 min-w-0 mr-1">
                    <span className="leading-snug tracking-normal text-xs sm:text-sm font-bold break-words block">{item.text}</span>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0 flex items-center justify-center">
                    {isMatched ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-700 flex items-center justify-center text-white">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    ) : isError ? (
                      <div className="w-6 h-6 rounded-full bg-rose-700 flex items-center justify-center text-white">
                        <XCircle className="w-4 h-4 text-white" />
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
