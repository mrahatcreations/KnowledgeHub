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
    e?.stopPropagation?.();
    if (!stage?.item?.word) return;
    setIsSpeaking(true);
    sound.speak(stage.item.word);
    setTimeout(() => setIsSpeaking(false), 1200);
  };

  // Keyboard navigation (ArrowLeft = FALSE, ArrowRight = TRUE, Space/Enter = Speak)
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

  // Pointer Handlers for Swipe
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

    // Check flick or distance threshold
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
    ? `rgba(16, 185, 129, ${trueRatio * 0.9})`
    : falseRatio > 0.1
    ? `rgba(244, 63, 94, ${falseRatio * 0.9})`
    : isSecondChance
    ? 'rgba(245, 158, 11, 0.5)'
    : 'rgba(51, 65, 85, 0.8)';

  // Determine prompt context label
  const promptContextLabel = stage?.statement?.includes('SYNONYM')
    ? 'Is this a valid synonym for the word above?'
    : stage?.statement?.includes('OPPOSITE') || stage?.statement?.includes('Antonym')
    ? 'Is this the opposite/antonym of the word above?'
    : stage?.statement?.includes('Part of Speech')
    ? 'Is this the correct grammatical part of speech?'
    : 'Does the word match the definition below?';

  return (
    <div className="w-full max-w-[320px] sm:max-w-sm mx-auto flex flex-col items-center space-y-4 sm:space-y-5 animate-pop select-none">
      {/* 3D Physical Card Deck Arena */}
      <div className="relative w-full min-h-[300px] sm:min-h-[320px] flex items-center justify-center pt-1">
        {/* Background Deck Card 2 */}
        <div 
          className="absolute w-[92%] h-[94%] rounded-2xl bg-[#0f172a] transition-transform duration-300 pointer-events-none"
          style={{
            transform: `translateY(10px) scale(${0.94 + (isDragging ? 0.02 : 0)})`,
            opacity: 0.5
          }}
        />

        {/* Background Deck Card 1 */}
        <div 
          className="absolute w-[96%] h-[97%] rounded-2xl bg-[#0f172a] transition-transform duration-300 pointer-events-none"
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
          className={`relative w-full min-h-[290px] sm:min-h-[310px] p-4 sm:p-5 rounded-2xl bg-[#1e293b] flex flex-col justify-between cursor-grab active:cursor-grabbing shadow-sm ${
            isSecondChance ? 'border-2 border-amber-500/50' : 'border-0'
          }`}
        >
          {/* Dynamic Stamp: TRUE (Right Swipe) */}
          <div
            style={{
              opacity: trueRatio,
              transform: `scale(${0.9 + trueRatio * 0.15}) rotate(-8deg)`
            }}
            className="absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-xl bg-[#059669] text-white font-mono font-black flex items-center space-x-1.5 pointer-events-none transition-all duration-75 shadow-lg tracking-wider"
          >
            <Check className="w-4 h-4 text-white stroke-[3]" />
            <span className="text-sm font-black tracking-widest">TRUE</span>
          </div>

          {/* Dynamic Stamp: FALSE (Left Swipe) */}
          <div
            style={{
              opacity: falseRatio,
              transform: `scale(${0.9 + falseRatio * 0.15}) rotate(8deg)`
            }}
            className="absolute top-4 left-4 z-20 px-3.5 py-1.5 rounded-xl bg-[#b91c1c] text-white font-mono font-black flex items-center space-x-1.5 pointer-events-none transition-all duration-75 shadow-lg tracking-wider"
          >
            <X className="w-4 h-4 text-white stroke-[3]" />
            <span className="text-sm font-black tracking-widest">FALSE</span>
          </div>

          {/* Card Top Badges */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center space-x-1.5">
              <span className="px-2.5 py-0.5 bg-[#0f172a] text-blue-300 text-[10px] sm:text-[11px] font-mono font-bold rounded-lg uppercase tracking-wider">
                {stage?.item?.pos ? String(stage.item.pos).toUpperCase() : 'VOCABULARY'}
              </span>
              {isSecondChance && (
                <span className="px-2 py-0.5 bg-amber-600 text-white text-[10px] font-mono font-bold rounded-lg flex items-center space-x-1 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-white" />
                  <span>2nd Chance</span>
                </span>
              )}
            </div>

            <button
              onClick={handleSpeak}
              type="button"
              className="p-1.5 rounded-lg bg-[#0f172a] text-slate-300 hover:text-white transition active:scale-95 flex items-center justify-center cursor-pointer"
              title="Listen pronunciation"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-amber-400' : ''}`} />
            </button>
          </div>

          {/* Card Center Challenge Content */}
          <div className="text-center py-2 px-1 my-auto z-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-montserrat break-words">
              {stage?.item?.word}
            </h2>
            {stage?.item?.phonetic && (
              <p className="text-xs font-mono text-slate-300 mt-0.5">
                /{stage.item.phonetic}/
              </p>
            )}

            <div className="my-2.5 h-[1px] w-10 bg-slate-700/60 mx-auto" />

            {/* Statement Verification Box */}
            <div className="bg-[#0f172a] rounded-xl p-3.5 sm:p-4 text-center">
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1.5">
                Statement Verification
              </p>
              <p className="font-montserrat text-lg sm:text-xl font-bold text-amber-300 leading-snug break-words">
                &ldquo;{stage?.displayedMeaning || stage?.statement}&rdquo;
              </p>
              <p className="text-[11px] text-slate-300 font-medium mt-1.5">
                {promptContextLabel}
              </p>
            </div>
          </div>

          {/* Card Bottom Hint */}
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400 px-2 pt-2.5 border-t border-slate-700/60 z-10">
            <div className="flex items-center space-x-1.5 text-rose-400 font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Left: FALSE</span>
            </div>
            <span className="text-slate-400 uppercase tracking-widest text-[10px]">Swipe or Keys</span>
            <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
              <span>Right: TRUE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="grid grid-cols-2 gap-3 w-full pt-1">
        {/* FALSE Button */}
        <button
          type="button"
          onClick={() => handleDecision('FALSE')}
          disabled={isAnswered}
          className="w-full py-3.5 px-4 rounded-xl bg-[#b91c1c] hover:bg-[#991b1b] text-white font-mono font-bold flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition tracking-wider uppercase text-sm shadow-sm active:scale-[0.98]"
        >
          <X className="w-4 h-4 stroke-[3]" />
          <span>FALSE</span>
        </button>

        {/* TRUE Button */}
        <button
          type="button"
          onClick={() => handleDecision('TRUE')}
          disabled={isAnswered}
          className="w-full py-3.5 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-mono font-bold flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition tracking-wider uppercase text-sm shadow-sm active:scale-[0.98]"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>TRUE</span>
        </button>
      </div>
    </div>
  );
}
