import React, { useState } from 'react';
import { Sparkles, CheckCircle2, XCircle, Volume2, Lightbulb, HelpCircle } from 'lucide-react';
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
      {/* Mystery Challenge Hint Box (Hard Corners / Editorial Standard) */}
      <div 
        className={`p-4 sm:p-5 rounded-none bg-slate-900 border text-left shadow-sm transition-all duration-200 ${
          effectiveSecondChance 
            ? 'border-amber-500/60 bg-slate-900' 
            : 'border-slate-800'
        }`}
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] sm:text-[11px] font-mono font-bold rounded-none uppercase tracking-widest">
              ODD ONE OUT
            </span>
          </div>

          {effectiveSecondChance ? (
            <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold rounded-none flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>2nd Chance</span>
            </span>
          ) : (
            <span className="text-[11px] font-mono font-medium text-slate-400 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>1 OF 4 IS ANOMALOUS</span>
            </span>
          )}
        </div>

        {/* Category Question / Title */}
        <div className="mt-1">
          <h3 className="text-base sm:text-lg font-bold text-white leading-snug font-luxury-serif break-words">
            {stage.categoryTitle || 'Which word does not belong with the others?'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1 leading-relaxed">
            Three terms share a semantic connection — identify the single anomaly.
          </p>
        </div>
      </div>

      {/* 4-Card Mystery Grid (Hard Corners & High-Contrast Options) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
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
              className={`relative p-3.5 sm:p-4 rounded-none border-2 font-bold text-left transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer ${
                isWrong
                  ? 'border-rose-300 bg-rose-600 text-white shadow-[0_4px_0_#9f1239] cursor-not-allowed opacity-90'
                  : isSelected
                  ? 'border-emerald-300 bg-emerald-600 text-white shadow-[0_4px_0_#065f46]'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-indigo-400 text-white shadow-[0_4px_0_#020617] active:translate-y-1 active:shadow-none'
              } ${isShaking ? 'animate-shake' : ''}`}
            >
              {/* Left Side: Number Badge & Word */}
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <span className={`w-7 h-7 rounded-none flex items-center justify-center font-mono text-[11px] font-bold shrink-0 border ${
                  isWrong
                    ? 'bg-rose-700 border-rose-300 text-white'
                    : isSelected
                    ? 'bg-emerald-700 border-emerald-300 text-white'
                    : 'bg-slate-950 border-slate-700 text-blue-300'
                }`}>
                  {cardNum}
                </span>
                <span className="text-sm sm:text-base font-bold tracking-tight leading-snug break-words font-luxury-serif">
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
                  className="p-1.5 rounded-none text-slate-400 hover:text-white hover:bg-slate-700/80 transition active:scale-90 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </span>

                {isWrong && (
                  <XCircle className="w-4 h-4 text-white shrink-0" />
                )}
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Semantic Explanation Card (Hard Corners / Luxury Editorial) */}
      {showExplanation && stage.explanation && (
        <div className="p-4 rounded-none bg-slate-950 border border-indigo-500/30 shadow-sm animate-pop text-left">
          <div className="flex items-center space-x-1.5 text-amber-400 font-mono font-bold text-[11px] uppercase tracking-wider mb-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Explanation & Analysis</span>
          </div>
          <p className="font-luxury-serif text-xs sm:text-sm text-slate-200 font-medium leading-relaxed break-words">
            {stage.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
