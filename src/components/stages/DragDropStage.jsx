import React, { useState, useRef, useMemo } from 'react';
import { 
  Check,
  Volume2, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Undo2, 
  ArrowDown,
  MousePointerClick,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

/**
 * Editorial Luxury Drag & Drop / Sentence Fill-in Stage Component
 * 
 * Features:
 * - 100% Hard Corners (rounded-none / 0px border-radius) across all elements
 * - Editorial Quote-style sentence container with quotation marks & high-contrast typography
 * - Distinct blank insertion slot with tactile states (idle, dragover, filled, correct, wrong)
 * - Hard-edged word bank tokens with clean hover/active & swap mechanics
 * - Tap or drag tokens into slot, tap in-slot or clear button to return/swap tokens
 * - TTS audio pronunciation & synthesized audio effects
 */
export default function DragDropStage({ stage, onSubmitAnswer, isSecondChance }) {
  const [placedWord, setPlacedWord] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [wrongWords, setWrongWords] = useState([]);
  const [feedbackState, setFeedbackState] = useState('idle'); // 'idle' | 'correct' | 'wrong'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const slotRef = useRef(null);
  const speakTimeoutRef = useRef(null);

  // Parse sentence into segments around the blank placeholder (supports _______, [_______], ___, [blank], etc.)
  const sentenceParts = useMemo(() => {
    const raw = stage?.sentenceText || '';
    const placeholderRegex = /\[?_{2,}\]?|\[blank\]/i;
    const parts = raw.split(placeholderRegex);
    if (parts.length >= 2) return parts;
    if (raw.includes('...')) {
      const dotParts = raw.split('...');
      if (dotParts.length >= 2) return dotParts;
    }
    return ['', ` ${raw}`];
  }, [stage?.sentenceText]);

  // Place or swap a word into the slot
  const handlePlaceWord = (word) => {
    if (isSubmitting || wrongWords.includes(word)) return;

    sound.playClick();
    setPlacedWord(word);
    setFeedbackState('idle');
  };

  // Remove / return the placed word from the slot back to the word bank
  const handleRemovePlacedWord = (e) => {
    if (e) e.stopPropagation();
    if (isSubmitting || !placedWord) return;

    sound.playFlip();
    setPlacedWord(null);
    setFeedbackState('idle');
  };

  // Submit and verify the answer
  const handleVerify = () => {
    if (!placedWord || isSubmitting) return;

    setIsSubmitting(true);
    const isCorrect = String(placedWord).trim().toLowerCase() === String(stage?.correctAnswer || '').trim().toLowerCase();

    if (isCorrect) {
      setFeedbackState('correct');
      sound.playCorrect();
      setTimeout(() => {
        onSubmitAnswer(placedWord);
      }, 550);
    } else {
      setFeedbackState('wrong');
      sound.playWrong();
      setWrongWords(prev => [...prev, placedWord]);
      
      setTimeout(() => {
        setPlacedWord(null);
        setFeedbackState('idle');
        setIsSubmitting(false);
        onSubmitAnswer(placedWord);
      }, 650);
    }
  };

  const handleCheckAnswer = handleVerify;

  // HTML5 Drag & Drop handlers
  const handleDragStart = (e, word) => {
    if (isSubmitting || wrongWords.includes(word)) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', word);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const word = e.dataTransfer.getData('text/plain');
    if (word && !wrongWords.includes(word)) {
      handlePlaceWord(word);
    }
  };

  // Audio Pronunciation Playback
  const handleSpeak = (e) => {
    if (e) e.stopPropagation();
    const wordToSpeak = placedWord || stage?.targetWord || '';
    const fullSentence = stage?.item?.sentence
      ? stage.item.sentence
      : (stage?.sentenceText || '').replace(/\[?_{2,}\]?|\[blank\]/gi, wordToSpeak);

    if (fullSentence.trim()) {
      setIsSpeaking(true);
      sound.speak(fullSentence);
      if (speakTimeoutRef.current) clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = setTimeout(() => {
        setIsSpeaking(false);
      }, 1400);
    }
  };

  const hasSecondChanceAlert = isSecondChance || wrongWords.length > 0;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col space-y-3.5 sm:space-y-4 animate-pop select-none">
      {/* Editorial Sentence Card */}
      <div 
        className={`relative rounded-none bg-slate-900 border-2 transition-all duration-200 p-4 sm:p-5 shadow-sm ${
          feedbackState === 'correct' 
            ? 'border-emerald-500' 
            : feedbackState === 'wrong'
            ? 'border-rose-500 animate-shake'
            : hasSecondChanceAlert 
            ? 'border-amber-500' 
            : 'border-slate-800'
        }`}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-[11px] font-bold uppercase tracking-widest rounded-none">
              Sentence Completion
            </span>

            {hasSecondChanceAlert && (
              <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-[11px] font-black tracking-wider uppercase rounded-none flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-slate-950" />
                2nd Chance
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSpeak}
            className={`px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition cursor-pointer rounded-none flex items-center space-x-1.5 active:bg-slate-700 ${
              isSpeaking ? 'border-amber-400 text-amber-300' : ''
            }`}
            title="Listen to full sentence pronunciation"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-amber-400 scale-110' : ''}`} />
            <span className="text-xs font-bold uppercase tracking-wider">Listen</span>
          </button>
        </div>

        {/* Editorial Quote Sentence Container with Snap-in Slot */}
        <div className="my-3 px-1 sm:px-2 text-base sm:text-lg font-medium text-slate-100 leading-relaxed text-center sm:text-left break-words">
          <span className="text-indigo-400 font-serif text-xl sm:text-2xl mr-1 select-none">&ldquo;</span>
          {sentenceParts.map((part, index) => (
            <React.Fragment key={index}>
              <span className="text-slate-100">{part}</span>
              {index < sentenceParts.length - 1 && (
                <span
                  ref={slotRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={placedWord ? handleRemovePlacedWord : undefined}
                  role={placedWord ? 'button' : undefined}
                  tabIndex={placedWord ? 0 : undefined}
                  onKeyDown={placedWord ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRemovePlacedWord(e);
                    }
                  } : undefined}
                  title={placedWord ? 'Click or tap to remove word' : 'Drop or tap a word to place here'}
                  className={`inline-flex items-center justify-center align-middle mx-1.5 my-1 min-h-[44px] min-w-[125px] sm:min-w-[145px] px-3 py-1 rounded-none border-2 transition-all duration-150 text-sm sm:text-base font-bold relative max-w-full ${
                    placedWord
                      ? feedbackState === 'correct'
                        ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100 cursor-pointer shadow-[0_2px_0_#065f46]'
                        : feedbackState === 'wrong'
                        ? 'bg-rose-950/90 border-rose-400 text-rose-100 cursor-pointer shadow-[0_2px_0_#9f1239]'
                        : 'bg-indigo-950/80 border-indigo-400 text-indigo-100 cursor-pointer shadow-[0_2px_0_#312e81] hover:border-indigo-300'
                      : isDragOver
                      ? 'border-indigo-400 bg-indigo-950/60 text-indigo-200 shadow-inner'
                      : 'border-dashed border-slate-700 bg-slate-950/90 text-slate-400 hover:border-slate-500 cursor-pointer'
                  }`}
                >
                  {placedWord ? (
                    <span className="flex items-center space-x-2 animate-pop max-w-full">
                      <span className="break-words max-w-[140px] sm:max-w-[180px] tracking-wide text-white">{placedWord}</span>
                      {feedbackState === 'correct' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {feedbackState === 'wrong' && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      {feedbackState === 'idle' && (
                        <span 
                          title="Tap to return word to bank" 
                          className="p-0.5 hover:bg-white/15 rounded-none transition ml-0.5 shrink-0"
                        >
                          <Undo2 className="w-3.5 h-3.5 text-indigo-300" />
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 tracking-wide">
                      <ArrowDown className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span>[ Blank Slot ]</span>
                    </span>
                  )}
                </span>
              )}
            </React.Fragment>
          ))}
          <span className="text-indigo-400 font-serif text-xl sm:text-2xl ml-1 select-none">&rdquo;</span>
        </div>

        {/* Editorial Definition & Word Meta Footer */}
        {stage?.item?.meaning && (
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-normal">
            <div className="flex items-center space-x-1.5 truncate mr-2">
              <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">
                Definition: <strong className="text-amber-300 font-semibold">{stage.item.meaning}</strong>
              </span>
            </div>

            {stage?.item?.pos && (
              <span className="shrink-0 px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider rounded-none border border-slate-700">
                {stage.item.pos}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hard-Edged Word Bank Pool Container */}
      <div className="p-4 sm:p-5 rounded-none bg-slate-900 border-2 border-slate-800 text-center shadow-sm">
        <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-400 font-semibold mb-3.5 uppercase tracking-wider">
          <MousePointerClick className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Tap or drag tokens into sentence slot</span>
        </div>

        {/* Hard-Edged Word Tokens Grid / Wrap */}
        <div className="flex flex-wrap justify-center gap-2.5">
          {(stage?.options || []).map((opt, i) => {
            const isWrong = wrongWords.includes(opt);
            const isPlaced = placedWord === opt;

            return (
              <button
                key={i}
                type="button"
                draggable={!isWrong && !isPlaced && !isSubmitting}
                onDragStart={(e) => handleDragStart(e, opt)}
                onClick={() => {
                  if (isPlaced) {
                    handleRemovePlacedWord();
                  } else {
                    handlePlaceWord(opt);
                  }
                }}
                disabled={isWrong || isSubmitting}
                title={isPlaced ? 'Tap to return to bank' : isWrong ? 'Incorrect option' : 'Tap to place in slot'}
                className={`py-2.5 px-4 rounded-none font-black text-xs sm:text-sm transition-all flex items-center space-x-2 break-words max-w-full text-center border-2 select-none cursor-pointer tracking-wide ${
                  isWrong
                    ? 'border-rose-900/60 bg-rose-950/30 text-rose-400/50 line-through cursor-not-allowed opacity-50'
                    : isPlaced
                    ? 'border-dashed border-indigo-500/60 bg-indigo-950/30 text-indigo-300 opacity-60 scale-95'
                    : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-300 shadow-[0_4px_0_#1d4ed8] active:translate-y-1 active:shadow-none'
                }`}
              >
                <span className="break-words">{opt}</span>
                {isWrong && <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                {isPlaced && <Undo2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Controls: Clear + Verify */}
      <div className="flex items-center space-x-2 pt-1">
        {placedWord && feedbackState === 'idle' && (
          <button
            type="button"
            onClick={handleRemovePlacedWord}
            disabled={isSubmitting}
            className="py-3.5 px-4 rounded-none bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition active:scale-95 shrink-0 cursor-pointer shadow-[0_3px_0_#020617]"
            title="Clear placed word from slot"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="tracking-wider uppercase">Clear</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleCheckAnswer}
          disabled={!placedWord || isSubmitting || feedbackState === 'correct'}
          className={`flex-1 py-3.5 px-4 rounded-none font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center space-x-2 border-2 cursor-pointer ${
            !placedWord || isSubmitting
              ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              : feedbackState === 'correct'
              ? 'bg-emerald-600 border-emerald-300 text-white shadow-[0_5px_0_#065f46]'
              : feedbackState === 'wrong'
              ? 'bg-rose-600 border-rose-300 text-white shadow-[0_5px_0_#9f1239]'
              : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-300 text-white shadow-[0_5px_0_#065f46] active:translate-y-1 active:shadow-none'
          }`}
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Check Answer</span>
        </button>
      </div>
    </div>
  );
}
