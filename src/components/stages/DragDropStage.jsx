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
        className={`relative overflow-hidden rounded-2xl bg-slate-900 border shadow-sm transition-all duration-200 p-4 sm:p-5 ${
          feedbackState === 'correct' 
            ? 'border-emerald-500/50' 
            : feedbackState === 'wrong'
            ? 'border-rose-500/50 animate-shake'
            : isSecondChance 
            ? 'border-amber-500/40' 
            : 'border-slate-800'
        }`}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-indigo-500/15 text-indigo-300 text-[11px] sm:text-xs font-bold rounded-full uppercase tracking-wider flex items-center space-x-1.5 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>বাক্য সম্পূর্ণকরণ</span>
            </span>

            {isSecondChance && (
              <span className="px-2 py-0.5 bg-amber-500/15 text-amber-300 text-[10px] sm:text-[11px] font-bold rounded-full border border-amber-500/30">
                ২য় সুযোগ (০ স্টার)
              </span>
            )}
          </div>

          <button
            onClick={handleSpeak}
            className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition shadow-xs active:scale-95 flex items-center space-x-1"
            title="বাক্যের ইংরেজি উচ্চারণ শুনুন"
          >
            <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-[11px] font-semibold hidden sm:inline">উচ্চারণ</span>
          </button>
        </div>

        {/* Interactive Sentence with Snap-in Slot Target */}
        <div className="my-3 sm:my-4 text-base sm:text-xl font-bold text-slate-100 leading-relaxed text-center break-words">
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
                  className={`inline-flex items-center justify-center align-middle mx-1.5 my-1 min-h-[40px] min-w-[110px] px-3 py-1 rounded-xl border transition-all duration-150 text-xs sm:text-sm font-bold relative max-w-full ${
                    placedWord
                      ? feedbackState === 'correct'
                        ? 'bg-emerald-600 border-emerald-400 text-white cursor-pointer'
                        : feedbackState === 'wrong'
                        ? 'bg-rose-600 border-rose-400 text-white cursor-pointer'
                        : 'bg-indigo-600 text-white border-indigo-400 cursor-pointer shadow-sm'
                      : isDragOver
                      ? 'border-indigo-400 bg-indigo-950/80 text-indigo-300'
                      : 'border-dashed border-slate-700 bg-slate-950/60 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {placedWord ? (
                    <span className="flex items-center space-x-1.5 animate-pop max-w-full">
                      <span className="break-words max-w-[140px] sm:max-w-[180px]">{placedWord}</span>
                      {feedbackState === 'correct' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                      )}
                      {feedbackState === 'wrong' && (
                        <XCircle className="w-4 h-4 text-rose-200 shrink-0" />
                      )}
                      {feedbackState === 'idle' && (
                        <span 
                          title="মুছে ফেলতে ট্যাপ করুন" 
                          className="p-0.5 hover:bg-white/20 rounded-full transition ml-0.5 shrink-0"
                        >
                          <Undo2 className="w-3.5 h-3.5 text-indigo-200" />
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-[11px] sm:text-xs font-semibold text-slate-400">
                      <ArrowDownCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
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
          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-center space-x-1.5 text-xs text-slate-400 font-medium">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>শব্দের বাংলা অর্থ: <strong className="text-amber-300 font-bold">{stage.item.meaning}</strong></span>
          </div>
        )}
      </div>

      {/* Word Chip Pool Container */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow-sm">
        <div className="flex items-center justify-center space-x-1.5 text-[11px] sm:text-xs text-slate-400 font-semibold mb-3">
          <MousePointerClick className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>টেনে এনে বসাও অথবা ট্যাপ করে নির্বাচন করো:</span>
        </div>

        {/* Word Chips */}
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
                className={`py-2 px-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center space-x-1.5 break-words max-w-full text-center active:scale-95 select-none ${
                  isWrong
                    ? 'border border-rose-900/40 bg-rose-950/30 text-rose-400/60 opacity-40 cursor-not-allowed line-through'
                    : isPlaced
                    ? 'border border-dashed border-indigo-500/40 bg-indigo-950/30 text-indigo-400 opacity-60 scale-95'
                    : 'game-btn-3d bg-slate-800 text-slate-100 border border-slate-700 hover:border-slate-600 hover:text-white cursor-grab active:cursor-grabbing'
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
      <div className="flex items-center space-x-2 pt-1">
        {placedWord && feedbackState === 'idle' && (
          <button
            onClick={handleRemovePlacedWord}
            disabled={isSubmitting}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 shrink-0"
            title="শব্দটি ফিরিয়ে নাও"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="hidden sm:inline">মুছে ফেলুন</span>
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
