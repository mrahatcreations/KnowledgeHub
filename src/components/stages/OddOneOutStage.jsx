import React, { useState } from 'react';
import { Sparkles, CheckCircle2, XCircle, Volume2, Lightbulb, HelpCircle, Flame } from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

export default function OddOneOutStage({ stage, onSubmitAnswer, isSecondChance }) {
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [wrongOpts, setWrongOpts] = useState([]);
  const [shakingOpt, setShakingOpt] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const effectiveSecondChance = isSecondChance || wrongOpts.length > 0;

  const handleSelect = (opt) => {
    if (selectedOpt || wrongOpts.includes(opt)) return;
    sound.playClick();

    const isCorrect = String(opt).trim().toLowerCase() === String(stage.correctAnswer).trim().toLowerCase();

    if (isCorrect) {
      setSelectedOpt(opt);
      setShowExplanation(true);
      onSubmitAnswer(opt);
    } else {
      setShakingOpt(opt);
      setWrongOpts(prev => [...prev, opt]);
      setShowExplanation(true);

      setTimeout(() => {
        setShakingOpt(null);
      }, 500);

      onSubmitAnswer(opt);
    }
  };

  const handleSpeak = (e, text) => {
    e.stopPropagation();
    sound.speak(text);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col space-y-3.5 sm:space-y-4 animate-pop select-none">
      {/* Mystery Challenge Hint Box */}
      <div 
        className={`p-4 sm:p-5 rounded-2xl bg-slate-900 border-2 text-left shadow-md transition-all duration-200 ${
          effectiveSecondChance 
            ? 'border-amber-500 bg-slate-900' 
            : 'border-slate-800'
        }`}
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-black rounded-lg uppercase tracking-wider shadow-xs">
              Odd One Out
            </span>
          </div>

          {effectiveSecondChance ? (
            <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-xs font-black rounded-lg flex items-center gap-1 shadow-xs">
              <Flame className="w-3.5 h-3.5 fill-slate-950" />
              2nd Chance
            </span>
          ) : (
            <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              1 of 4 is Odd
            </span>
          )}
        </div>

        {/* Category Question / Title */}
        <div className="mt-2">
          <h3 className="text-base sm:text-lg font-black text-white leading-snug break-words">
            {stage.categoryTitle || 'Which word does not belong with the others?'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 leading-relaxed">
            3 words share a relationship—choose the odd word out.
          </p>
        </div>
      </div>

      {/* 4-Card Mystery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {stage.options.map((opt, i) => {
          const isWrong = wrongOpts.includes(opt);
          const isSelected = selectedOpt === opt;
          const isShaking = shakingOpt === opt;
          const cardNum = `0${i + 1}`;

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(opt)}
              disabled={isWrong || (selectedOpt !== null)}
              className={`relative p-3.5 sm:p-4 rounded-2xl border-2 font-bold text-left transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer ${
                isWrong
                  ? 'border-rose-500 bg-rose-600 text-white shadow-[0_4px_0_#9f1239] cursor-not-allowed opacity-90'
                  : isSelected
                  ? 'border-emerald-400 bg-emerald-600 text-white shadow-[0_4px_0_#065f46]'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-blue-500 text-white shadow-[0_4px_0_#020617] active:translate-y-1 active:shadow-none'
              } ${isShaking ? 'animate-shake' : ''}`}
            >
              {/* Left Side: Number Badge & Word */}
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-black shrink-0 ${
                  isWrong
                    ? 'bg-rose-800 text-white'
                    : isSelected
                    ? 'bg-emerald-700 text-white'
                    : 'bg-blue-600 text-white shadow-xs'
                }`}>
                  {cardNum}
                </span>
                <span className="text-sm sm:text-base font-black tracking-tight leading-snug break-words">
                  {opt}
                </span>
              </div>

              {/* Right Side: Audio & Status */}
              <div className="flex items-center space-x-1.5 shrink-0">
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => handleSpeak(e, opt)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSpeak(e, opt);
                    }
                  }}
                  title="Listen pronunciation"
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/80 transition active:scale-90"
                >
                  <Volume2 className="w-4 h-4" />
                </span>

                {isWrong && (
                  <XCircle className="w-5 h-5 text-white shrink-0" />
                )}
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Semantic Explanation Card */}
      {showExplanation && stage.explanation && (
        <div className="p-4 rounded-2xl bg-slate-900 border-2 border-blue-500 shadow-md animate-pop text-left">
          <div className="flex items-center space-x-1.5 text-blue-400 font-bold text-xs sm:text-sm mb-1">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Explanation</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed break-words">
            {stage.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
