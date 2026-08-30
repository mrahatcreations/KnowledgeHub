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
        className={`relative overflow-hidden p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border-2 text-left shadow-lg transition-all duration-300 ${
          effectiveSecondChance 
            ? 'border-amber-400 bg-amber-50/25 shadow-amber-500/10' 
            : 'border-purple-200 shadow-purple-500/5 hover:border-purple-300'
        }`}
      >
        {/* Subtle Decorative Background Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-indigo-200/30 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10">
          {/* Top Badges */}
          <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-purple-500/30 animate-pulse shrink-0">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 bg-purple-100/80 border border-purple-200 text-purple-800 text-[11px] sm:text-xs font-black rounded-full uppercase tracking-wider">
                বেমানান শব্দ চ্যালেঞ্জ
              </span>
            </div>

            {effectiveSecondChance ? (
              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-amber-100 border border-amber-300 text-amber-900 text-[10px] sm:text-xs font-black rounded-full animate-pulse flex items-center gap-1 shadow-xs">
                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 shrink-0" />
                ২য় সুযোগ (০ স্টার)
              </span>
            ) : (
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 bg-slate-100/90 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-slate-200/60 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-purple-500 shrink-0" />
                ৪টির মধ্যে ১টি বেমানান
              </span>
            )}
          </div>

          {/* Category Question / Title */}
          <div className="mt-1">
            <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-800 leading-snug break-words">
              {stage.categoryTitle || 'নিচের শব্দগুলোর মধ্যে কোনটি বেমানান বা বিপরীত?'}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              বাকি ৩টি শব্দ সমার্থক বা একই অর্থবোধক—সঠিক বেমানান শব্দটি বেছে নিন।
            </p>
          </div>
        </div>
      </div>

      {/* 4-Card Mystery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {stage.options.map((opt, i) => {
          const isWrong = wrongOpts.includes(opt);
          const isSelected = selectedOpt === opt;
          const isShaking = shakingOpt === opt;
          const cardNum = `0${i + 1}`;

          // Dynamic styling logic
          let cardStyle = 'border-slate-200 bg-white text-slate-800 shadow-[0_4px_0_#cbd5e1] hover:shadow-[0_5px_0_#cbd5e1,0_0_20px_rgba(168,85,247,0.22)] hover:border-purple-400 hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_#cbd5e1]';
          let numBadgeStyle = 'bg-slate-100 text-slate-500 border border-slate-200/80 group-hover:bg-purple-100 group-hover:text-purple-700 group-hover:border-purple-300';

          if (isWrong) {
            cardStyle = `border-rose-300 bg-rose-50/90 text-rose-800 shadow-[0_3px_0_#f43f5e] opacity-75 cursor-not-allowed ${
              isShaking ? 'animate-shake' : ''
            }`;
            numBadgeStyle = 'bg-rose-200/90 text-rose-700 border border-rose-300';
          } else if (isSelected) {
            cardStyle = 'border-emerald-500 bg-emerald-50/95 text-emerald-950 shadow-[0_4px_0_#059669,0_0_25px_rgba(16,185,129,0.35)] animate-pulse-glow translate-y-0.5';
            numBadgeStyle = 'bg-emerald-500 text-white border border-emerald-600';
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(opt)}
              disabled={isWrong || (selectedOpt !== null)}
              className={`group relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 font-bold text-left transition-all duration-150 flex items-center justify-between gap-2.5 sm:gap-3 ${cardStyle}`}
            >
              {/* Left Side: Number Badge & Word */}
              <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
                <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center font-mono text-[11px] sm:text-xs font-black shrink-0 transition-all ${numBadgeStyle}`}>
                  {cardNum}
                </span>
                <span className="text-xs sm:text-sm md:text-base font-black tracking-tight leading-snug break-words">
                  {opt}
                </span>
              </div>

              {/* Right Side: Audio Pronunciation & Feedback State */}
              <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
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
                  title="উচ্চারণ শুনুন"
                  className="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-100/70 transition active:scale-90"
                >
                  <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>

                {isWrong && (
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 shrink-0 animate-pop" />
                )}
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0 animate-pop" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Semantic Explanation Card */}
      {showExplanation && stage.explanation && (
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-indigo-50/90 border-2 border-indigo-200/90 shadow-md animate-pop text-left">
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-indigo-900 font-extrabold text-xs sm:text-sm mb-1">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <span>শব্দার্থ ও বিশ্লেষণ (Semantic Explanation)</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed break-words">
            {stage.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
