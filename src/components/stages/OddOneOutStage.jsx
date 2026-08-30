import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

export default function OddOneOutStage({ stage, onSubmitAnswer, isSecondChance }) {
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [wrongOpts, setWrongOpts] = useState([]);

  const handleSelect = (opt) => {
    if (selectedOpt || wrongOpts.includes(opt)) return;
    sound.playClick();

    const isCorrect = String(opt).trim().toLowerCase() === String(stage.correctAnswer).trim().toLowerCase();

    if (isCorrect) {
      setSelectedOpt(opt);
      onSubmitAnswer(opt);
    } else {
      setWrongOpts(prev => [...prev, opt]);
      onSubmitAnswer(opt);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col space-y-5 animate-pop">
      {/* Question Header Card */}
      <div className={`p-5 rounded-2xl bg-white border-2 text-center shadow-md transition ${
        isSecondChance ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full">
            বেমানান শব্দ
          </span>
          {isSecondChance && (
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full animate-pulse">
              ২য় সুযোগ (0 Star)
            </span>
          )}
        </div>
        <p className="text-base font-bold text-slate-800 mt-2">{stage.categoryTitle}</p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {stage.options.map((opt, i) => {
          const isWrong = wrongOpts.includes(opt);
          const isSelected = selectedOpt === opt;

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              disabled={isWrong || (selectedOpt !== null)}
              className={`p-4 rounded-2xl border-2 font-bold text-sm text-left transition flex items-center justify-between shadow-xs ${
                isWrong
                  ? 'border-rose-200 bg-rose-50 text-rose-400 opacity-60 cursor-not-allowed'
                  : isSelected
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white hover:border-purple-500 hover:bg-purple-50 text-slate-800 hover:shadow-md'
              }`}
            >
              <span>{opt}</span>
              {isWrong ? (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              ) : (
                <span className="text-xs text-slate-400 font-mono">0{i + 1}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
