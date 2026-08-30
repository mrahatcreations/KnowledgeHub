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
      }, 650);
    } else {
      setFeedbackState('wrong');
      sound.playWrong();
      setWrongWords(prev => [...prev, placedWord]);
      
      setTimeout(() => {
        setPlacedWord(null);
        setFeedbackState('idle');
        setIsSubmitting(false);
        onSubmitAnswer(placedWord);
      }, 750);
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
    <div className="w-full max-w-xl mx-auto flex flex-col space-y-4 sm:space-y-5 animate-pop select-none">
      {/* Sentence Puzzle Board Card */}
      <div 
        className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border-2 shadow-xl transition-all duration-300 p-4 sm:p-6 ${
          feedbackState === 'correct' 
            ? 'border-emerald-400 ring-4 ring-emerald-400/20 shadow-emerald-500/10' 
            : feedbackState === 'wrong'
            ? 'border-rose-400 ring-4 ring-rose-400/20 shadow-rose-500/10 animate-shake'
            : isSecondChance 
            ? 'border-amber-400 bg-amber-50/20 ring-2 ring-amber-300/30' 
            : 'border-indigo-100 hover:border-indigo-200'
        }`}
      >
        {/* Card Header: Category Badge + Second Chance + Audio Pronounce Button */}
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 sm:px-3 py-1 bg-indigo-50 text-indigo-700 text-[11px] sm:text-xs font-black rounded-full uppercase tracking-wider flex items-center space-x-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>বাক্য সম্পূর্ণকরণ</span>
            </span>

            {isSecondChance && (
              <span className="px-2 sm:px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] sm:text-[11px] font-extrabold rounded-full animate-pulse border border-amber-300">
                ২য় সুযোগ (০ স্টার)
              </span>
            )}
          </div>

          <button
            onClick={handleSpeak}
            className="p-2 sm:p-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-full transition shadow-xs active:scale-95 flex items-center space-x-1"
            title="বাক্যের ইংরেজি উচ্চারণ শুনুন"
          >
            <Volume2 className="w-4 h-4" />
            <span className="text-[11px] font-bold hidden sm:inline">উচ্চারণ</span>
          </button>
        </div>

        {/* Interactive Sentence with Snap-in Slot Target */}
        <div className="my-3 sm:my-5 text-base sm:text-xl md:text-2xl font-bold text-slate-800 leading-relaxed text-center break-words">
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
                  className={`inline-flex items-center justify-center align-middle mx-1.5 sm:mx-2 my-1 min-h-[44px] min-w-[120px] px-3 py-1.5 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 text-xs sm:text-sm md:text-base font-black relative group max-w-full ${
                    placedWord
                      ? feedbackState === 'correct'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-300 text-white shadow-lg shadow-emerald-500/30 scale-105 animate-pulse cursor-pointer'
                        : feedbackState === 'wrong'
                        ? 'bg-gradient-to-r from-rose-500 to-red-600 border-rose-300 text-white shadow-lg shadow-rose-500/30 animate-shake cursor-pointer'
                        : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-400 shadow-md shadow-indigo-600/30 cursor-pointer hover:scale-102 active:scale-98'
                      : isDragOver
                      ? 'border-indigo-500 bg-indigo-100/90 text-indigo-700 scale-105 ring-4 ring-indigo-400/40 shadow-inner'
                      : 'border-dashed border-indigo-300 bg-indigo-50/50 text-indigo-400 hover:border-indigo-400 hover:bg-indigo-50'
                  }`}
                >
                  {placedWord ? (
                    <span className="flex items-center space-x-1.5 animate-pop max-w-full">
                      <span className="break-words max-w-[140px] sm:max-w-[180px]">{placedWord}</span>
                      {feedbackState === 'correct' && (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200 shrink-0" />
                      )}
                      {feedbackState === 'wrong' && (
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-200 shrink-0" />
                      )}
                      {feedbackState === 'idle' && (
                        <span 
                          title="মুছে ফেলতে ট্যাপ করুন" 
                          className="p-1 hover:bg-white/20 rounded-full transition ml-0.5 shrink-0"
                        >
                          <Undo2 className="w-3.5 h-3.5 text-indigo-200" />
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-[11px] sm:text-xs font-semibold tracking-wide">
                      <ArrowDownCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 animate-bounce shrink-0" />
                      <span>এখানে বসাও</span>
                    </span>
                  )}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Word Meaning Hint Footer */}
        {stage.item?.meaning && (
          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-xs sm:text-sm text-slate-500 font-medium">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <span>শব্দের বাংলা অর্থ: <strong className="text-slate-800 font-bold">{stage.item.meaning}</strong></span>
          </div>
        )}
      </div>

      {/* Word Chip Pool Container */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-900/90 border-2 border-slate-800 text-center shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-center space-x-1.5 text-[11px] sm:text-xs text-slate-400 font-semibold mb-3 sm:mb-4">
          <MousePointerClick className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>টেনে এনে বসাও অথবা ট্যাপ করে নির্বাচন করো:</span>
        </div>

        {/* 3D Floating Word Chips */}
        <div className="flex flex-wrap justify-center gap-2">
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
                className={`py-2.5 px-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all transform flex items-center space-x-1.5 break-words max-w-full text-center active:scale-95 select-none ${
                  isWrong
                    ? 'border-2 border-rose-900/40 bg-rose-950/30 text-rose-400/60 opacity-40 cursor-not-allowed line-through'
                    : isPlaced
                    ? 'border-2 border-dashed border-indigo-400/60 bg-indigo-950/40 text-indigo-300 opacity-60 scale-95 shadow-none'
                    : 'game-btn-3d bg-white text-slate-900 border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 shadow-[0_4px_0_#94a3b8,0_6px_12px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-[0_1px_0_#94a3b8] cursor-grab active:cursor-grabbing'
                }`}
              >
                <span className="break-words">{opt}</span>
                {isWrong && <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                {isPlaced && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Action / Verification Button */}
      <div className="flex items-center space-x-2 sm:space-x-3 pt-1">
        {placedWord && feedbackState === 'idle' && (
          <button
            onClick={handleRemovePlacedWord}
            disabled={isSubmitting}
            className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 shadow-md shrink-0"
            title="শব্দটি ফিরিয়ে নাও"
          >
            <RotateCcw className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="hidden sm:inline">মুছে ফেলুন</span>
          </button>
        )}

        <button
          onClick={handleVerify}
          disabled={!placedWord || isSubmitting}
          className={`flex-1 py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm md:text-base flex items-center justify-center space-x-2 transition-all shadow-md ${
            placedWord && !isSubmitting
              ? 'game-btn-3d game-btn-emerald text-white animate-pop cursor-pointer'
              : 'bg-slate-800 border-2 border-slate-700 text-slate-500 opacity-60 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white/90 shrink-0" />
          <span className="truncate">
            {feedbackState === 'correct'
              ? 'সঠিক উত্তর! এগিয়ে চলুন...'
              : feedbackState === 'wrong'
              ? 'ভুল উত্তর!'
              : 'উত্তর নিশ্চিত করো (Check Answer)'}
          </span>
        </button>
      </div>
    </div>
  );
}

