import React, { useState, useRef } from 'react';
import { Volume2, RotateCw, HelpCircle, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

function getPosConfig(pos) {
  if (!pos) {
    return {
      label: 'VOCAB',
      badgeClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
      dotClass: 'bg-indigo-400'
    };
  }

  const p = String(pos).toLowerCase().trim();
  if (p === 'n' || p.startsWith('noun')) {
    return {
      label: 'NOUN',
      badgeClass: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      dotClass: 'bg-blue-400'
    };
  }
  if (p === 'v' || p.startsWith('verb')) {
    return {
      label: 'VERB',
      badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      dotClass: 'bg-emerald-400'
    };
  }
  if (p === 'adj' || p.startsWith('adject')) {
    return {
      label: 'ADJECTIVE',
      badgeClass: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
      dotClass: 'bg-purple-400'
    };
  }
  if (p === 'adv' || p.startsWith('adverb')) {
    return {
      label: 'ADVERB',
      badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      dotClass: 'bg-amber-400'
    };
  }

  return {
    label: pos.toUpperCase(),
    badgeClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    dotClass: 'bg-cyan-400'
  };
}

function extractWordList(list, raw) {
  if (Array.isArray(list) && list.length > 0) {
    return list.filter(w => typeof w === 'string' && w.trim().length > 0);
  }
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.split(/[,;|]+/).map(w => w.trim()).filter(Boolean);
  }
  return [];
}

export default function FlashcardStage({ stage, onSubmitAnswer, isSecondChance }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [wrongOptions, setWrongOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [shakingOption, setShakingOption] = useState(null);
  const speakTimeoutRef = useRef(null);

  const posConfig = getPosConfig(stage.item?.pos);
  const synonyms = extractWordList(stage.item?.synonyms, stage.item?.raw_synonyms);
  const antonyms = extractWordList(stage.item?.antonyms, stage.item?.raw_antonyms);

  const handleFlip = () => {
    sound.playFlip();
    setIsFlipped(prev => !prev);
  };

  const handleSpeak = (e) => {
    e.stopPropagation();
    if (!stage.item?.word) return;
    sound.speak(stage.item.word);
    setIsSpeaking(true);
    if (speakTimeoutRef.current) clearTimeout(speakTimeoutRef.current);
    speakTimeoutRef.current = setTimeout(() => {
      setIsSpeaking(false);
    }, 1200);
  };

  const handleSelectOption = (option) => {
    if (selectedOption !== null || wrongOptions.includes(option)) return;

    sound.playClick();
    const isCorrect = String(option).trim().toLowerCase() === String(stage.correctAnswer).trim().toLowerCase();

    if (isCorrect) {
      setSelectedOption(option);
      onSubmitAnswer(option);
    } else {
      setShakingOption(option);
      setWrongOptions(prev => [...prev, option]);
      setTimeout(() => setShakingOption(null), 400);
      onSubmitAnswer(option);
    }
  };

  const renderSentenceWithHighlight = (sentence, targetWord) => {
    if (!sentence) return null;
    if (!targetWord) return <span>&ldquo;{sentence}&rdquo;</span>;
    try {
      const parts = sentence.split(new RegExp(`(${targetWord})`, 'gi'));
      return (
        <span>
          &ldquo;
          {parts.map((part, i) =>
            part.toLowerCase() === targetWord.toLowerCase() ? (
              <span key={i} className="text-amber-300 font-bold underline decoration-amber-400/50">
                {part}
              </span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
          &rdquo;
        </span>
      );
    } catch {
      return <span>&ldquo;{sentence}&rdquo;</span>;
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col space-y-4 sm:space-y-5 animate-pop select-none">
      {/* 3D Flip Card Container */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleFlip}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFlip();
          }
        }}
        className="perspective-1000 w-full cursor-pointer group outline-none rounded-2xl"
        title="কার্ড উল্টাতে ক্লিক করুন"
      >
        <div
          className={`relative w-full min-h-[200px] sm:min-h-[230px] rounded-2xl transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT FACE */}
          <div className="absolute inset-0 backface-hidden rounded-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden bg-slate-900 border border-slate-800 shadow-sm transition-all duration-300">
            {/* Front Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wider flex items-center space-x-1.5 border ${posConfig.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${posConfig.dotClass}`} />
                <span>{posConfig.label}</span>
              </div>

              {/* Pronunciation button */}
              <button
                type="button"
                onClick={handleSpeak}
                className="group/speak flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 hover:text-white shadow-xs active:scale-95 transition cursor-pointer"
                title="সঠিক উচ্চারণ শুনুন"
              >
                <Volume2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${isSpeaking ? 'text-amber-400 scale-110' : ''}`} />
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Listen</span>
              </button>
            </div>

            {/* Front Center: Large Crisp English Word */}
            <div className="relative z-10 text-center py-2 sm:py-4 my-auto">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight break-words">
                {stage.item?.word}
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium break-words">
                কার্ডে ট্যাপ করে বাংলা অর্থ ও বিস্তারিত দেখুন
              </p>
            </div>

            {/* Front Footer: Tap Flip Cue */}
            <div className="relative z-10 flex items-center justify-center">
              <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-400 text-[11px] sm:text-xs font-medium">
                <RotateCw className="w-3 h-3 text-slate-400" />
                <span>উল্টাতে ট্যাপ করুন</span>
              </div>
            </div>
          </div>

          {/* BACK FACE */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden bg-slate-900 border border-slate-800 shadow-sm transition-all duration-300">
            {/* Back Header */}
            <div className="relative z-10 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold tracking-wider uppercase text-[10px] sm:text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>শব্দের অর্থ ও বিবরণ</span>
              </div>
              <div className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-indigo-300 font-bold text-[10px] sm:text-xs font-mono max-w-[120px] truncate">
                {stage.item?.word}
              </div>
            </div>

            {/* Back Center: Bengali Meaning & Details */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-1 space-y-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)] break-words text-center leading-tight">
                {stage.item?.meaning}
              </h3>

              {/* Synonyms & Antonyms Pill Tags */}
              {(synonyms.length > 0 || antonyms.length > 0) && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-full">
                  {synonyms.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-1">
                      <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase mr-0.5">Synonyms:</span>
                      {synonyms.map((syn, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] sm:text-[11px] font-medium break-words"
                        >
                          {syn}
                        </span>
                      ))}
                    </div>
                  )}

                  {antonyms.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-1 ml-1">
                      <span className="text-[9px] sm:text-[10px] font-bold text-rose-400 uppercase mr-0.5">Antonyms:</span>
                      {antonyms.map((ant, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] sm:text-[11px] font-medium break-words"
                        >
                          {ant}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Example Sentence */}
              {stage.item?.sentence && (
                <div className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl p-2 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans italic text-center max-w-md break-words overflow-hidden">
                  {renderSentenceWithHighlight(stage.item.sentence, stage.item.word)}
                </div>
              )}
            </div>

            {/* Back Footer */}
            <div className="relative z-10 flex items-center justify-center">
              <div className="inline-flex items-center space-x-1.5 text-slate-400 text-[11px] sm:text-xs font-medium">
                <RotateCw className="w-3 h-3 text-slate-400" />
                <span>আবার উল্টাতে ট্যাপ করুন</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE RECALL QUIZ CONTAINER */}
      <div
        className={`p-3.5 sm:p-5 rounded-2xl bg-slate-900/90 border transition-all duration-200 shadow-sm ${
          isSecondChance || wrongOptions.length > 0
            ? 'border-amber-500/40 bg-slate-900'
            : 'border-slate-800'
        }`}
      >
        {/* Quiz Header */}
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-800 gap-2">
          <div className="flex items-center space-x-2 text-slate-200 font-bold text-xs sm:text-sm md:text-base min-w-0">
            <div className="p-1.5 rounded-lg bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shrink-0">
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="break-words">{stage.question || `"${stage.item?.word}" শব্দটির সঠিক বাংলা অর্থ কোনটি?`}</span>
          </div>

          {(isSecondChance || wrongOptions.length > 0) && (
            <span className="shrink-0 px-2.5 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] sm:text-[11px] font-bold rounded-full whitespace-nowrap">
              ২য় সুযোগ (0 Star)
            </span>
          )}
        </div>

        {/* Option Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {stage.options.map((opt, i) => {
            const isWrong = wrongOptions.includes(opt);
            const isSelected = selectedOption === opt;
            const isShaking = shakingOption === opt;
            const chipNum = i < 9 ? `0${i + 1}` : `${i + 1}`;

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectOption(opt)}
                disabled={isWrong || selectedOption !== null}
                className={`game-btn-3d w-full min-h-[48px] sm:min-h-[52px] p-3 rounded-xl border text-xs sm:text-sm font-semibold text-left transition-all duration-150 flex items-center justify-between touch-manipulation cursor-pointer ${
                  isWrong
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-300 opacity-60 cursor-not-allowed shadow-none'
                    : isSelected
                    ? 'game-btn-emerald bg-emerald-600 border-emerald-300 text-white font-bold shadow-[0_0_18px_rgba(16,185,129,0.5)] ring-2 ring-emerald-400/50'
                    : 'game-btn-slate bg-slate-900 border-slate-800 text-slate-100 hover:border-indigo-500/50 hover:text-white'
                } ${isShaking ? 'animate-shake' : ''}`}
              >
                <div className="flex items-center space-x-2.5 flex-1 min-w-0 pr-1.5">
                  {/* Number Chip */}
                  <span
                    className={`w-6 h-6 shrink-0 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold border transition ${
                      isWrong
                        ? 'bg-rose-900/40 border-rose-500/50 text-rose-200'
                        : isSelected
                        ? 'bg-emerald-700 border-emerald-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-indigo-300'
                    }`}
                  >
                    {chipNum}
                  </span>

                  {/* Option Text */}
                  <span className="leading-snug font-sans text-xs sm:text-sm md:text-base break-words min-w-0">
                    {opt}
                  </span>
                </div>

                {/* Status Indicator Icon */}
                {isWrong ? (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-1" />
                ) : isSelected ? (
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0 ml-1" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
