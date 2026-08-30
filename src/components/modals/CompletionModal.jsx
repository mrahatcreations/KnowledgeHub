import React, { useEffect, useState } from 'react';
import { Star, Trophy, RefreshCw, ArrowRight, Volume2, CheckCircle2, XCircle, AlertCircle, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../audio/SoundSynthesizer';

export default function CompletionModal({ 
  level, 
  totalStars = 0, 
  isTenStar = false,
  isFiveStar = false, 
  mistakes = [],
  totalStages = 10,
  onNextLevel, 
  onRetryLevel, 
  onBackToMap 
}) {
  const effectiveTotalStages = totalStages || 10;
  const isMastered = isTenStar || isFiveStar || totalStars >= effectiveTotalStages;
  const [activeTab, setActiveTab] = useState(mistakes.length > 0 ? 'mistakes' : 'score');

  useEffect(() => {
    if (isMastered) {
      try {
        // Multi-burst celebratory confetti
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 300);
      } catch (e) {}
    }
  }, [isMastered]);

  const accuracyPercent = Math.round((totalStars / effectiveTotalStages) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-sm sm:max-w-md mx-3 sm:mx-4 shadow-2xl border border-slate-100 animate-pop overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]">
        {/* Header / Score Banner */}
        <div className={`p-4 sm:p-5 text-center text-white relative shrink-0 ${
          isMastered 
            ? 'bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700' 
            : 'bg-gradient-to-b from-indigo-600 via-indigo-700 to-slate-900'
        }`}>
          {/* Trophy / Star Avatar */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-2 shadow-inner">
            {isMastered ? (
              <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-amber-100 animate-bounce" />
            ) : (
              <Award className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-100" />
            )}
          </div>

          <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            {isMastered ? (
              <>
                <Sparkles className="w-5 h-5 text-amber-200 shrink-0" />
                <span>১০-স্টার পারফেক্ট মাস্টারি!</span>
              </>
            ) : (
              <span>লেভেল সম্পন্ন হয়েছে!</span>
            )}
          </h2>

          {/* 10-Star Display Grid: 2 rows of 5 stars for 10 stars, fitting cleanly on 320px screens */}
          <div className="grid grid-cols-5 gap-1 sm:gap-1.5 justify-items-center w-fit mx-auto my-2.5 px-2">
            {Array.from({ length: effectiveTotalStages }).map((_, s) => {
              const isEarned = s < totalStars;
              return (
                <Star
                  key={s}
                  className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300 transform ${
                    isEarned 
                      ? 'text-amber-300 fill-amber-300 scale-110 drop-shadow-[0_0_8px_rgba(253,224,71,0.9)]' 
                      : 'text-black/25 stroke-1'
                  }`}
                />
              );
            })}
          </div>

          <p className="text-xs sm:text-sm font-medium text-white/95 leading-relaxed px-1">
            {isMastered
              ? 'অসাধারণ দক্ষতা! সবগুলো ১০টি ধাপে ১ম সুযোগে সঠিক উত্তর দিয়ে পূর্ণ ১০-স্টার অর্জন করেছেন।'
              : `আপনি ${effectiveTotalStages} টির মধ্যে ${totalStars} স্টার অর্জন করেছেন। পরবর্তী লেভেলের জন্য পূর্ণ ১০-স্টার প্রয়োজন।`}
          </p>
        </div>

        {/* Tab Switcher if mistakes exist */}
        {mistakes.length > 0 && (
          <div className="flex border-b border-slate-200 bg-slate-50 px-2 sm:px-3 pt-1.5 sm:pt-2 shrink-0">
            <button
              onClick={() => setActiveTab('mistakes')}
              className={`flex-1 py-2 sm:pb-2.5 text-xs font-black border-b-2 transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'mistakes'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>ভুলগুলোর সামারি ({mistakes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('score')}
              className={`flex-1 py-2 sm:pb-2.5 text-xs font-black border-b-2 transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'score'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>ফলাফল ও বিশ্লেষণ</span>
            </button>
          </div>
        )}

        {/* Scrollable Body Content */}
        <div className="p-3.5 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-3 sm:space-y-4 overscroll-contain">
          {activeTab === 'mistakes' && mistakes.length > 0 ? (
            <div className="space-y-3">
              <div className="text-xs text-slate-500 font-semibold mb-1">
                নিচের শব্দগুলোতে ভুল হয়েছিল, রিট্রাই করার আগে শব্দার্থ ও ব্যাখ্যাগুলো দেখে নিন:
              </div>

              {mistakes.map((m, idx) => (
                <div key={idx} className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-slate-900">{m.word}</span>
                      {m.pos && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 uppercase">
                          {m.pos}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => sound.speak(m.word)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-white transition active:scale-95 cursor-pointer"
                      title="উচ্চারণ শুনুন"
                      aria-label="উচ্চারণ শুনুন"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-slate-700 break-words">
                    <strong className="text-slate-500">বাংলা অর্থ:</strong>{' '}
                    <span className="text-amber-700 font-bold">{m.meaning}</span>
                  </div>

                  {m.userAnswer && (
                    <div className="flex items-start gap-1.5 text-xs text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 break-words">
                      <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <div className="break-words">
                        <strong>আপনার ভুল উত্তর:</strong> {m.userAnswer}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 break-words">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <div className="break-words">
                      <strong>সঠিক উত্তর:</strong> {m.correctAnswer}
                    </div>
                  </div>

                  {m.explanation && (
                    <p className="text-[11px] sm:text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed break-words">
                      {m.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3.5 py-1">
              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">অর্জিত স্টার</div>
                  <div className="text-base sm:text-lg font-black text-amber-500 font-mono mt-0.5">
                    {totalStars} / {effectiveTotalStages}
                  </div>
                </div>
                <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">সফলতার হার</div>
                  <div className="text-base sm:text-lg font-black text-indigo-600 font-mono mt-0.5">
                    {accuracyPercent}%
                  </div>
                </div>
                <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">ভুলের সংখ্যা</div>
                  <div className="text-base sm:text-lg font-black text-rose-500 font-mono mt-0.5">
                    {mistakes.length}
                  </div>
                </div>
              </div>

              {/* Status Message */}
              {isMastered ? (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-start gap-2 text-left">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed break-words">
                    <strong>অভিনন্দন!</strong> আপনি কোনো ভুল ছাড়া ১০-স্টার অর্জন করেছেন। পরবর্তী লেভেল আনলক হয়েছে এবং ৫০টি রত্ন (Gems) বোনাস যুক্ত হয়েছে।
                  </div>
                </div>
              ) : (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold leading-relaxed text-left break-words">
                  পরবর্তী লেভেলে যাওয়ার জন্য ১০টি ধাপেই ১ম সুযোগে সঠিক উত্তর দিয়ে ১০-স্টার অর্জন করতে হবে। রিট্রাই করার সময় প্রশ্নের ধরন এবং বিকল্পগুলোর পজিশন স্বয়ংক্রিয়ভাবে অদলবদল হবে যাতে ভোকাবুলারি স্থায়ীভাবে আয়ত্ত হয়।
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pinned Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-2 shrink-0">
          {isMastered ? (
            <button
              onClick={onNextLevel}
              className="w-full min-h-[46px] py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
            >
              <span>পরবর্তী লেভেল খেলুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onRetryLevel}
              className="w-full min-h-[46px] py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>নতুন বিন্যাসে রিট্রাই করুন</span>
            </button>
          )}

          <button
            onClick={onBackToMap}
            className="w-full min-h-[38px] py-2 px-4 rounded-xl text-slate-600 hover:bg-slate-200 font-bold text-xs transition cursor-pointer"
          >
            লেভেল ম্যাপে ফিরে যান
          </button>
        </div>
      </div>
    </div>
  );
}