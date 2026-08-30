import React, { useState } from 'react';
import { MousePointerClick, XCircle } from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

export default function DragDropStage({ stage, onSubmitAnswer, isSecondChance }) {
  const [placedWord, setPlacedWord] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [wrongWords, setWrongWords] = useState([]);

  const handlePlaceWord = (word) => {
    if (wrongWords.includes(word) || placedWord) return;
    sound.playClick();
    setPlacedWord(word);

    const isCorrect = String(word).trim().toLowerCase() === String(stage.correctAnswer).trim().toLowerCase();

    if (isCorrect) {
      setTimeout(() => {
        onSubmitAnswer(word);
      }, 400);
    } else {
      setWrongWords(prev => [...prev, word]);
      setTimeout(() => {
        setPlacedWord(null);
        onSubmitAnswer(word);
      }, 600);
    }
  };

  const handleDragStart = (e, word) => {
    e.dataTransfer.setData('text/plain', word);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const word = e.dataTransfer.getData('text/plain');
    if (word) {
      handlePlaceWord(word);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col space-y-6 animate-pop">
      {/* Sentence Box */}
      <div className={`p-6 sm:p-8 rounded-3xl bg-white border-2 text-center shadow-md transition ${
        isSecondChance ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 bg-cyan-50 text-cyan-700 text-xs font-bold rounded-full">
            বাক্য সম্পূর্ণকরণ
          </span>
          {isSecondChance && (
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full animate-pulse">
              ২য় সুযোগ (0 Star)
            </span>
          )}
        </div>

        <div className="my-6 text-lg sm:text-xl font-bold text-slate-800 leading-relaxed">
          {stage.sentenceText.split('_______').map((part, i, arr) => (
            <React.Fragment key={i}>
              {part}
              {i < arr.length - 1 && (
                <span
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`inline-flex items-center justify-center min-w-[130px] px-4 py-1.5 align-middle mx-1.5 rounded-xl border-2 transition-all font-black ${
                    placedWord
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : isDragOver
                      ? 'bg-indigo-100 border-indigo-500 scale-105'
                      : 'border-dashed border-slate-300 bg-slate-50 text-slate-400 text-xs'
                  }`}
                >
                  {placedWord || 'এখানে বসাও'}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Available Word Chips */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
        <div className="flex items-center justify-center space-x-1 text-xs text-slate-500 font-semibold mb-3">
          <MousePointerClick className="w-4 h-4 text-indigo-500" />
          <span>টেনে এনে বসাও অথবা ক্লিক করে নির্বাচন করো:</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {stage.options.map((opt, i) => {
            const isWrong = wrongWords.includes(opt);
            return (
              <button
                key={i}
                draggable={!isWrong}
                onDragStart={(e) => handleDragStart(e, opt)}
                onClick={() => handlePlaceWord(opt)}
                disabled={isWrong || (placedWord !== null)}
                className={`px-5 py-2.5 border-2 font-bold text-sm rounded-xl shadow-xs transition transform active:scale-95 flex items-center space-x-1.5 ${
                  isWrong
                    ? 'border-rose-200 bg-rose-50 text-rose-400 opacity-60 cursor-not-allowed'
                    : 'bg-white border-slate-200 hover:border-indigo-500 text-slate-800 hover:shadow-md cursor-grab active:cursor-grabbing'
                }`}
              >
                <span>{opt}</span>
                {isWrong && <XCircle className="w-4 h-4 text-rose-500" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
