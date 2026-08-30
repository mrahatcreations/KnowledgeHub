import React, { useState, useRef } from 'react';
import { Volume2, RotateCw, HelpCircle, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

/**
 * Helper to get POS badge configuration with distinct colors:
 * Noun: Blue, Verb: Emerald, Adjective: Purple, Adverb: Amber
 */
function getPosConfig(pos) {
  if (!pos) {
    return {
      label: 'VOCAB',
      badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30 ring-1 ring-indigo-500/20',
      dotClass: 'bg-indigo-400'
    };
  }

  const p = String(pos).toLowerCase().trim();
  if (p === 'n' || p.startsWith('noun')) {
    return {
      label: 'NOUN',
      badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-400/30 ring-1 ring-blue-500/20',
      dotClass: 'bg-blue-400'
    };
  }
  if (p === 'v' || p.startsWith('verb')) {
    return {
      label: 'VERB',
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30 ring-1 ring-emerald-500/20',
      dotClass: 'bg-emerald-400'
    };
  }
  if (p === 'adj' || p.startsWith('adject')) {
    return {
      label: 'ADJECTIVE',
      badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-400/30 ring-1 ring-purple-500/20',
      dotClass: 'bg-purple-400'
    };
  }
  if (p === 'adv' || p.startsWith('adverb')) {
    return {
      label: 'ADVERB',
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-400/30 ring-1 ring-amber-500/20',
      dotClass: 'bg-amber-400'
    };
  }

  return {
    label: pos.toUpperCase(),
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30 ring-1 ring-cyan-500/20',
    dotClass: 'bg-cyan-400'
  };
}

/**
 * Helper to safely extract list of words from array or comma-separated string
 */
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
    setIsFlipped(!isFlipped);
    sound.playFlip();
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

  const handleSelectOption = (opt) => {
    if (selectedOption || wrongOptions.includes(opt)) return;
    sound.playClick();

    const isCorrect = String(opt).trim().toLowerCase() === String(stage.correctAnswer).trim().toLowerCase();

    if (isCorrect) {
      setSelectedOption(opt);
      onSubmitAnswer(opt);
    } else {
      setShakingOption(opt);
      setTimeout(() => setShakingOption(null), 500);
      setWrongOptions(prev => [...prev, opt]);
      onSubmitAnswer(opt);
    }
  };

  // Highlights the target word in the example sentence
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
    <div className="w-full max-w-xl mx-auto flex flex-col space-y-5 animate-pop select-none">
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
        className="perspective-1000 w-full cursor-pointer group outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-3xl"
        title="কার্ড উল্টাতে ক্লিক করুন"
      >
        <div
          className={`relative w-full min-h-[260px] sm:min-h-[270px] rounded-3xl transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* =========================================
              FRONT CARD FACE
             ========================================= */}
          <div className="absolute inset-0 backface-hidden rounded-3xl p-6 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/95 to-indigo-950/90 border-2 border-indigo-500/30 group-hover:border-indigo-400/60 shadow-[0_16px_36px_rgba(15,23,42,0.8),0_0_24px_rgba(99,102,241,0.15)] transition-all duration-300">
            {/* Glossy Top Sheen Accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none rounded-3xl" />
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* Front Header: POS Badge & Pronounce Button */}
            <div className="relative z-10 flex items-center justify-between">
              <div className={`px-3.5 py-1 rounded-full text-xs font-black tracking-wider flex items-center space-x-1.5 border shadow-xs ${posConfig.badgeClass}`}>
                <span className={`w-2 h-2 rounded-full ${posConfig.dotClass} animate-pulse`} />
                <span>{posConfig.label}</span>
              </div>

              {/* Pronunciation button with Sound Wave SVG */}
              <button
                type="button"
                onClick={handleSpeak}
                className="group/speak flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-400/30 hover:border-indigo-400/60 text-indigo-300 hover:text-white shadow-md active:scale-95 transition cursor-pointer"
                title="সঠিক উচ্চারণ শুনুন (Pronounce Word)"
              >
                <Volume2 className={`w-4 h-4 transition-transform ${isSpeaking ? 'text-amber-400 scale-110' : 'group-hover/speak:scale-110'}`} />
                {/* Custom Audio Wave SVG Indicator */}
                <div className="flex items-center space-x-0.5 h-3.5">
                  <span className={`w-0.5 rounded-full bg-indigo-300 transition-all duration-150 ${isSpeaking ? 'h-3.5 bg-amber-400 animate-pulse' : 'h-1.5'}`} />
                  <span className={`w-0.5 rounded-full bg-indigo-300 transition-all duration-150 ${isSpeaking ? 'h-4 bg-amber-400 animate-bounce' : 'h-3'}`} />
                  <span className={`w-0.5 rounded-full bg-indigo-300 transition-all duration-150 ${isSpeaking ? 'h-2.5 bg-amber-400 animate-pulse' : 'h-1'}`} />
                  <span className={`w-0.5 rounded-full bg-indigo-300 transition-all duration-150 ${isSpeaking ? 'h-4 bg-amber-400 animate-bounce' : 'h-2.5'}`} />
                  <span className={`w-0.5 rounded-full bg-indigo-300 transition-all duration-150 ${isSpeaking ? 'h-2 bg-amber-400 animate-pulse' : 'h-1.5'}`} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider hidden xs:inline">Listen</span>
              </button>
            </div>

            {/* Front Center: Large Crisp English Word */}
            <div className="relative z-10 text-center py-4 my-auto">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                {stage.item?.word}
              </h2>
              <p className="text-xs text-indigo-200/70 mt-2 font-medium">
                কার্ডে ট্যাপ করে বাংলা অর্থ ও বিস্তারিত দেখুন
              </p>
            </div>

            {/* Front Footer: Tap Flip Cue */}
            <div className="relative z-10 flex items-center justify-center">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-indigo-300 text-xs font-bold shadow-xs group-hover:bg-indigo-950/60 group-hover:border-indigo-500/40 transition">
                <RotateCw className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-180 transition-transform duration-500" />
                <span>উল্টাতে ট্যাপ করুন</span>
              </div>
            </div>
          </div>

          {/* =========================================
              BACK CARD FACE
             ========================================= */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950 border-2 border-amber-500/40 group-hover:border-amber-400/60 shadow-[0_16px_36px_rgba(15,23,42,0.9),0_0_28px_rgba(245,158,11,0.2)] transition-all duration-300">
            {/* Glossy Top Sheen Accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none rounded-3xl" />
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Back Header */}
            <div className="relative z-10 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold tracking-wider uppercase text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>শব্দের অর্থ ও বিবরণ</span>
              </div>
              <div className="px-2.5 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-indigo-300 font-black text-xs font-mono">
                {stage.item?.word}
              </div>
            </div>

            {/* Back Center: Glowing Golden Bengali Meaning & Details */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-2 space-y-3">
              {/* Glowing Golden Bengali Meaning */}
              <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-300 drop-shadow-[0_0_16px_rgba(251,191,36,0.6)]">
                {stage.item?.meaning}
              </h3>

              {/* Synonyms & Antonyms Pill Tags */}
              {(synonyms.length > 0 || antonyms.length > 0) && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-full">
                  {synonyms.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-1">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase mr-0.5">Synonyms:</span>
                      {synonyms.map((syn, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-semibold"
                        >
                          {syn}
                        </span>
                      ))}
                    </div>
                  )}

                  {antonyms.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-1 ml-1.5">
                      <span className="text-[10px] font-bold text-rose-400 uppercase mr-0.5">Antonyms:</span>
                      {antonyms.map((ant, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-300 text-[11px] font-semibold"
                        >
                          {ant}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Example Sentence with High Readability */}
              {stage.item?.sentence && (
                <div className="w-full bg-slate-800/70 border border-slate-700/60 rounded-2xl p-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans italic text-center max-w-md shadow-inner">
                  {renderSentenceWithHighlight(stage.item.sentence, stage.item.word)}
                </div>
              )}
            </div>

            {/* Back Footer: Tap Flip Cue */}
            <div className="relative z-10 flex items-center justify-center">
              <div className="inline-flex items-center space-x-1.5 text-slate-400 text-xs font-semibold">
                <RotateCw className="w-3 h-3 text-slate-400" />
                <span>আবার উল্টাতে ট্যাপ করুন</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          ACTIVE RECALL QUIZ CONTAINER
         ========================================= */}
      <div
        className={`p-5 sm:p-6 rounded-3xl bg-slate-900/90 border-2 transition-all duration-300 shadow-2xl backdrop-blur-md ${
          isSecondChance || wrongOptions.length > 0
            ? 'border-amber-500/60 bg-gradient-to-b from-slate-900 to-amber-950/20 ring-2 ring-amber-500/20'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        {/* Quiz Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center space-x-2 text-slate-200 font-bold text-sm sm:text-base">
            <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span>{stage.question || `"${stage.item?.word}" শব্দটির সঠিক বাংলা অর্থ কোনটি?`}</span>
          </div>

          {(isSecondChance || wrongOptions.length > 0) && (
            <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-black rounded-full animate-pulse shadow-xs">
              ২য় সুযোগ (0 Star)
            </span>
          )}
        </div>

        {/* 3D Tactile Option Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                className={`game-btn-3d w-full min-h-[56px] p-3.5 rounded-2xl border-2 text-sm font-bold text-left transition-all duration-150 flex items-center justify-between touch-manipulation cursor-pointer ${
                  isWrong
                    ? 'bg-rose-950/50 border-rose-500/60 text-rose-300 opacity-60 cursor-not-allowed shadow-none'
                    : isSelected
                    ? 'game-btn-emerald bg-emerald-600 border-emerald-300 text-white font-extrabold ring-4 ring-emerald-400/40 shadow-[0_0_24px_rgba(16,185,129,0.5)]'
                    : 'game-btn-slate bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700 text-slate-100 hover:border-indigo-400 hover:text-white'
                } ${isShaking ? 'animate-shake' : ''}`}
              >
                <div className="flex items-center space-x-3 flex-1 flex-1 pr-2">
                  {/* Number Chip */}
                  <span
                    className={`w-7 h-7 shrink-0 rounded-xl flex items-center justify-center text-xs font-mono font-black border transition ${
                      isWrong
                        ? 'bg-rose-900/60 border-rose-500/80 text-rose-200'
                        : isSelected
                        ? 'bg-emerald-700/80 border-white text-white'
                        : 'bg-slate-950/80 border-slate-700 text-indigo-300'
                    }`}
                  >
                    {chipNum}
                  </span>

                  {/* Option Text */}
                  <span className="leading-snug font-sans text-sm sm:text-base break-words">
                    {opt}
                  </span>
                </div>

                {/* Status Indicator Icon */}
                {isWrong ? (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                ) : isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0 animate-pop" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
