import React, { useEffect } from 'react';
import { Star, Trophy, Shuffle, ArrowRight, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CompletionModal({ 
  level, 
  totalStars, 
  isFiveStar, 
  onNextLevel, 
  onRetryLevel, 
  onBackToMap 
}) {
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-pop text-center">
        {/* Top Icon */}
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm ${
          isFiveStar ? 'bg-amber-50 text-amber-500 border border-amber-200' : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
        }`}>
          {isFiveStar ? <Trophy className="w-8 h-8" /> : <Shuffle className="w-8 h-8" />}
        </div>

        {/* Title & Stars */}
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {isFiveStar ? 'লেভেল মাস্টার্ড! ৫-স্টার অর্জন!' : 'লেভেল সম্পন্ন হয়েছে!'}
        </h2>

        <div className="flex items-center justify-center space-x-2 my-4">
          {[0, 1, 2, 3, 4].map((s) => (
            <Star
              key={s}
              className={`w-8 h-8 transition-transform ${
                s < totalStars ? 'text-amber-400 fill-amber-400 scale-110' : 'text-slate-200 stroke-1'
              }`}
            />
          ))}
        </div>

        {/* Message */}
        <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6">
          {isFiveStar
            ? 'অভিনন্দন! আপনি ১ম সুযোগেই প্রতিটি ধাপ সঠিকভাবে সম্পন্ন করে ৫-স্টার অর্জন করেছেন এবং পরবর্তী লেভেল আনলক করেছেন।'
            : `আপনি ৫টির মধ্যে ${totalStars}টি স্টার অর্জন করেছেন। পরবর্তী লেভেল আনলক করতে ৫টি স্টার প্রয়োজন। The Blender দিয়ে নতুন বিন্যাসে পুনরায় চেষ্টা করে ৫-স্টার অর্জন করুন।`}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          {isFiveStar ? (
            <button
              onClick={onNextLevel}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center space-x-2 transition shadow-md active:scale-95"
            >
              <span>পরবর্তী লেভেল খেলুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onRetryLevel}
              className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center space-x-2 transition shadow-md active:scale-95"
            >
              <Shuffle className="w-4 h-4" />
              <span>The Blender দিয়ে পুনরায় চেষ্টা করুন</span>
            </button>
          )}

          <button
            onClick={onBackToMap}
            className="w-full py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition active:scale-95"
          >
            লেভেল ম্যাপে ফিরে যান
          </button>
        </div>
      </div>
    </div>
  );
}
