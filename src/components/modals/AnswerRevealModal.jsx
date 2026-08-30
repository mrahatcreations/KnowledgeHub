import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function AnswerRevealModal({ correctAnswer, explanation, onContinue }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-sm sm:max-w-md mx-3 sm:mx-4 shadow-2xl border border-slate-100 animate-pop overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 text-center shrink-0 border-b border-slate-100 bg-white">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-2.5 shadow-xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">সঠিক উত্তর ও ব্যাখ্যা</h3>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 space-y-3.5 text-left overscroll-contain">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 shadow-xs">
            <div className="text-[11px] sm:text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">
              Correct Answer (সঠিক উত্তর)
            </div>
            <div className="text-base sm:text-lg font-black text-indigo-950 break-words">
              {correctAnswer}
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-1.5">
            <div className="text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">
              Explanation (ব্যাখ্যা)
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed break-words">
              {explanation}
            </div>
          </div>
        </div>

        {/* Pinned Footer Action */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <button
            onClick={onContinue}
            className="w-full min-h-[46px] py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
          >
            <span>পরবর্তী ধাপে যান</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

