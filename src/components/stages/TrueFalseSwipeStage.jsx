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

    const targetX = choice === 'TRUE' ? 500 : -500;
    setDragOffset(prev => ({ x: targetX, y: prev.y * 0.4 + 10 }));

    setTimeout(() => {
      const isCorrect = String(choice).trim().toUpperCase() === String(stage.correctAnswer).trim().toUpperCase();
      if (!isCorrect && !isSecondChance) {
        setDragOffset({ x: 0, y: 0 });
        setIsAnswered(false);
      }
      onSubmitAnswer(choice);
    }, 300);
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

  // Pointer Handlers
  const handlePointerDown = (e) => {
    if (isAnswered) return;
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

    setDragOffset({ x: diffX, y: diffY * 0.45 });

    const now = Date.now();
    dragHistoryRef.current.push({ x: e.clientX, y: e.clientY, time: now });
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

    // Check flick or distance
    const firstPoint = dragHistoryRef.current[0] || startCoordsRef.current;
    const lastPoint = dragHistoryRef.current[dragHistoryRef.current.length - 1] || startCoordsRef.current;
    const deltaTime = Math.max(1, (lastPoint.time || Date.now()) - (firstPoint.time || Date.now()));
    const velocityX = (lastPoint.x - firstPoint.x) / deltaTime;

    const isFlickRight = velocityX > 0.45;
    const isFlickLeft = velocityX < -0.45;
    const isPastThresholdRight = dragOffset.x > 70;
    const isPastThresholdLeft = dragOffset.x < -70;

    if (isFlickRight || isPastThresholdRight) {
      handleDecision('TRUE');
    } else if (isFlickLeft || isPastThresholdLeft) {
      handleDecision('FALSE');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handlePointerCancel = () => {
    if (!isAnswered) {
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const rotation = Math.max(-18, Math.min(18, dragOffset.x * 0.06));
  const trueRatio = Math.max(0, Math.min(1, (dragOffset.x - 15) / 50));
  const falseRatio = Math.max(0, Math.min(1, (-dragOffset.x - 15) / 50));

  const cardBorderColor = trueRatio > 0.1
    ? `rgba(16, 185, 129, ${trueRatio * 0.8})`
    : falseRatio > 0.1
    ? `rgba(244, 63, 94, ${falseRatio * 0.8})`
    : isSecondChance
    ? 'rgba(245, 158, 11, 0.4)'
    : 'rgba(51, 65, 85, 0.8)';

  return (
    <div className="w-full max-w-[300px] sm:max-w-sm mx-auto flex flex-col items-center space-y-4 sm:space-y-5 animate-pop select-none">
      {/* 3D Physical Card Deck Arena */}
      <div className="relative w-full min-h-[280px] sm:min-h-[300px] flex items-center justify-center pt-1">
        {/* Background Deck Card 2 */}
        <div 
          className="absolute w-[92%] h-[94%] rounded-2xl bg-slate-900/60 border border-slate-800/60 transition-transform duration-300 pointer-events-none"
          style={{
            transform: `translateY(10px) scale(${0.94 + (isDragging ? 0.02 : 0)})`,
            opacity: 0.5
          }}
        />

        {/* Background Deck Card 1 */}
        <div 
          className="absolute w-[96%] h-[97%] rounded-2xl bg-slate-900/80 border border-slate-800 transition-transform duration-300 pointer-events-none"
          style={{
            transform: `translateY(5px) scale(${0.97 + (isDragging ? 0.02 : 0)})`,
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
            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
            borderColor: cardBorderColor,
            touchAction: 'pan-y'
          }}
          className={`relative w-full min-h-[270px] sm:min-h-[290px] p-4 sm:p-5 rounded-2xl bg-slate-900 border flex flex-col justify-between cursor-grab active:cursor-grabbing shadow-sm ${
            isSecondChance ? 'border-amber-500/40' : 'border-slate-800'
          }`}
        >
          {/* Dynamic Stamp: TRUE (Right Swipe) */}
          <div
            style={{
              opacity: trueRatio,
              transform: `scale(${0.9 + trueRatio * 0.15}) rotate(-8deg)`
            }}
            className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl border border-emerald-400 bg-emerald-950/90 text-emerald-300 font-bold flex items-center space-x-1.5 pointer-events-none transition-all duration-75 shadow-[0_0_18px_rgba(16,185,129,0.65)]"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-sm font-bold">TRUE</span>
            </div>
          </div>

          {/* Dynamic Stamp: FALSE (Left Swipe) */}
          <div
            style={{
              opacity: falseRatio,
              transform: `scale(${0.9 + falseRatio * 0.15}) rotate(8deg)`
            }}
            className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-xl border border-rose-400 bg-rose-950/90 text-rose-300 font-bold flex items-center space-x-1.5 pointer-events-none transition-all duration-75 shadow-[0_0_18px_rgba(244,63,94,0.65)]"
          >
            <X className="w-4 h-4 text-rose-400" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-sm font-bold">FALSE</span>
            </div>
          </div>

          {/* Card Top Badges */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center space-x-1.5">
              <span className="px-2.5 py-0.5 bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 text-[11px] font-bold rounded-full uppercase tracking-wider">
                {stage?.item?.pos || 'VOCABULARY'}
              </span>
              {isSecondChance && (
                <span className="px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold rounded-full flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>2nd Chance (0 Stars)</span>
                </span>
              )}
            </div>

            <button
              onClick={handleSpeak}
              type="button"
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95 flex items-center justify-center"
              title="Listen pronunciation"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-amber-400' : ''}`} />
            </button>
          </div>

          {/* Card Center Challenge Content */}
          <div className="text-center py-2 px-1 my-auto z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight break-words">
              {stage?.item?.word}
            </h2>
            {stage?.item?.phonetic && (
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                /{stage.item.phonetic}/
              </p>
            )}

            <div className="my-2.5 h-0.5 w-8 bg-indigo-500/40 mx-auto rounded-full" />

            {/* Meaning Statement Challenge */}
            <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-inner">
              <p className="text-xs text-slate-400 font-bold mb-1">Is the displayed definition correct?</p>
              <p className="text-lg sm:text-xl font-black text-amber-400 leading-snug break-words">
                &ldquo;{stage?.displayedMeaning || stage?.statement}&rdquo;
              </p>
            </div>
          </div>

          {/* Card Bottom Hint */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-2 pt-2.5 border-t border-slate-800 z-10">
            <div className="flex items-center space-x-1.5 text-rose-400">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Left: FALSE</span>
            </div>
            <span className="text-slate-400">Swipe or tap</span>
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <span>Right: TRUE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls (50/50 Grid) */}
      <div className="grid grid-cols-2 gap-3.5 w-full pt-1">
        {/* FALSE Button */}
        <button
          type="button"
          onClick={() => handleDecision('FALSE')}
          disabled={isAnswered}
          className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_0_#9f1239] active:translate-y-1 active:shadow-none border-2 border-rose-400 transition"
        >
          <X className="w-5 h-5 stroke-[3]" />
          <span className="text-sm sm:text-base font-black tracking-wide">FALSE</span>
        </button>

        {/* TRUE Button */}
        <button
          type="button"
          onClick={() => handleDecision('TRUE')}
          disabled={isAnswered}
          className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_0_#065f46] active:translate-y-1 active:shadow-none border-2 border-emerald-400 transition"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span className="text-sm sm:text-base font-black tracking-wide">TRUE</span>
        </button>
      </div>
    </div>
  );
}
