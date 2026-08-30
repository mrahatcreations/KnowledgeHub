import React, { useState } from 'react';
import { Check, X, Sparkles, Volume2, AlertCircle, ArrowRightLeft } from 'lucide-react';
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

  const leftItems = stage?.leftItems || [];
  const rightItems = stage?.rightItems || [];
  const totalPairs = stage?.totalPairs || leftItems.length || 5;
  const matchedCount = matchedIds.length;
  const progressPercent = Math.min(100, Math.round((matchedCount / totalPairs) * 100));

  // Dynamic headers based on stage subtype
  const leftHeader = stage?.leftHeader || (
    stage?.subType === 'synonym' ? 'Word' :
    stage?.subType === 'antonym' ? 'Word' :
    'English Word'
  );
  const leftSub = stage?.leftSub || 'EN';

  const rightHeader = stage?.rightHeader || (
    stage?.subType === 'synonym' ? 'Synonym' :
    stage?.subType === 'antonym' ? 'Antonym' :
    'Meaning'
  );
  const rightSub = stage?.rightSub || (
    stage?.subType === 'synonym' ? 'SYN' :
    stage?.subType === 'antonym' ? 'ANT' :
    'DEF'
  );

  // Handle English Word Click (Left Column)
  const handleLeftClick = (item) => {
    if (matchedIds.includes(item.id) || errorLeftId || isFinished) return;

    sound.playClick();
    sound.speak(item.text);

    if (selectedLeft?.id === item.id) {
      setSelectedLeft(null);
      return;
    }

    setSelectedLeft(item);

    if (selectedRight) {
      checkMatch(item, selectedRight);
    }
  };

  // Handle Meaning Click (Right Column)
  const handleRightClick = (item) => {
    if (matchedIds.includes(item.id) || errorRightId || isFinished) return;

    sound.playClick();

    if (selectedRight?.id === item.id) {
      setSelectedRight(null);
      return;
    }

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
          colors: ['#10b981', '#34d399', '#38bdf8', '#818cf8']
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
            particleCount: 45,
            spread: 60,
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
      }, 650);
    }
  };

  const handleSpeakOnly = (e, text) => {
    e.stopPropagation();
    sound.speak(text);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col space-y-3 sm:space-y-3.5 select-none">
      {/* Progress & Status Header */}
      <div className="bg-[#0e1626]/95 rounded-none p-3 sm:p-3.5 border border-slate-800 shadow-sm flex flex-col space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-none bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shrink-0">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate block">
                {stage?.title || 'Pair Matching'}
              </span>
              <div className="text-[11px] text-slate-400 font-medium truncate block">
                {stage?.instruction || 'Select matching pairs from left and right columns'}
              </div>
            </div>
          </div>

          {/* Pairs Counter Badge */}
          <div
            className={`shrink-0 px-2.5 py-1 rounded-none border font-mono text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              matchedCount === totalPairs
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-xs'
                : 'bg-slate-900 border-slate-800 text-blue-300'
            }`}
          >
            <Sparkles
              className={`w-3.5 h-3.5 ${
                matchedCount === totalPairs ? 'text-white fill-white' : 'text-blue-400'
              }`}
            />
            <span>{matchedCount} / {totalPairs} Pairs</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 border border-slate-800 rounded-none h-2 overflow-hidden">
          <div
            className="h-full rounded-none bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Mistake Alert Banner */}
      {(hadMistake || isSecondChance) && !isFinished && (
        <div className="p-2.5 rounded-none bg-amber-600/20 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold flex items-center justify-center space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Incorrect match. Match the remaining pairs carefully (2nd Chance)</span>
        </div>
      )}

      {/* Success Banner when all matched */}
      {isFinished && (
        <div className="p-2.5 rounded-none bg-emerald-600 border border-emerald-400 text-white text-xs sm:text-sm font-black flex items-center justify-center space-x-2 shadow-md animate-pop">
          <Check className="w-4 h-4 text-white stroke-[3] shrink-0" />
          <span>COMPLETED! ALL PAIRS MATCHED!</span>
        </div>
      )}

      {/* Dual-Column Tile Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-0.5">
        {/* Left Column */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-800">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1.5 truncate">
              <span className="w-2 h-2 rounded-none bg-blue-500 shrink-0 inline-block" />
              <span className="truncate">{leftHeader}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-bold font-mono shrink-0">
              {leftSub}
            </span>
          </div>

          <div className="flex flex-col space-y-2">
            {leftItems.map((item) => {
              const isMatched = matchedIds.includes(item.id);
              const isSelected = selectedLeft?.id === item.id;
              const isError = errorLeftId === item.id;
              const isRecent = recentMatchedId === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleLeftClick(item)}
                  disabled={isMatched || isFinished}
                  className={`w-full min-h-[52px] sm:min-h-[56px] p-3 rounded-none font-bold text-left transition-all duration-150 flex items-center justify-between group relative border cursor-pointer ${
                    isMatched
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_3px_0_#065f46] opacity-95'
                      : isError
                      ? 'bg-rose-600 border-2 border-rose-300 text-white animate-shake shadow-[0_3px_0_#9f1239]'
                      : isSelected
                      ? 'bg-blue-600 border-2 border-blue-300 text-white shadow-[0_3px_0_#1d4ed8] scale-[1.02]'
                      : 'bg-slate-900 border-slate-800 hover:border-blue-500 text-white shadow-[0_3px_0_#020617] active:translate-y-1 active:shadow-none'
                  }`}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0 mr-1">
                    <span className="tracking-tight font-black break-words min-w-0 leading-tight text-sm sm:text-base text-white">
                      {item.text}
                    </span>
                  </div>

                  {/* Status / Audio Actions */}
                  <div className="shrink-0 flex items-center space-x-1">
                    {isMatched ? (
                      <div className="w-5 h-5 rounded-none bg-emerald-700 border border-emerald-300 flex items-center justify-center text-white">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : isError ? (
                      <div className="w-5 h-5 rounded-none bg-rose-700 border border-rose-300 flex items-center justify-center text-white">
                        <X className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => handleSpeakOnly(e, item.text)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleSpeakOnly(e, item.text);
                          }
                        }}
                        className="p-1 rounded-none text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0 cursor-pointer"
                        title="Listen pronunciation"
                      >
                        <Volume2 className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-800">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center space-x-1.5 truncate">
              <span className="w-2 h-2 rounded-none bg-teal-500 shrink-0 inline-block" />
              <span className="truncate">{rightHeader}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-bold font-mono shrink-0">
              {rightSub}
            </span>
          </div>

          <div className="flex flex-col space-y-2">
            {rightItems.map((item) => {
              const isMatched = matchedIds.includes(item.id);
              const isSelected = selectedRight?.id === item.id;
              const isError = errorRightId === item.id;
              const isRecent = recentMatchedId === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleRightClick(item)}
                  disabled={isMatched || isFinished}
                  className={`w-full min-h-[52px] sm:min-h-[56px] p-3 rounded-none font-bold text-left transition-all duration-150 flex items-center justify-between group relative border cursor-pointer ${
                    isMatched
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_3px_0_#065f46] opacity-95'
                      : isError
                      ? 'bg-rose-600 border-2 border-rose-300 text-white animate-shake shadow-[0_3px_0_#9f1239]'
                      : isSelected
                      ? 'bg-teal-600 border-2 border-teal-300 text-white shadow-[0_3px_0_#0f766e] scale-[1.02]'
                      : 'bg-slate-900 border-slate-800 hover:border-teal-500 text-white shadow-[0_3px_0_#020617] active:translate-y-1 active:shadow-none'
                  }`}
                >
                  <div className="flex-1 min-w-0 mr-1">
                    <span className="leading-snug tracking-normal text-xs sm:text-sm font-bold text-white break-words block">
                      {item.text}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0 flex items-center justify-center">
                    {isMatched ? (
                      <div className="w-5 h-5 rounded-none bg-emerald-700 border border-emerald-300 flex items-center justify-center text-white">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : isError ? (
                      <div className="w-5 h-5 rounded-none bg-rose-700 border border-rose-300 flex items-center justify-center text-white">
                        <X className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-2 h-2 rounded-none bg-slate-600 group-hover:bg-teal-400 transition shrink-0" />
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
