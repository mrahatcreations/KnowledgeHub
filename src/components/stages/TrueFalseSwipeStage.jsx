import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Check, X, Volume2, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

export default function TrueFalseSwipeStage({ stage, onSubmitAnswer, isSecondChance }) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const startCoordsRef = useRef({ x: 0, y: 0 });
  const dragHistoryRef = useRef([]);
  const cardRef = useRef(null);

  const handleDecision = useCallback((choice) => {
    if (isAnswered) return;
    setIsAnswered(true);
    sound.playSwipe();

    const targetX = choice === 'TRUE' ? 620 : -620;
    setDragOffset(prev => ({ x: targetX, y: prev.y * 0.4 + 20 }));

    setTimeout(() => {
      const isCorrect = String(choice).trim().toUpperCase() === String(stage.correctAnswer).trim().toUpperCase();
      if (!isCorrect && !isSecondChance) {
        // Reset card for 2nd chance
        setDragOffset({ x: 0, y: 0 });
        setIsAnswered(false);
      }
      onSubmitAnswer(choice);
    }, 320);
  }, [isAnswered, stage.correctAnswer, isSecondChance, onSubmitAnswer]);

  // Pronunciation handler
  const handleSpeak = (e) => {
    e.stopPropagation();
    if (!stage?.item?.word) return;
    setIsSpeaking(true);
    sound.speak(stage.item.word);
    setTimeout(() => setIsSpeaking(false), 1200);
  };

  // Keyboard navigation (ArrowLeft = FALSE, ArrowRight = TRUE, Space = Speak)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isAnswered) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleDecision('FALSE');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleDecision('TRUE');
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleSpeak(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDecision, isAnswered]);

  // Pointer Handlers (Unified Mouse + Touch)
  const handlePointerDown = (e) => {
    if (isAnswered) return;
    // Don't drag if clicking buttons inside the card
    if (e.target.closest('button')) return;

    startCoordsRef.current = { x: e.clientX, y: e.clientY };
    dragHistoryRef.current = [{ x: e.clientX, y: e.clientY, time: Date.now() }];
    setIsDragging(true);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = (e) => {
    if (!isDragging || isAnswered) return;

    const diffX = e.clientX - startCoordsRef.current.x;
    const diffY = e.clientY - startCoordsRef.current.y;

    // Dampen vertical movement slightly for natural card swiping
    setDragOffset({ x: diffX, y: diffY * 0.45 });

    const now = Date.now();
    dragHistoryRef.current.push({ x: e.clientX, y: e.clientY, time: now });
    // Keep only points from the last 120ms for instant velocity check
    dragHistoryRef.current = dragHistoryRef.current.filter(p => now - p.time < 120);
  };

  const handlePointerUp = (e) => {
    if (!isDragging || isAnswered) return;
    setIsDragging(false);

    try {
      if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch (err) {}

    // Calculate swipe velocity
    const history = dragHistoryRef.current;
    let velocityX = 0;
    if (history.length >= 2) {
      const first = history[0];
      const last = history[history.length - 1];
      const dt = last.time - first.time;
      if (dt > 10) {
        velocityX = (last.x - first.x) / dt; // px per ms
      }
    }

    const distanceThreshold = 75; // px
    const velocityThreshold = 0.4; // px/ms

    if (dragOffset.x > distanceThreshold || (velocityX > velocityThreshold && dragOffset.x > 25)) {
      handleDecision('TRUE');
    } else if (dragOffset.x < -distanceThreshold || (velocityX < -velocityThreshold && dragOffset.x < -25)) {
      handleDecision('FALSE');
    } else {
      // Snap back to center
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handlePointerCancel = () => {
    if (!isAnswered) {
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Dynamic calculations for Tinder/Reigns effects
  const rotation = Math.max(-22, Math.min(22, dragOffset.x * 0.075));
  const trueRatio = Math.max(0, Math.min(1, (dragOffset.x - 15) / 60));
  const falseRatio = Math.max(0, Math.min(1, (-dragOffset.x - 15) / 60));

  // Dynamic background edge tint & card glow
  const cardBorderColor = trueRatio > 0.1
    ? `rgba(16, 185, 129, ${trueRatio * 0.9})`
    : falseRatio > 0.1
    ? `rgba(244, 63, 94, ${falseRatio * 0.9})`
    : isSecondChance
    ? '#fbbf24'
    : '#e0e7ff';

  const cardGlow = trueRatio > 0.1
    ? `0 20px 40px -10px rgba(16, 185, 129, ${trueRatio * 0.5}), 0 0 25px rgba(16, 185, 129, ${trueRatio * 0.3})`
    : falseRatio > 0.1
    ? `0 20px 40px -10px rgba(244, 63, 94, ${falseRatio * 0.5}), 0 0 25px rgba(244, 63, 94, ${falseRatio * 0.3})`
    : '0 20px 35px -10px rgba(0, 0, 0, 0.18), 0 0 1px rgba(0, 0, 0, 0.1)';

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-6 animate-pop select-none">
      {/* 3D Physical Card Deck Arena */}
      <div className="relative w-full min-h-[320px] flex items-center justify-center pt-2">
        {/* Background Deck Card 2 (Deepest) */}
        <div 
          className="absolute w-[90%] h-[92%] rounded-3xl bg-slate-800/60 border border-slate-700/50 shadow-md transition-transform duration-300 pointer-events-none"
          style={{
            transform: `translateY(16px) scale(${0.92 + (isDragging ? 0.02 : 0)})`,
            opacity: 0.5
          }}
        />

        {/* Background Deck Card 1 (Middle) */}
        <div 
          className="absolute w-[95%] h-[96%] rounded-3xl bg-slate-800/90 border border-slate-700/80 shadow-lg transition-transform duration-300 pointer-events-none"
          style={{
            transform: `translateY(8px) scale(${0.96 + (isDragging ? 0.02 : 0)})`,
            opacity: 0.8
          }}
        />

        {/* Main Swipeable Action Card */}
        <div
          ref={cardRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          style={{
            transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${rotation}deg) scale(${isDragging ? 1.02 : 1})`,
            transition: isDragging ? 'none' : 'transform 0.32s cubic-bezier(0.18, 0.89, 0.32, 1.25), box-shadow 0.2s ease',
            borderColor: cardBorderColor,
            boxShadow: cardGlow,
            touchAction: 'none'
          }}
          className={`relative w-full min-h-[310px] p-6 rounded-3xl bg-gradient-to-b from-white to-slate-50 border-3 flex flex-col justify-between cursor-grab active:cursor-grabbing ${
            isSecondChance ? 'bg-amber-50/20' : ''
          }`}
        >
          {/* Dynamic Glowing Stamp: TRUE / সত্য (Right Swipe) */}
          <div
            style={{
              opacity: trueRatio,
              transform: `scale(${0.85 + trueRatio * 0.25}) rotate(-12deg)`,
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.65), inset 0 0 15px rgba(16, 185, 129, 0.2)'
            }}
            className="absolute top-5 right-5 z-20 px-4 py-2 rounded-2xl border-[3.5px] border-emerald-500 bg-emerald-500/15 backdrop-blur-xs text-emerald-600 font-black flex items-center space-x-2 pointer-events-none transition-all duration-75"
          >
            <Check className="w-6 h-6 stroke-[3.5]" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-lg tracking-wider font-black">TRUE</span>
              <span className="text-[11px] font-bold text-emerald-700">সত্য</span>
            </div>
          </div>

          {/* Dynamic Glowing Stamp: FALSE / মিথ্যা (Left Swipe) */}
          <div
            style={{
              opacity: falseRatio,
              transform: `scale(${0.85 + falseRatio * 0.25}) rotate(12deg)`,
              boxShadow: '0 0 25px rgba(244, 63, 94, 0.65), inset 0 0 15px rgba(244, 63, 94, 0.2)'
            }}
            className="absolute top-5 left-5 z-20 px-4 py-2 rounded-2xl border-[3.5px] border-rose-500 bg-rose-500/15 backdrop-blur-xs text-rose-600 font-black flex items-center space-x-2 pointer-events-none transition-all duration-75"
          >
            <X className="w-6 h-6 stroke-[3.5]" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-lg tracking-wider font-black">FALSE</span>
              <span className="text-[11px] font-bold text-rose-700">মিথ্যা</span>
            </div>
          </div>

          {/* Card Top Navigation / Badges */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-extrabold rounded-full uppercase tracking-wider shadow-xs">
                {stage?.item?.pos || 'VOCABULARY'}
              </span>
              {isSecondChance && (
                <span className="px-2.5 py-1 bg-amber-100 border border-amber-300 text-amber-800 text-[11px] font-black rounded-full animate-pulse flex items-center space-x-1 shadow-xs">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>২য় সুযোগ</span>
                </span>
              )}
            </div>

            {/* Pronunciation Speaker Button */}
            <button
              onClick={handleSpeak}
              type="button"
              className={`p-2.5 rounded-2xl transition-all shadow-xs flex items-center justify-center ${
                isSpeaking 
                  ? 'bg-indigo-600 text-white scale-110 shadow-indigo-500/40 ring-4 ring-indigo-300' 
                  : 'bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 hover:scale-105 active:scale-95'
              }`}
              title="উচ্চারণ শুনুন (Pronounce Word)"
            >
              <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-bounce' : ''}`} />
            </button>
          </div>

          {/* Card Center Challenge Content */}
          <div className="text-center py-4 px-2 my-auto z-10">
            <div className="inline-block relative">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {stage?.item?.word}
              </h2>
              {stage?.item?.phonetic && (
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  /{stage.item.phonetic}/
                </p>
              )}
            </div>

            <div className="my-3.5 h-1 w-12 bg-gradient-to-r from-indigo-300 via-indigo-500 to-indigo-300 mx-auto rounded-full" />

            {/* Bengali Meaning Statement Challenge */}
            <div className="bg-slate-100/80 border border-slate-200/80 rounded-2xl p-3.5 shadow-inner">
              <p className="text-xs text-slate-500 font-semibold mb-1">প্রদর্শিত অর্থ কি সঠিক?</p>
              <p className="text-lg sm:text-xl font-extrabold text-slate-800 leading-snug">
                "{stage?.displayedMeaning || stage?.statement}"
              </p>
            </div>
          </div>

          {/* Card Bottom Hint Indicator */}
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1 pt-2 border-t border-slate-100 z-10">
            <div className="flex items-center space-x-1 text-rose-500/80">
              <ArrowLeft className="w-3.5 h-3.5 animate-pulse" />
              <span>বামে: মিথ্যা</span>
            </div>
            <span className="text-slate-400">টেনে বা বাটনে চাপুন</span>
            <div className="flex items-center space-x-1 text-emerald-600/80">
              <span>ডানে: সত্য</span>
              <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* 3D Tactile Action Controls (Duolingo/Candy Crush Style) */}
      <div className="flex items-center justify-center space-x-4 w-full pt-1 px-1">
        {/* FALSE / মিথ্যা 3D Button */}
        <button
          type="button"
          onClick={() => handleDecision('FALSE')}
          disabled={isAnswered}
          className="game-btn-3d game-btn-rose flex-1 py-3.5 px-4 rounded-2xl text-white font-black flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="p-1.5 rounded-xl bg-white/20">
            <X className="w-5 h-5 stroke-[3.5]" />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">মিথ্যা</span>
            <span className="text-base font-black tracking-wide">FALSE</span>
          </div>
        </button>

        {/* TRUE / সত্য 3D Button */}
        <button
          type="button"
          onClick={() => handleDecision('TRUE')}
          disabled={isAnswered}
          className="game-btn-3d game-btn-emerald flex-1 py-3.5 px-4 rounded-2xl text-white font-black flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="p-1.5 rounded-xl bg-white/20">
            <Check className="w-5 h-5 stroke-[3.5]" />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">সত্য</span>
            <span className="text-base font-black tracking-wide">TRUE</span>
          </div>
        </button>
      </div>
    </div>
  );
}
