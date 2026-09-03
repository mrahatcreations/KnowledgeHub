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
  const isPassed = isMastered || earnedStarsNum >= 3.5;
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
            ) : isPassed ? (
              <Award className="w-5 h-5 text-emerald-400" />
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
            ) : isPassed ? (
              <span className="text-emerald-400">{earnedStarsNum.toFixed(1).replace('.0', '')} / 5.0 Stars • Passed</span>
            ) : (
              <span>{earnedStarsNum.toFixed(1).replace('.0', '')} / 5.0 Stars Earned</span>
            )}
          </h2>

          {/* 5-Star Display Grid with 0.5 step half-stars */}
          <div className="flex items-center justify-center my-2.5">
            <StarRating stars={earnedStarsNum} maxStars={5} size="lg" />
          </div>

          <p className="text-xs text-slate-300 font-medium">
            {isMastered
              ? 'Flawless 10/10 stages! +50 Bonus Gems awarded.'
              : isPassed
              ? `Great job! You scored ${earnedStarsNum.toFixed(1)} Stars. Next level unlocked!`
              : `You scored ${earnedStarsNum.toFixed(1)} out of 5.0 Stars (3.5+ Stars needed to unlock next level).`}
          </p>
        </div>

        {/* Navigation Tabs (if mistakes present) */}
        {mistakes && mistakes.length > 0 && (
          <div className="flex border-b border-slate-800 bg-slate-950 font-mono text-xs font-bold shrink-0">
            <button
              onClick={() => setActiveTab('score')}
              className={`flex-1 py-2.5 px-3 text-center transition border-b-2 ${
                activeTab === 'score'
                  ? 'border-indigo-500 text-indigo-400 bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Score Breakdown
            </button>
            <button
              onClick={() => setActiveTab('mistakes')}
              className={`flex-1 py-2.5 px-3 text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === 'mistakes'
                  ? 'border-amber-500 text-amber-400 bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Review Mistakes</span>
              <span className="px-1.5 py-0.2 rounded-none bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px]">
                {mistakes.length}
              </span>
            </button>
          </div>
        )}

        {/* Scrollable Body Content */}
        <div className="p-4 overflow-y-auto flex-1 min-h-0 space-y-3 overscroll-contain">
          {activeTab === 'mistakes' && mistakes && mistakes.length > 0 ? (
            <div className="space-y-2.5">
              <div className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between pb-1 border-b border-slate-800">
                <span>Mistakes Tracker ({mistakes.length})</span>
                <span className="text-[10px] text-amber-400">Study to improve</span>
              </div>

              {mistakes.map((m, idx) => (
                <div key={idx} className="p-3 bg-slate-900/80 border border-slate-800 rounded-none text-left space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline space-x-1.5">
                      <span className="font-montserrat font-black text-sm sm:text-base text-white tracking-wide">
                        {m.word}
                      </span>
                      {m.pos && (
                        <span className="text-[10px] font-mono text-slate-400">({m.pos})</span>
                      )}
                    </div>
                    <button
                      onClick={() => sound.speak(m.word)}
                      className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
                      title="Pronounce"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {m.meaning && (
                    <div className="text-xs text-amber-300 font-bold">
                      {m.meaning}
                    </div>
                  )}

                  {m.userAnswer && (
                    <div className="flex items-center space-x-1.5 text-[11px] text-rose-300 font-mono">
                      <XCircle className="w-3 h-3 text-rose-400 shrink-0" />
                      <span className="truncate">Your attempt: <span className="line-through">{m.userAnswer}</span></span>
                    </div>
                  )}

                  {m.correctAnswer && (
                    <div className="flex items-center space-x-1.5 text-[11px] text-emerald-300 font-mono">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate font-bold">Solution: {m.correctAnswer}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-none">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Stars</div>
                  <div className="text-sm sm:text-base font-bold text-amber-400 mt-0.5">
                    {earnedStarsNum.toFixed(1)}/5.0
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
                    Flawless run! You answered all 10 stages on your 1st attempt. Next level is unlocked!
                  </div>
                </div>
              ) : isPassed ? (
                <div className="p-3 rounded-none bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-start gap-2 text-left">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed break-words">
                    <strong className="font-mono uppercase tracking-wider text-emerald-400 block mb-0.5">Level Passed!</strong>
                    You earned {earnedStarsNum.toFixed(1)} Stars. Next level is unlocked! You can proceed or retry anytime for 5.0 Mastery.
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-none bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-medium leading-relaxed text-left break-words">
                  <strong className="font-mono uppercase tracking-wider text-amber-400 block mb-0.5">Unlock Requirement</strong>
                  Score at least 3.5 Stars (70%+) to unlock the next level. Click Retry below to try again!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pinned Footer Actions */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex flex-col gap-2 shrink-0 font-mono">
          {isPassed ? (
            <>
              <button
                onClick={onNextLevel}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-none bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-sm cursor-pointer border border-emerald-400/40"
              >
                <span>Play Next Level</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {!isMastered && (
                <button
                  onClick={onRetryLevel}
                  className="w-full min-h-[36px] py-2 px-4 rounded-none bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry for 5.0 Star Mastery</span>
                </button>
              )}
            </>
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