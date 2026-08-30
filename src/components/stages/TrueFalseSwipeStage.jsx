import React, { useState, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

export default function TrueFalseSwipeStage({ stage, onSubmitAnswer, isSecondChance }) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const startXRef = useRef(0);

  const handleDecision = (choice) => {
    if (isAnswered) return;
    setIsAnswered(true);
    sound.playSwipe();

    setDragOffset(choice === 'TRUE' ? 350 : -350);

    setTimeout(() => {
      const isCorrect = String(choice).trim().toUpperCase() === String(stage.correctAnswer).trim().toUpperCase();
      if (!isCorrect && !isSecondChance) {
        // Reset card on 1st failure for 2nd chance
        setDragOffset(0);
        setIsAnswered(false);
      }
      onSubmitAnswer(choice);
    }, 320);
  };

  // Touch Handlers
  const handleTouchStart = (e) => {
    if (isAnswered) return;
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || isAnswered) return;
    const diff = e.touches[0].clientX - startXRef.current;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging || isAnswered) return;
    setIsDragging(false);

    if (dragOffset > 75) {
      handleDecision('TRUE');
    } else if (dragOffset < -75) {
      handleDecision('FALSE');
    } else {
      setDragOffset(0);
    }
  };

  const rotation = dragOffset * 0.06;
  const trueStampOpacity = Math.max(0, Math.min(1, (dragOffset - 20) / 60));
  const falseStampOpacity = Math.max(0, Math.min(1, (-dragOffset - 20) / 60));

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-6 animate-pop">
      {/* Swipeable Card Area */}
      <div className="relative w-full min-h-[290px]">
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `translateX(${dragOffset}px) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
          className={`absolute inset-0 p-6 rounded-3xl bg-white border-2 shadow-xl flex flex-col justify-between cursor-grab active:cursor-grabbing select-none ${
            isSecondChance ? 'border-amber-400 bg-amber-50/20' : 'border-indigo-100'
          }`}
        >
          {/* Visual Stamps */}
          <div
            style={{ opacity: trueStampOpacity }}
            className="absolute top-6 right-6 border-3 border-emerald-500 text-emerald-600 font-black text-xl px-4 py-1.5 rounded-xl rotate-12 pointer-events-none"
          >
            TRUE
          </div>

          <div
            style={{ opacity: falseStampOpacity }}
            className="absolute top-6 left-6 border-3 border-rose-500 text-rose-600 font-black text-xl px-4 py-1.5 rounded-xl -rotate-12 pointer-events-none"
          >
            FALSE
          </div>

          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">
              সত্য / মিথ্যা যাচাই
            </span>
            {isSecondChance ? (
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full animate-pulse">
                ২য় সুযোগ
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium">ডানে = সত্য | বামে = মিথ্যা</span>
            )}
          </div>

          <div className="text-center py-5">
            <h2 className="text-3xl font-extrabold text-slate-800">{stage.item.word}</h2>
            <div className="my-3 h-0.5 w-12 bg-indigo-100 mx-auto rounded-full" />
            <p className="text-base text-slate-600 font-medium leading-relaxed">
              {stage.statement}
            </p>
          </div>

          <div className="text-center text-xs text-slate-400 font-medium">
            সোয়াইপ করুন অথবা নিচের বাটনে চাপুন
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-4 w-full pt-2">
        <button
          onClick={() => handleDecision('FALSE')}
          disabled={isAnswered}
          className="flex-1 py-3.5 px-6 rounded-2xl bg-rose-50 border-2 border-rose-200 hover:bg-rose-100 text-rose-700 font-bold text-sm flex items-center justify-center space-x-2 transition shadow-xs active:scale-95"
        >
          <X className="w-5 h-5 text-rose-600" />
          <span>FALSE (মিথ্যা)</span>
        </button>

        <button
          onClick={() => handleDecision('TRUE')}
          disabled={isAnswered}
          className="flex-1 py-3.5 px-6 rounded-2xl bg-emerald-50 border-2 border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center space-x-2 transition shadow-xs active:scale-95"
        >
          <Check className="w-5 h-5 text-emerald-600" />
          <span>TRUE (সত্য)</span>
        </button>
      </div>
    </div>
  );
}
