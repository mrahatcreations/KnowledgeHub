import React, { useState, useRef } from 'react';
import { 
  MousePointerClick, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Undo2, 
  Lightbulb,
  ArrowDownCircle
} from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

export default function DragDropStage({ stage, onSubmitAnswer, isSecondChance }) {
  const [placedWord, setPlacedWord] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [wrongWords, setWrongWords] = useState([]);
  const [feedbackState, setFeedbackState] = useState('idle'); // 'idle' | 'correct' | 'wrong'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const slotRef = useRef(null);

  // Parse sentence into segments around the blank (supports _______, [_______], ___, etc.)
  const sentenceParts = React.useMemo(() => {
    const raw = stage.sentenceText || '';
    const placeholderRegex = /\[?_{3,}\]?/;
    const parts = raw.split(placeholderRegex);
    if (parts.length >= 2) return parts;
    return [raw, ''];
  }, [stage.sentenceText]);

  // Place or swap a word into the slot
  const handlePlaceWord = (word) => {
    if (isSubmitting || wrongWords.includes(word)) return;

    sound.playClick();
    setPlacedWord(word);
    setFeedbackState('idle');
  };

  // Remove the currently placed word from the slot
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
    const isCorrect = String(placedWord).trim().toLowerCase() === String(stage.correctAnswer).trim().toLowerCase();

    if (isCorrect) {
      setFeedbackState('correct');
      sound.playCorrect();
      setTimeout(() => {
        onSubmitAnswer(placedWord);
      }, 600);
    } else {
      setFeedbackState('wrong');
      sound.playWrong();
      setWrongWords(prev => [...prev, placedWord]);
      
      setTimeout(() => {
        setPlacedWord(null);
        setFeedbackState('idle');
        setIsSubmitting(false);
        onSubmitAnswer(placedWord);
      }, 700);
    }
  };

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

  // TTS Pronunciation
  const handleSpeak = (e) => {
    if (e) e.stopPropagation();
    const wordToSpeak = placedWord || stage.targetWord || '';
    const fullSentence = stage.item?.sentence
      ? stage.item.sentence
      : (stage.sentenceText || '').replace(/\[?_{3,}\]?/g, wordToSpeak);
    sound.speak(fullSentence);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col space-y-3.5 sm:space-y-4 animate-pop select-none">
      {/* Sentence Puzzle Board Card */}
      <div 
        className={`relative overflow-hidden rounded-2xl bg-slate-900 border-2 shadow-md transition-all duration-200 p-4 sm:p-5 ${
          feedbackState === 'correct' 
            ? 'border-emerald-500 bg-slate-900' 
            : feedbackState === 'wrong'
            ? 'border-rose-500 bg-slate-900 animate-shake'
            : isSecondChance 
            ? 'border-amber-500 bg-slate-900' 
            : 'border-slate-800'
        }`}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-black rounded-lg uppercase tracking-wider shadow-xs">
              Sentence Completion
            </span>

            {isSecondChance && (
              <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-xs font-black rounded-lg shadow-xs">
                2nd Chance
              </span>
            )}
          </div>

          <button
            onClick={handleSpeak}
            className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl transition shadow-xs active:scale-95 flex items-center space-x-1.5 cursor-pointer border border-slate-700"
            title="Listen sentence pronunciation"
          >
            <Volume2 className="w-4 h-4" />
            <span className="text-xs font-bold">Listen</span>
          </button>
        </div>

        {/* Interactive Sentence with Snap-in Slot Target */}
        <div className="my-4 text-base sm:text-xl font-bold text-white leading-relaxed text-center break-words">
          {sentenceParts.map((part, index) => (
            <React.Fragment key={index}>
              <span>{part}</span>
              {index < sentenceParts.length - 1 && (
                <span
                  ref={slotRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={placedWord ? handleRemovePlacedWord : undefined}
                  className={`inline-flex items-center justify-center align-middle mx-1.5 my-1 min-h-[44px] min-w-[120px] px-3.5 py-1.5 rounded-xl border-2 transition-all duration-150 text-sm font-black relative max-w-full ${
                    placedWord
                      ? feedbackState === 'correct'
                        ? 'bg-emerald-600 border-emerald-400 text-white cursor-pointer shadow-[0_3px_0_#065f46]'
                        : feedbackState === 'wrong'
                        ? 'bg-rose-600 border-rose-400 text-white cursor-pointer shadow-[0_3px_0_#9f1239]'
                        : 'bg-blue-600 text-white border-blue-400 cursor-pointer shadow-[0_3px_0_#1d4ed8]'
                      : isDragOver
                      ? 'border-blue-400 bg-blue-900/60 text-blue-300 shadow-md animate-pulse'
                      : 'border-dashed border-slate-600 bg-slate-950 text-slate-400 hover:border-blue-400'
                  }`}
                >
                  {placedWord ? (
                    <span className="flex items-center space-x-2 animate-pop max-w-full">
                      <span className="break-words max-w-[150px] sm:max-w-[190px]">{placedWord}</span>
                      {feedbackState === 'correct' && (
                        <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                      )}
                      {feedbackState === 'wrong' && (
                        <XCircle className="w-4 h-4 text-white shrink-0" />
                      )}
                      {feedbackState === 'idle' && (
                        <span 
                          title="Tap to remove" 
                          className="p-0.5 hover:bg-white/20 rounded-full transition ml-0.5 shrink-0"
                        >
                          <Undo2 className="w-3.5 h-3.5 text-blue-200" />
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-xs font-bold text-slate-400">
                      <ArrowDownCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>Place here</span>
                    </span>
                  )}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Word Meaning Hint Footer */}
        {stage.item?.meaning && (
          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-center space-x-1.5 text-xs text-slate-300 font-medium">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Meaning: <strong className="text-amber-400 font-bold">{stage.item.meaning}</strong></span>
          </div>
        )}
      </div>

      {/* Word Chip Pool Container */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border-2 border-slate-800 text-center shadow-md">
        <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-300 font-bold mb-3">
          <MousePointerClick className="w-4 h-4 text-blue-400 shrink-0" />
          <span>Tap or drag words to complete the sentence:</span>
        </div>

        {/* Word Chips */}
        <div className="flex flex-wrap justify-center gap-2.5">
          {stage.options.map((opt, i) => {
            const isWrong = wrongWords.includes(opt);
            const isPlaced = placedWord === opt;

            return (
              <button
                key={i}
                draggable={!isWrong && !isPlaced && !isSubmitting}
                onDragStart={(e) => handleDragStart(e, opt)}
                onClick={() => handlePlaceWord(opt)}
                disabled={isWrong || isSubmitting}
                className={`py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center space-x-1.5 break-words max-w-full text-center border-2 select-none cursor-pointer ${
                  isWrong
                    ? 'border-rose-500 bg-rose-600 text-white opacity-40 cursor-not-allowed line-through'
                    : isPlaced
                    ? 'border-dashed border-blue-400 bg-slate-800 text-blue-400 opacity-50 scale-95'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700 hover:border-blue-400 shadow-[0_3px_0_#0f172a] active:translate-y-0.5 active:shadow-none'
                }`}
              >
                <span className="break-words">{opt}</span>
                {isWrong && <XCircle className="w-4 h-4 text-white shrink-0" />}
                {isPlaced && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Action / Verification Button */}
      <div className="flex items-center space-x-2 pt-1">
        {placedWord && feedbackState === 'idle' && (
          <button
            onClick={handleRemovePlacedWord}
            disabled={isSubmitting}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 shrink-0"
            title="Remove placed word"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}

        <button
          onClick={handleVerify}
          disabled={!placedWord || isSubmitting}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all ${
            placedWord && !isSubmitting
              ? 'game-btn-3d game-btn-emerald text-white cursor-pointer shadow-sm'
              : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-white/90 shrink-0" />
          <span className="truncate">
            {feedbackState === 'correct'
              ? 'Correct! Proceeding...'
              : feedbackState === 'wrong'
              ? 'Incorrect!'
              : 'Check Answer'}
          </span>
        </button>
      </div>
    </div>
  );
}
