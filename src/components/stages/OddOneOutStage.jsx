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
    <div className="w-full max-w-xl mx-auto flex flex-col space-y-3 sm:space-y-3.5 select-none">
      {/* Question Card - Solid Flat + Rounded-2xl */}
      <div 
        className="p-4.5 sm:p-5 rounded-2xl bg-[#1e293b] text-left shadow-sm"
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="px-2.5 py-0.5 bg-[#0f172a] text-blue-300 text-[10px] sm:text-[11px] font-mono font-bold rounded-lg uppercase tracking-wider">
            ODD ONE OUT
          </span>

          {effectiveSecondChance && (
            <span className="px-2.5 py-0.5 bg-amber-600 text-white text-[10px] font-mono font-bold rounded-lg flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-white" />
              <span>2nd Chance</span>
            </span>
          )}
        </div>

        {/* Category Question / Title */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white leading-snug font-montserrat">
            {stage.categoryTitle || 'Which word does not belong with the others?'}
          </h3>
        </div>
      </div>

      {/* 4-Card Option Grid - Solid Flat + Rounded-xl */}
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
              className={`relative p-3.5 sm:p-4 rounded-xl font-bold text-left transition-all duration-150 flex items-center justify-between gap-2.5 cursor-pointer shadow-sm ${
                isWrong
                  ? 'bg-[#b91c1c] text-white cursor-not-allowed opacity-90'
                  : isSelected
                  ? 'bg-[#059669] text-white'
                  : 'bg-[#1e293b] hover:bg-[#283548] text-white active:scale-[0.99]'
              } ${isShaking ? 'animate-shake' : ''}`}
            >
              {/* Left Side: Number Badge & Word */}
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[11px] font-bold shrink-0 ${
                  isWrong
                    ? 'bg-[#7f1d1d] text-white'
                    : isSelected
                    ? 'bg-[#047857] text-white'
                    : 'bg-[#0f172a] text-blue-300'
                }`}>
                  {cardNum}
                </span>
                <span className="text-sm sm:text-base font-bold tracking-tight leading-normal font-montserrat truncate flex-1 min-w-0">
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
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-[#0f172a] transition active:scale-90 cursor-pointer"
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

      {/* Semantic Explanation Card */}
      {showExplanation && stage.explanation && (
        <div className="p-4 rounded-xl bg-[#1e293b] shadow-sm animate-pop text-left">
          <div className="flex items-center space-x-1.5 text-amber-400 font-mono font-bold text-[11px] uppercase tracking-wider mb-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Explanation</span>
          </div>
          <p className="font-montserrat text-xs sm:text-sm text-slate-200 font-medium leading-relaxed break-words">
            {stage.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
