import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function AnswerRevealModal({ correctAnswer, explanation, onContinue }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 rounded-2xl w-full max-w-sm sm:max-w-md mx-3 sm:mx-4 shadow-xl border border-slate-800 animate-pop overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="p-4 text-center shrink-0 border-b border-slate-800 bg-slate-900/80">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-2">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">সঠিক উত্তর ও ব্যাখ্যা</h3>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto flex-1 min-h-0 space-y-3 text-left overscroll-contain">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-indigo-400 font-bold uppercase tracking-wider mb-1">
              Correct Answer (সঠিক উত্তর)
            </div>
            <div className="text-base sm:text-lg font-bold text-amber-300 break-words">
              {correctAnswer}
            </div>
          </div>

          {explanation && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Explanation (ব্যাখ্যা)
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed break-words">
                {explanation}
              </div>
            </div>
          )}
        </div>

        {/* Pinned Footer Action */}
        <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 shrink-0">
          <button
            onClick={onContinue}
            className="w-full min-h-[42px] py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-sm active:scale-95 cursor-pointer"
          >
            <span>পরবর্তী ধাপে যান</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
