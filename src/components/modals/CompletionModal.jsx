import React, { useEffect, useState } from 'react';
import { Star, Trophy, RefreshCw, ArrowRight, BookOpen, Volume2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../audio/SoundSynthesizer';

export default function CompletionModal({ 
  level, 
  totalStars, 
  isFiveStar, 
  mistakes = [],
  onNextLevel, 
  onRetryLevel, 
  onBackToMap 
}) {
  const [activeTab, setActiveTab] = useState(mistakes.length > 0 ? 'mistakes' : 'score');

  useEffect(() => {
    if (isFiveStar) {
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  }, [isFiveStar]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 animate-pop overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header / Score Banner */}
        <div className={`p-6 text-center text-white ${
          isFiveStar ? 'bg-gradient-to-b from-amber-500 to-amber-600' : 'bg-gradient-to-b from-indigo-600 to-indigo-800'
        }`}>
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 shadow-inner">
            {isFiveStar ? <Trophy className="w-8 h-8 text-amber-100" /> : <Star className="w-8 h-8 text-indigo-100" />}
          </div>

          <h2 className="text-2xl font-black tracking-tight">
            {isFiveStar ? 'লেভেল মাস্টার্ড!' : 'লেভেল সম্পন্ন হয়েছে!'}
          </h2>

          <div className="flex items-center justify-center space-x-1.5 my-3">
            {[0, 1, 2, 3, 4].map((s) => (
              <Star
                key={s}
                className={`w-7 h-7 transition-all ${
                  s < totalStars ? 'text-amber-300 fill-amber-300 scale-110' : 'text-black/25 stroke-1'
                }`}
              />
            ))}
          </div>

          <p className="text-xs font-medium text-white/90">
            {isFiveStar
              ? 'দারুণ! সবগুলো ধাপে ১ম সুযোগে সঠিক উত্তর দিয়ে ৫-স্টার অর্জন করেছেন।'
              : `আপনি ${totalStars}/৫ স্টার অর্জন করেছেন। পরবর্তী লেভেলের জন্য ৫-স্টার প্রয়োজন।`}
          </p>
        </div>

        {/* Tab Switcher if mistakes exist */}
        {mistakes.length > 0 && (
          <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
            <button
              onClick={() => setActiveTab('mistakes')}
              className={`flex-1 pb-2.5 text-xs font-black border-b-2 transition flex items-center justify-center space-x-1.5 ${
                activeTab === 'mistakes'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>ভুলগুলোর সামারি ({mistakes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('score')}
              className={`flex-1 pb-2.5 text-xs font-black border-b-2 transition flex items-center justify-center space-x-1.5 ${
                activeTab === 'score'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>ফলাফল</span>
            </button>
          </div>
        )}

        {/* Scrollable Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'mistakes' && mistakes.length > 0 ? (
            <div className="space-y-3">
              <div className="text-xs text-slate-500 font-semibold mb-2">
                নিচের শব্দগুলোতে ভুল হয়েছিল, রিট্রাই করার আগে ভালো করে দেখে নিন:
              </div>

              {mistakes.map((m, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-black text-slate-900">{m.word}</span>
                      {m.pos && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 uppercase">
                          {m.pos}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => sound.speak(m.word)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-white transition"
                      title="Pronounce"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-slate-700">
                    <strong className="text-slate-500">বাংলা অর্থ:</strong> <span className="text-amber-700 font-bold">{m.meaning}</span>
                  </div>

                  {m.userAnswer && (
                    <div className="flex items-center space-x-1.5 text-xs text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span><strong>আপনার ভুল উত্তর:</strong> {m.userAnswer}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span><strong>সঠিক উত্তর:</strong> {m.correctAnswer}</span>
                  </div>

                  {m.explanation && (
                    <p className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100 leading-relaxed">
                      {m.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 space-y-3">
              {isFiveStar ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>অভিনন্দন! আপনি কোনো ভুল ছাড়াই লেভেলটি সম্পন্ন করেছেন।</span>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold leading-relaxed text-left">
                  পরবর্তী লেভেলে যেতে হলে সবগুলো স্টেজে ১ম চান্সেই সঠিক উত্তর দিতে হবে। রিট্রাই করার সময় শব্দগুলোর স্টেজের ধরন ও অপশনের পজিশন স্বয়ংক্রিয়ভাবে অদলবদল হয়ে যাবে যাতে আপনি ভালোভাবে শিখতে পারেন।
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col space-y-2">
          {isFiveStar ? (
            <button
              onClick={onNextLevel}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center space-x-2 transition shadow-md active:scale-95"
            >
              <span>পরবর্তী লেভেল খেলুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onRetryLevel}
              className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center space-x-2 transition shadow-md active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>নতুন বিন্যাসে রিট্রাই করুন</span>
            </button>
          )}

          <button
            onClick={onBackToMap}
            className="w-full py-2.5 px-4 rounded-xl text-slate-600 hover:bg-slate-200 font-bold text-xs transition"
          >
            লেভেল ম্যাপে ফিরে যান
          </button>
        </div>
      </div>
    </div>
  );
}