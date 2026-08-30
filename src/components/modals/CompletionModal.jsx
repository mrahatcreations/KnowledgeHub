import React, { useEffect, useState } from 'react';
import { Trophy, RefreshCw, ArrowRight, Volume2, CheckCircle2, XCircle, AlertCircle, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../audio/SoundSynthesizer';
import StarRating from '../StarRating';

export default function CompletionModal({ 
  level, 
  totalStars = 0, 
  isFiveStar = false, 
  isTenStar = false,
  isMastered: propMastered,
  mistakes = [],
  totalStages = 10,
  correctStagesCount,
  onNextLevel, 
  onRetryLevel, 
  onBackToMap 
}) {
  const earnedStarsNum = Number(Number(totalStars).toFixed(1));
  const isMastered = Boolean(propMastered || isFiveStar || isTenStar || earnedStarsNum >= 5.0);
  const [activeTab, setActiveTab] = useState(mistakes.length > 0 && !isMastered ? 'mistakes' : 'score');

  useEffect(() => {
    if (isMastered) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  }, [isMastered]);

  const accuracyPercent = Math.round((earnedStarsNum / 5.0) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn">
      <div className="bg-slate-950 rounded-none w-full max-w-sm sm:max-w-md mx-auto shadow-2xl border border-slate-800 animate-pop overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]">
        {/* Header / Score Banner */}
        <div className="p-4 sm:p-5 text-center text-white relative shrink-0 border-b border-slate-800 bg-slate-900/80">
          <div className="w-10 h-10 rounded-none bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto mb-2">
            {isMastered ? (
              <Trophy className="w-5 h-5 text-amber-400" />
            ) : (
              <Award className="w-5 h-5 text-indigo-400" />
            )}
          </div>

          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-0.5">
            {level ? `Level ${level.level_id} Recap` : 'Level Summary'}
          </div>

          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center justify-center gap-1.5 font-mono uppercase">
            {isMastered ? (
              <>
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>5.0 Star Perfect Mastery</span>
              </>
            ) : (
              <span>{earnedStarsNum.toFixed(1).replace('.0', '')} / 5.0 Stars Earned</span>
            )}
          </h2>

          {/* 5-Star Display Grid with 0.5 step half-stars */}
          <div className="flex items-center justify-center my-2.5">
            <StarRating stars={earnedStarsNum} maxStars={5} size="lg" />
          </div>

          <p className="text-xs text-slate-300 leading-relaxed px-1 font-sans">
            {isMastered
              ? 'Flawless execution. You answered all 10 stages correctly on your 1st attempt to unlock full 5.0 Stars.'
              : `You scored ${earnedStarsNum.toFixed(1).replace('.0', '')} out of 5.0 Stars. 5.0 Stars required to unlock the next level (0.5 stars per stage).`}
          </p>
        </div>

        {/* Tab Switcher if mistakes exist */}
        {mistakes.length > 0 && (
          <div className="flex border-b border-slate-800 bg-slate-900/90 px-2 shrink-0 font-mono">
            <button
              onClick={() => setActiveTab('mistakes')}
              className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider border-b-2 transition flex items-center justify-center gap-1.5 cursor-pointer rounded-none ${
                activeTab === 'mistakes'
                  ? 'border-indigo-500 text-indigo-300 bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Mistakes ({mistakes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('score')}
              className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider border-b-2 transition flex items-center justify-center gap-1.5 cursor-pointer rounded-none ${
                activeTab === 'score'
                  ? 'border-indigo-500 text-indigo-300 bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Overview</span>
            </button>
          </div>
        )}

        {/* Scrollable Body Content */}
        <div className="p-3.5 sm:p-4 overflow-y-auto flex-1 min-h-0 space-y-3 overscroll-contain">
          {activeTab === 'mistakes' && mistakes.length > 0 ? (
            <div className="space-y-2.5">
              <div className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider mb-1">
                Review Mistakes Before Next Attempt:
              </div>

              {mistakes.map((m, idx) => (
                <div key={idx} className="p-3 rounded-none bg-slate-900/70 border border-slate-800 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-serif">{m.word}</span>
                      {m.pos && (
                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-none bg-indigo-950/80 text-indigo-300 uppercase border border-indigo-500/30">
                          {m.pos}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => sound.speak(m.word)}
                      className="p-1 text-slate-400 hover:text-white rounded-none hover:bg-slate-800 border border-slate-800 transition active:scale-95 cursor-pointer"
                      title="Pronounce word"
                      aria-label={`Pronounce ${m.word}`}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                    </button>
                  </div>

                  <div className="text-xs text-slate-300">
                    <span className="text-slate-400 font-medium">Meaning:</span>{' '}
                    <span className="text-amber-300 font-semibold">{m.meaning}</span>
                  </div>

                  {m.userAnswer && (
                    <div className="flex items-start gap-1.5 text-xs text-rose-300 bg-rose-950/30 px-2 py-1.5 rounded-none border border-rose-500/30 break-words">
                      <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-rose-400" />
                      <div>
                        <strong className="text-rose-400 font-mono text-[10px] uppercase">Your answer:</strong>{' '}
                        <span>{m.userAnswer}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-1.5 text-xs text-emerald-300 bg-emerald-950/30 px-2 py-1.5 rounded-none border border-emerald-500/30 break-words">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-400" />
                    <div>
                      <strong className="text-emerald-400 font-mono text-[10px] uppercase">Correct answer:</strong>{' '}
                      <span>{m.correctAnswer}</span>
                    </div>
                  </div>

                  {m.explanation && (
                    <p className="text-[11px] text-slate-300 bg-slate-950 p-2 rounded-none border border-slate-800 leading-relaxed break-words border-l-2 border-indigo-500/50">
                      {m.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 py-1">
              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-none">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Stars</div>
                  <div className="text-sm sm:text-base font-bold text-amber-400 mt-0.5">
                    {earnedStarsNum.toFixed(1).replace('.0', '')}/5.0
                  </div>
                </div>
                <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-none">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</div>
                  <div className="text-sm sm:text-base font-bold text-indigo-400 mt-0.5">
                    {accuracyPercent}%
                  </div>
                </div>
                <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-none">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Mistakes</div>
                  <div className="text-sm sm:text-base font-bold text-rose-400 mt-0.5">
                    {mistakes.length}
                  </div>
                </div>
              </div>

              {/* Status Message */}
              {isMastered ? (
                <div className="p-3 rounded-none bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-start gap-2 text-left">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed break-words">
                    <strong className="font-mono uppercase tracking-wider text-emerald-400 block mb-0.5">Mastery Achieved</strong>
                    You answered all 10 stages correctly on your 1st attempt. The next level is now unlocked!
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-none bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-medium leading-relaxed text-left break-words">
                  <strong className="font-mono uppercase tracking-wider text-amber-400 block mb-0.5">Mastery Requirement</strong>
                  To unlock the next level, you must answer all 10 stages correctly on your 1st attempt (0.5 star per stage). On retrying, stage modes and options are dynamically scrambled.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pinned Footer Actions */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex flex-col gap-2 shrink-0 font-mono">
          {isMastered ? (
            <button
              onClick={onNextLevel}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-none bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-sm cursor-pointer border border-emerald-400/40"
            >
              <span>Play Next Level</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onRetryLevel}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-none bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-sm cursor-pointer border border-indigo-400/40"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Level</span>
            </button>
          )}

          <button
            onClick={onBackToMap}
            className="w-full min-h-[36px] py-2 px-4 rounded-none bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Back to Map
          </button>
        </div>
      </div>
    </div>
  );
}