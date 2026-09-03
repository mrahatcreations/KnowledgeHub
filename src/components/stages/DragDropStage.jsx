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
    <div className="w-full max-w-xl mx-auto flex flex-col space-y-3 sm:space-y-3.5 select-none">
      {/* Editorial Sentence Prompt Container */}
      <div 
        className="relative rounded-2xl bg-[#1e293b] transition-all duration-200 p-4.5 sm:p-5 shadow-sm text-left"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-700/60">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-[#0f172a] text-blue-300 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg">
              Sentence Completion
            </span>

            {hasSecondChanceAlert && (
              <span className="px-2.5 py-0.5 bg-amber-600 text-white text-[10px] sm:text-[11px] font-bold tracking-wider uppercase rounded-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-white" />
                2nd Chance
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSpeak}
            className={`px-3 py-1.5 bg-[#0f172a] hover:bg-[#182033] text-white transition cursor-pointer rounded-lg flex items-center space-x-1.5 active:scale-95 ${
              isSpeaking ? 'text-amber-300' : ''
            }`}
            title="Listen to full sentence pronunciation"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-amber-400 scale-110' : ''}`} />
            <span className="text-xs font-bold uppercase tracking-wider">Listen</span>
          </button>
        </div>

        {/* Editorial Quote Sentence Container with Snap-in Slot */}
        <div className="my-3 px-1 sm:px-2 text-base sm:text-lg font-medium text-white leading-relaxed text-center sm:text-left break-words">
          <span className="text-blue-400 font-serif text-xl sm:text-2xl mr-1 select-none">&ldquo;</span>
          {sentenceParts.map((part, index) => (
            <React.Fragment key={index}>
              <span className="text-white">{part}</span>
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
                  className={`inline-flex items-center justify-center align-middle mx-1.5 my-1 min-h-[44px] min-w-[125px] sm:min-w-[145px] px-3.5 py-1.5 rounded-xl transition-all duration-150 text-sm sm:text-base font-bold relative max-w-full shadow-sm ${
                    placedWord
                      ? feedbackState === 'correct'
                        ? 'bg-[#059669] text-white cursor-pointer'
                        : feedbackState === 'wrong'
                        ? 'bg-[#b91c1c] text-white cursor-pointer animate-shake'
                        : 'bg-[#2563eb] text-white cursor-pointer'
                      : isDragOver
                      ? 'bg-[#1d4ed8] text-white'
                      : 'bg-[#0f172a] text-slate-400 hover:text-slate-200 cursor-pointer'
                  }`}
                >
                  {placedWord ? (
                    <span className="flex items-center space-x-2 animate-pop max-w-full">
                      <span className="break-words max-w-[140px] sm:max-w-[180px] tracking-wide text-white">{placedWord}</span>
                      {feedbackState === 'correct' && (
                        <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                      )}
                      {feedbackState === 'wrong' && (
                        <XCircle className="w-4 h-4 text-white shrink-0" />
                      )}
                      {feedbackState === 'idle' && (
                        <span 
                          title="Tap to return word to bank" 
                          className="p-0.5 hover:bg-white/20 rounded-md transition ml-0.5 shrink-0"
                        >
                          <Undo2 className="w-3.5 h-3.5 text-white" />
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 tracking-wide">
                      <ArrowDown className="w-3 h-3 text-blue-400 shrink-0" />
                      <span>[ Blank Slot ]</span>
                    </span>
                  )}
                </span>
              )}
            </React.Fragment>
          ))}
          <span className="text-blue-400 font-serif text-xl sm:text-2xl ml-1 select-none">&rdquo;</span>
        </div>

        {/* Editorial Definition & Word Meta Footer */}
        {stage?.item?.meaning && (
          <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300 font-normal">
            <div className="flex items-center space-x-1.5 truncate mr-2">
              <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">
                Definition: <strong className="text-amber-300 font-semibold">{stage.item.meaning}</strong>
              </span>
            </div>

            {stage?.item?.pos && (
              <span className="shrink-0 px-2 py-0.5 bg-[#0f172a] text-blue-300 text-[10px] font-mono font-bold uppercase tracking-wider rounded-md">
                {stage.item.pos}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Word Bank Pool Container */}
      <div className="p-4.5 sm:p-5 rounded-2xl bg-[#1e293b] text-center shadow-sm">
        <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-400 font-semibold mb-3 uppercase tracking-wider">
          <MousePointerClick className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>Tap tokens into sentence slot</span>
        </div>

        {/* Word Tokens Grid */}
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
                className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center space-x-2 break-words max-w-full text-center select-none cursor-pointer tracking-wide shadow-sm active:scale-95 ${
                  isWrong
                    ? 'bg-[#7f1d1d] text-slate-400 line-through cursor-not-allowed opacity-50'
                    : isPlaced
                    ? 'bg-[#0f172a] text-slate-400 opacity-60 scale-95'
                    : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white'
                }`}
              >
                <span className="break-words">{opt}</span>
                {isWrong && <XCircle className="w-3.5 h-3.5 text-white shrink-0" />}
                {isPlaced && <Undo2 className="w-3.5 h-3.5 text-white shrink-0" />}
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
            className="py-3 px-4 rounded-xl bg-[#0f172a] hover:bg-[#182033] text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition active:scale-95 shrink-0 cursor-pointer shadow-sm"
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
          className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm active:scale-[0.99] ${
            !placedWord || isSubmitting
              ? 'bg-[#1e293b] text-slate-500 cursor-not-allowed opacity-60'
              : feedbackState === 'correct'
              ? 'bg-[#059669] text-white'
              : feedbackState === 'wrong'
              ? 'bg-[#b91c1c] text-white'
              : 'bg-[#059669] hover:bg-[#047857] text-white'
          }`}
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Check Answer</span>
        </button>
      </div>
    </div>
  );
}
