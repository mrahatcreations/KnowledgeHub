import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';

export default function AnswerRevealModal({ correctAnswer, explanation, onContinue }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn">
      <div className="bg-slate-950 rounded-none w-full max-w-sm sm:max-w-md mx-auto shadow-2xl border border-slate-800 animate-pop overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="p-4 text-center shrink-0 border-b border-slate-800 bg-slate-900/90">
          <div className="w-9 h-9 rounded-none bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-2">
            <BookOpen className="w-4 h-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white font-mono">
            Solution & Explanation
          </h3>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto flex-1 min-h-0 space-y-3 text-left overscroll-contain">
          <div className="p-3.5 rounded-none bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono mb-1">
              Correct Answer
            </div>
            <div className="text-base sm:text-lg font-bold text-amber-300 font-serif break-words">
              {correctAnswer}
            </div>
          </div>

          {explanation && (
            <div className="p-3.5 rounded-none bg-slate-900/50 border border-slate-800 space-y-1.5">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">
                Context & Meaning
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed break-words border-l-2 border-indigo-500/50 pl-2.5 py-0.5">
                {explanation}
              </div>
            </div>
          )}
        </div>

        {/* Pinned Footer Action */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 shrink-0">
          <button
            onClick={onContinue}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-none bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 transition shadow-sm cursor-pointer border border-indigo-400/40"
          >
            <span>Proceed to Next Stage</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
