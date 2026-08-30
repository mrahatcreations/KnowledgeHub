import React, { useState } from 'react';
import { Volume2, RotateCw, HelpCircle, XCircle } from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

export default function FlashcardStage({ stage, onSubmitAnswer, isSecondChance }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [wrongOptions, setWrongOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    sound.playFlip();
  };

  const handleSpeak = (e) => {
    e.stopPropagation();
    sound.speak(stage.item.word);
  };

  const handleSelectOption = (opt) => {
    if (selectedOption || wrongOptions.includes(opt)) return;
    sound.playClick();

    const isCorrect = String(opt).trim().toLowerCase() === String(stage.correctAnswer).trim().toLowerCase();

    if (isCorrect) {
      setSelectedOption(opt);
      onSubmitAnswer(opt);
    } else {
      setWrongOptions(prev => [...prev, opt]);
      onSubmitAnswer(opt);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col space-y-6 animate-pop">
      {/* 3D Flip Card Container */}
      <div 
        onClick={handleFlip}
        className="perspective-1000 w-full cursor-pointer group"
      >
        <div className={`relative w-full min-h-[240px] rounded-3xl transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}>
          {/* Front Card Face */}
          <div className="absolute inset-0 backface-hidden bg-white border-2 border-indigo-100 rounded-3xl p-6 shadow-md flex flex-col justify-between group-hover:border-indigo-300 transition">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
                {stage.item.pos || 'VOCABULARY'}
              </span>
              <button
                onClick={handleSpeak}
                className="p-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-full transition shadow-xs"
                title="Pronounce Word"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
                {stage.item.word}
              </h2>
              <p className="text-xs text-slate-400 mt-2 font-medium">কার্ডে ক্লিক করে অর্থ ও ব্যাখ্যা দেখুন</p>
            </div>

            <div className="flex items-center justify-center text-indigo-600 text-xs font-bold space-x-1.5 py-1">
              <RotateCw className="w-4 h-4" />
              <span>উল্টাতে ট্যাপ করুন</span>
            </div>
          </div>

          {/* Back Card Face */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>শব্দের অর্থ ও বিবরণ</span>
              <span className="text-indigo-400 font-bold">{stage.item.word}</span>
            </div>

            <div className="text-center py-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-amber-400">
                {stage.item.meaning}
              </h3>
              {stage.item.raw_synonyms && (
                <p className="text-xs text-slate-300 mt-3">
                  <span className="text-slate-400 font-semibold">Synonyms:</span> {stage.item.raw_synonyms}
                </p>
              )}
              {stage.item.raw_antonyms && (
                <p className="text-xs text-slate-400 mt-1">
                  <span className="text-slate-500 font-semibold">Antonyms:</span> {stage.item.raw_antonyms}
                </p>
              )}
            </div>

            <div className="text-center text-xs text-slate-400">
              আবার উল্টাতে ট্যাপ করুন
            </div>
          </div>
        </div>
      </div>

      {/* Active Recall Question Card */}
      <div className={`p-5 rounded-2xl bg-white border-2 transition shadow-sm ${
        isSecondChance ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-slate-700 font-bold text-sm">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>{stage.question}</span>
          </div>
          {isSecondChance && (
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full animate-pulse">
              ২য় সুযোগ (0 Star)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {stage.options.map((opt, i) => {
            const isWrong = wrongOptions.includes(opt);
            const isSelected = selectedOption === opt;

            return (
              <button
                key={i}
                onClick={() => handleSelectOption(opt)}
                disabled={isWrong || (selectedOption !== null)}
                className={`p-3.5 text-sm font-semibold rounded-xl border-2 transition flex items-center justify-between text-left ${
                  isWrong
                    ? 'border-rose-300 bg-rose-50 text-rose-400 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                    : 'border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-slate-800 bg-white shadow-xs'
                }`}
              >
                <span>{opt}</span>
                {isWrong ? (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                ) : (
                  <span className="text-xs text-slate-400 font-mono">0{i + 1}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
