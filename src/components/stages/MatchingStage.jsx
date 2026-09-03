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
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#1e293b] shadow-sm space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-[#0f172a] text-blue-300 text-[10px] sm:text-[11px] font-mono font-bold rounded-lg uppercase tracking-wider">
              MATCH PAIRS
            </span>
            <span className="text-xs sm:text-sm font-bold text-white font-montserrat">
              {stage.prompt || 'Match terms with meanings'}
            </span>
          </div>

          <div 
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 shrink-0 ${
              matchedCount === totalPairs
                ? 'bg-[#059669] text-white'
                : 'bg-[#0f172a] text-slate-300'
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
        <div className="w-full bg-[#0f172a] rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#2563eb] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Mistake Alert Banner */}
      {(hadMistake || isSecondChance) && !isFinished && (
        <div className="p-2.5 rounded-xl bg-amber-600/20 text-amber-300 text-xs font-mono font-bold flex items-center justify-center space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Match remaining pairs carefully (2nd Chance)</span>
        </div>
      )}

      {/* Success Banner */}
      {isFinished && (
        <div className="p-2.5 rounded-xl bg-[#059669] text-white text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 shadow-sm animate-pop">
          <Check className="w-4 h-4 text-white stroke-[3] shrink-0" />
          <span>COMPLETED! ALL PAIRS MATCHED!</span>
        </div>
      )}

      {/* Dual-Column Tile Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-0.5">
        {/* Left Column */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-700/60">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 inline-block" />
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

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleLeftClick(item)}
                  disabled={isMatched || isFinished}
                  className={`w-full min-h-[52px] sm:min-h-[56px] p-3 rounded-xl font-bold text-left transition-all duration-150 flex items-center justify-between group relative cursor-pointer shadow-sm ${
                    isMatched
                      ? 'bg-[#059669] text-white'
                      : isError
                      ? 'bg-[#b91c1c] text-white animate-shake'
                      : isSelected
                      ? 'bg-[#2563eb] text-white scale-[1.02]'
                      : 'bg-[#1e293b] hover:bg-[#283548] text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0 mr-1">
                    <span className="tracking-tight font-bold break-words min-w-0 leading-tight text-sm sm:text-base text-white">
                      {item.text}
                    </span>
                  </div>

                  {/* Status / Audio Actions */}
                  <div className="shrink-0 flex items-center space-x-1">
                    {isMatched ? (
                      <div className="w-5 h-5 rounded-lg bg-[#047857] flex items-center justify-center text-white">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : isError ? (
                      <div className="w-5 h-5 rounded-lg bg-[#991b1b] flex items-center justify-center text-white">
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
                        className="p-1 rounded-lg text-slate-400 hover:text-white bg-[#0f172a] transition shrink-0 cursor-pointer"
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
          <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-700/60">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center space-x-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 inline-block" />
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

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleRightClick(item)}
                  disabled={isMatched || isFinished}
                  className={`w-full min-h-[52px] sm:min-h-[56px] p-3 rounded-xl font-bold text-left transition-all duration-150 flex items-center justify-between group relative cursor-pointer shadow-sm ${
                    isMatched
                      ? 'bg-[#059669] text-white'
                      : isError
                      ? 'bg-[#b91c1c] text-white animate-shake'
                      : isSelected
                      ? 'bg-[#0d9488] text-white scale-[1.02]'
                      : 'bg-[#1e293b] hover:bg-[#283548] text-white'
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
                      <div className="w-5 h-5 rounded-lg bg-[#047857] flex items-center justify-center text-white">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : isError ? (
                      <div className="w-5 h-5 rounded-lg bg-[#991b1b] flex items-center justify-center text-white">
                        <X className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-600 group-hover:bg-teal-400 transition shrink-0" />
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
