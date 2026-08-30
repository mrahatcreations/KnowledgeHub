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
        className={`relative overflow-hidden p-4 rounded-2xl bg-slate-900 border text-left shadow-sm transition-all duration-200 ${
          effectiveSecondChance 
            ? 'border-amber-500/40' 
            : 'border-slate-800'
        }`}
      >
        <div className="relative z-10">
          {/* Top Badges */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="px-2.5 py-0.5 bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 text-[11px] sm:text-xs font-bold rounded-full uppercase tracking-wider">
                বেমানান শব্দ চ্যালেঞ্জ
              </span>
            </div>

            {effectiveSecondChance ? (
              <span className="px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-bold rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400 shrink-0" />
                ২য় সুযোগ (০ স্টার)
              </span>
            ) : (
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-indigo-400 shrink-0" />
                ৪টির মধ্যে ১টি বেমানান
              </span>
            )}
          </div>

          {/* Category Question / Title */}
          <div className="mt-1">
            <h3 className="text-sm sm:text-base font-bold text-white leading-snug break-words">
              {stage.categoryTitle || 'নিচের শব্দগুলোর মধ্যে কোনটি বেমানান বা বিপরীত?'}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5 leading-relaxed">
              বাকি ৩টি শব্দ সমার্থক বা একই অর্থবোধক—সঠিক বেমানান শব্দটি বেছে নিন।
            </p>
          </div>
        </div>
      </div>

      {/* 4-Card Mystery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
              className={`game-btn-3d group relative p-3 sm:p-3.5 rounded-xl border font-bold text-left transition-all duration-150 flex items-center justify-between gap-2.5 ${
                isWrong
                  ? 'border-rose-500/40 bg-rose-950/30 text-rose-300 opacity-60 cursor-not-allowed shadow-none'
                  : isSelected
                  ? 'game-btn-emerald bg-emerald-600 border-emerald-400 text-white'
                  : 'game-btn-slate bg-slate-900 border-slate-800 text-slate-100 hover:border-slate-700 hover:text-white'
              } ${isShaking ? 'animate-shake' : ''}`}
            >
              {/* Left Side: Number Badge & Word */}
              <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[11px] font-bold shrink-0 border ${
                  isWrong
                    ? 'bg-rose-900/40 border-rose-500/50 text-rose-200'
                    : isSelected
                    ? 'bg-emerald-700 border-emerald-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-indigo-300'
                }`}>
                  {cardNum}
                </span>
                <span className="text-xs sm:text-sm md:text-base font-bold tracking-tight leading-snug break-words">
                  {opt}
                </span>
              </div>

              {/* Right Side: Audio & Status */}
              <div className="flex items-center space-x-1 shrink-0">
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
                  className="p-1 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition active:scale-90"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </span>

                {isWrong && (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
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
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm animate-pop text-left">
          <div className="flex items-center space-x-1.5 text-indigo-300 font-bold text-xs sm:text-sm mb-1">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
            <span>শব্দার্থ ও বিশ্লেষণ (Semantic Explanation)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed break-words">
            {stage.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
