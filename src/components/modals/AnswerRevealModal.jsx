import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function AnswerRevealModal({ correctAnswer, explanation, onContinue }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-pop text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-slate-900">সঠিক উত্তর ও ব্যাখ্যা</h3>
        
        <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Correct Answer (সঠিক উত্তর)
          </div>
          <div className="text-lg font-black text-indigo-700 mb-3">
            {correctAnswer}
          </div>

          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Explanation (ব্যাখ্যা)
          </div>
          <div className="text-sm font-medium text-slate-700 leading-relaxed">
            {explanation}
          </div>
        </div>

        <button
          onClick={onContinue}
          className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center space-x-2 transition shadow-md hover:shadow-lg active:scale-95"
        >
          <span>পরবর্তী ধাপে যান</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
