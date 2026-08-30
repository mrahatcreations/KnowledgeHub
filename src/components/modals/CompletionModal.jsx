import React, { useEffect, useState } from 'react';
import { Trophy, RefreshCw, ArrowRight, Volume2, CheckCircle2, XCircle, AlertCircle, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../audio/SoundSynthesizer';
import StarRating from '../StarRating';

export default function CompletionModal({ 
  level, 
  totalStars = 0, 
  isFiveStar = false, 
  isMastered: propMastered,
  mistakes = [],
  totalStages = 10,
  correctStagesCount,
  onNextLevel, 
  onRetryLevel, 
  onBackToMap 
}) {
  const earnedStarsNum = Number(Number(totalStars).toFixed(1));
  const isMastered = propMastered || isFiveStar || earnedStarsNum >= 5.0;
  const [activeTab, setActiveTab] = useState(mistakes.length > 0 ? 'mistakes' : 'score');

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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 rounded-2xl w-full max-w-sm sm:max-w-md mx-3 sm:mx-4 shadow-xl border border-slate-800 animate-pop overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]">
        {/* Header / Score Banner */}
        <div className="p-4 sm:p-5 text-center text-white relative shrink-0 border-b border-slate-800 bg-slate-900/60">
          <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-2">
            {isMastered ? (
              <Trophy className="w-6 h-6 text-amber-400" />
            ) : (
              <Award className="w-6 h-6 text-indigo-400" />
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
            {isMastered ? (
              <>
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>৫-স্টার পারফেক্ট মাস্টারি!</span>
              </>
            ) : (
              <span>{earnedStarsNum.toFixed(1).replace('.0', '')} / ৫.০ স্টার অর্জিত</span>
            )}
          </h2>

          {/* 5-Star Display Grid with 0.5 step half-stars */}
          <div className="flex items-center justify-center my-3">
            <StarRating stars={earnedStarsNum} maxStars={5} size="lg" />
          </div>

          <p className="text-xs text-slate-300 leading-relaxed px-1">
            {isMastered
              ? 'অসাধারণ দক্ষতা! সবগুলো ১০টি ধাপে ১ম সুযোগে সঠিক উত্তর দিয়ে পূর্ণ ৫-স্টার (প্রতি ধাপে ০.৫) অর্জন করেছেন।'
              : `আপনি ৫.০ এর মধ্যে ${earnedStarsNum.toFixed(1).replace('.0', '')} স্টার অর্জন করেছেন। পরবর্তী লেভেলের জন্য পূর্ণ ৫-স্টার প্রয়োজন (প্রতি ধাপে ০.৫ স্টার)।`}
          </p>
        </div>

        {/* Tab Switcher if mistakes exist */}
        {mistakes.length > 0 && (
          <div className="flex border-b border-slate-800 bg-slate-950/60 px-2 pt-1 shrink-0">
            <button
              onClick={() => setActiveTab('mistakes')}
              className={`flex-1 py-2 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'mistakes'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-400'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>ভুলগুলোর সামারি ({mistakes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('score')}
              className={`flex-1 py-2 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'score'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-400'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>ফলাফল ও বিশ্লেষণ</span>
            </button>
          </div>
        )}

        {/* Scrollable Body Content */}
        <div className="p-3.5 sm:p-4 overflow-y-auto flex-1 min-h-0 space-y-3 overscroll-contain">
          {activeTab === 'mistakes' && mistakes.length > 0 ? (
            <div className="space-y-2.5">
              <div className="text-[11px] text-slate-400 font-medium mb-1">
                নিচের শব্দগুলোতে ভুল হয়েছিল, রিট্রাই করার আগে শব্দার্থ ও ব্যাখ্যাগুলো দেখে নিন:
              </div>

              {mistakes.map((m, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-left space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{m.word}</span>
                      {m.pos && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 uppercase border border-indigo-500/20">
                          {m.pos}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => sound.speak(m.word)}
                      className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition active:scale-95 cursor-pointer"
                      title="উচ্চারণ শুনুন"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-xs text-slate-300 break-words">
                    <span className="text-slate-400">বাংলা অর্থ:</span>{' '}
                    <span className="text-amber-300 font-bold">{m.meaning}</span>
                  </div>

                  {m.userAnswer && (
                    <div className="flex items-start gap-1.5 text-xs text-rose-300 bg-rose-950/30 px-2 py-1 rounded-lg border border-rose-500/30 break-words">
                      <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-rose-400" />
                      <div className="break-words">
                        <strong>আপনার ভুল উত্তর:</strong> {m.userAnswer}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-1.5 text-xs text-emerald-300 bg-emerald-950/30 px-2 py-1 rounded-lg border border-emerald-500/30 break-words">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-400" />
                    <div className="break-words">
                      <strong>সঠিক উত্তর:</strong> {m.correctAnswer}
                    </div>
                  </div>

                  {m.explanation && (
                    <p className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800 leading-relaxed break-words">
                      {m.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 py-1">
              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">অর্জিত স্টার</div>
                  <div className="text-sm sm:text-base font-bold text-amber-400 font-mono mt-0.5">
                    {earnedStarsNum.toFixed(1).replace('.0', '')} / 5.0
                  </div>
                </div>
                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">সফলতার হার</div>
                  <div className="text-sm sm:text-base font-bold text-indigo-400 font-mono mt-0.5">
                    {accuracyPercent}%
                  </div>
                </div>
                <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">ভুলের সংখ্যা</div>
                  <div className="text-sm sm:text-base font-bold text-rose-400 font-mono mt-0.5">
                    {mistakes.length}
                  </div>
                </div>
              </div>

              {/* Status Message */}
              {isMastered ? (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-start gap-2 text-left">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed break-words">
                    <strong>অভিনন্দন!</strong> আপনি ১০টি ধাপেই ১ম সুযোগে সঠিক উত্তর দিয়ে ৫.০ স্টার অর্জন করেছেন। পরবর্তী লেভেল আনলক হয়েছে এবং ৫০টি রত্ন (Gems) বোনাস যুক্ত হয়েছে।
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs font-medium leading-relaxed text-left break-words">
                  পরবর্তী লেভেলে যাওয়ার জন্য ১০টি ধাপেই ১ম সুযোগে সঠিক উত্তর দিয়ে পূর্ণ ৫-স্টার (প্রতি ধাপে ০.৫) অর্জন করতে হবে। রিট্রাই করার সময় প্রশ্নের ধরন এবং বিকল্পগুলোর পজিশন স্বয়ংক্রিয়ভাবে অদলবদল হবে যাতে ভোকাবুলারি স্থায়ীভাবে আয়ত্ত হয়।
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pinned Footer Actions */}
        <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex flex-col gap-2 shrink-0">
          {isMastered ? (
            <button
              onClick={onNextLevel}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-sm active:scale-95 cursor-pointer"
            >
              <span>পরবর্তী লেভেল খেলুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onRetryLevel}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-sm active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>নতুন বিন্যাসে রিট্রাই করুন</span>
            </button>
          )}

          <button
            onClick={onBackToMap}
            className="w-full min-h-[36px] py-2 px-4 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 font-semibold text-xs transition cursor-pointer"
          >
            লেভেল ম্যাপে ফিরে যান
          </button>
        </div>
      </div>
    </div>
  );
}