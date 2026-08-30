import React, { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

export default function MatchingStage({ stage, onSubmitAnswer, isSecondChance }) {
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [errorIds, setErrorIds] = useState([]);
  const [hadMistake, setHadMistake] = useState(false);

  const handleLeftClick = (item) => {
    if (matchedIds.includes(item.id)) return;
    sound.playClick();
    setSelectedLeft(item);
    if (selectedRight) {
      checkMatch(item, selectedRight);
    }
  };

  const handleRightClick = (item) => {
    if (matchedIds.includes(item.id)) return;
    sound.playClick();
    setSelectedRight(item);
    if (selectedLeft) {
      checkMatch(selectedLeft, item);
    }
  };

  const checkMatch = (left, right) => {
    if (!left || !right) return;

    if (left.id === right.id) {
      // Correct match
      sound.playCorrect();
      const updated = [...matchedIds, left.id];
      setMatchedIds(updated);
      setSelectedLeft(null);
      setSelectedRight(null);

      if (updated.length >= stage.totalPairs) {
        setTimeout(() => {
          onSubmitAnswer(true);
        }, 500);
      }
    } else {
      // Wrong match
      sound.playWrong();
      setErrorIds([left.id, right.id]);
      if (!hadMistake) {
        setHadMistake(true);
        sound.playSecondChance();
      }

      setTimeout(() => {
        setErrorIds([]);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col space-y-4 animate-pop">
      {hadMistake && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center space-x-1.5 animate-pulse">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>ভুল মিলকরণ হয়েছে! সবকটি জোড়া মেলান (২য় সুযোগ)</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Left Column (English Words) */}
        <div className="flex flex-col space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">ইংরেজি শব্দ</div>
          {stage.leftItems.map((item) => {
            const isMatched = matchedIds.includes(item.id);
            const isSelected = selectedLeft?.id === item.id;
            const isError = errorIds.includes(item.id);

            return (
              <button
                key={item.id}
                onClick={() => handleLeftClick(item)}
                disabled={isMatched}
                className={`p-4 rounded-2xl border-2 font-bold text-sm text-left transition flex items-center justify-between ${
                  isMatched
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 opacity-80'
                    : isError
                    ? 'bg-rose-50 border-rose-400 text-rose-800 animate-shake'
                    : isSelected
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-md ring-2 ring-indigo-300'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-indigo-400 shadow-xs'
                }`}
              >
                <span>{item.text}</span>
                {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </button>
            );
          })}
        </div>

        {/* Right Column (Bengali Meanings) */}
        <div className="flex flex-col space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">বাংলা অর্থ</div>
          {stage.rightItems.map((item) => {
            const isMatched = matchedIds.includes(item.id);
            const isSelected = selectedRight?.id === item.id;
            const isError = errorIds.includes(item.id);

            return (
              <button
                key={item.id}
                onClick={() => handleRightClick(item)}
                disabled={isMatched}
                className={`p-4 rounded-2xl border-2 font-medium text-sm text-left transition flex items-center justify-between ${
                  isMatched
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 opacity-80'
                    : isError
                    ? 'bg-rose-50 border-rose-400 text-rose-800 animate-shake'
                    : isSelected
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-md ring-2 ring-indigo-300'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 shadow-xs'
                }`}
              >
                <span>{item.text}</span>
                {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
