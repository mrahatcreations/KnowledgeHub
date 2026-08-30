import React, { useState, useRef } from 'react';
import { Volume2, RotateCw, HelpCircle, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';
import { getPosInfo } from '../../utils/grammarHelper';

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
  const [speakingWord, setSpeakingWord] = useState(null);
  const [wrongOptions, setWrongOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [shakingOption, setShakingOption] = useState(null);
  const speakTimeoutRef = useRef(null);

  const targetWord = stage?.item?.word || stage?.targetWord || '';
  const posInfo = getPosInfo(stage?.item?.pos, targetWord, stage?.item?.meaning);
  const synonyms = extractWordList(stage?.item?.synonyms, stage?.item?.raw_synonyms);
  const antonyms = extractWordList(stage?.item?.antonyms, stage?.item?.raw_antonyms);
  const phonetics = stage?.item?.ipa || stage?.item?.phonetic || '';

  const handleFlip = () => {
    sound.playFlip();
    setIsFlipped(prev => !prev);
  };

  const handleSpeakWord = (e, wordToSpeak) => {
    if (e) e.stopPropagation();
    if (!wordToSpeak) return;

    sound.speak(wordToSpeak);
    setSpeakingWord(wordToSpeak);
    setIsSpeaking(true);

    if (speakTimeoutRef.current) clearTimeout(speakTimeoutRef.current);
    speakTimeoutRef.current = setTimeout(() => {
      setIsSpeaking(false);
      setSpeakingWord(null);
    }, 1200);
  };

  const handleSelectOption = (option) => {
    if (selectedOption !== null || wrongOptions.includes(option)) return;

    const isCorrect = String(option).trim().toLowerCase() === String(stage.correctAnswer).trim().toLowerCase();

    if (isCorrect) {
      sound.playCorrect();
      setSelectedOption(option);
      onSubmitAnswer(option);
    } else {
      sound.playWrong();
      setShakingOption(option);
      setWrongOptions(prev => [...prev, option]);
      setTimeout(() => setShakingOption(null), 400);
      onSubmitAnswer(option);
    }
  };

  const renderSentenceWithHighlight = (sentence, wordHighlight) => {
    if (!sentence) return null;
    if (!wordHighlight) return <span>&ldquo;{sentence}&rdquo;</span>;
    try {
      const parts = sentence.split(new RegExp(`(${wordHighlight})`, 'gi'));
      return (
        <span>
          &ldquo;
          {parts.map((part, i) =>
            part.toLowerCase() === wordHighlight.toLowerCase() ? (
              <span key={i} className="text-amber-300 font-semibold underline decoration-amber-400/40">
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

  const isSecondChanceActive = isSecondChance || wrongOptions.length > 0;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col space-y-4 sm:space-y-5 select-none rounded-none">
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
        className="perspective-1000 w-full cursor-pointer group outline-none rounded-none"
        title="Tap to flip card"
      >
        <div
          className={`relative w-full min-h-[220px] sm:min-h-[250px] rounded-none transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* ================= FRONT FACE ================= */}
          <div className="absolute inset-0 backface-hidden rounded-none p-5 sm:p-6 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#1e293b] to-[#0f172a] border-2 border-slate-700 shadow-[0_6px_0_#020617] transition-all duration-300">
            {/* Front Header */}
            <div className="relative z-10 flex items-center justify-between text-xs">
              <span className="px-2.5 py-1 rounded-none bg-blue-500/20 border border-blue-400/40 text-blue-300 font-mono text-[11px] font-bold uppercase tracking-wider">
                {posInfo.full || 'VOCABULARY'}
              </span>

              {/* Listen Pronunciation Action Button */}
              <button
                type="button"
                onClick={(e) => handleSpeakWord(e, targetWord)}
                className="px-3 py-1 rounded-none bg-blue-600 hover:bg-blue-500 active:translate-y-0.5 border border-blue-300 text-white font-mono text-xs font-bold flex items-center space-x-1.5 shadow-[0_2px_0_#1d4ed8] transition cursor-pointer"
                title="Listen Pronunciation"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-amber-300 animate-pulse' : 'text-white'}`} />
                <span>LISTEN</span>
              </button>
            </div>

            {/* Front Center: Prompt Word & Phonetics */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight break-words font-luxury-serif">
                {targetWord}
              </h2>

              {phonetics ? (
                <p className="font-mono text-xs sm:text-sm text-blue-300/80 mt-1 tracking-wide">
                  /{phonetics}/
                </p>
              ) : null}

              <p className="text-xs text-slate-400 font-medium tracking-wide mt-2">
                Tap card to reveal definition & details
              </p>
            </div>

            {/* Front Footer: Tap to Flip Cue */}
            <div className="relative z-10 flex items-center justify-center">
              <div className="inline-flex items-center space-x-1.5 text-slate-400 font-mono text-[11px] tracking-wider uppercase font-bold">
                <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                <span>Tap to flip</span>
              </div>
            </div>
          </div>

          {/* ================= BACK FACE ================= */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-none p-5 sm:p-6 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#1e293b] to-[#0f172a] border-2 border-slate-700 shadow-[0_6px_0_#020617] transition-all duration-300">
            {/* Back Header */}
            <div className="relative z-10 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-amber-300 font-mono text-[11px] font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Definition & Details</span>
              </div>

              {/* Target Word Quick Label with Audio */}
              <button
                type="button"
                onClick={(e) => handleSpeakWord(e, targetWord)}
                className="px-2.5 py-1 rounded-none bg-slate-900 border border-slate-700 text-blue-300 font-mono text-[11px] font-bold flex items-center space-x-1 hover:text-white transition cursor-pointer"
                title="Listen word"
              >
                <Volume2 className="w-3 h-3 text-blue-400" />
                <span className="truncate max-w-[120px]">{targetWord}</span>
              </button>
            </div>

            {/* Back Center: Meaning, Synonyms/Antonyms & Sentence */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-1 space-y-2.5 w-full">
              {/* Bengali Meaning */}
              <h3 className="text-2xl sm:text-3xl font-black text-amber-300 break-words text-center leading-tight font-sans">
                {stage?.item?.meaning}
              </h3>

              {/* Editorial Synonyms & Antonyms */}
              {(synonyms.length > 0 || antonyms.length > 0) && (
                <div className="w-full pt-2 border-t border-slate-800 space-y-1.5 text-xs sm:text-sm text-slate-300">
                  {synonyms.length > 0 && (
                    <div className="flex items-baseline justify-center flex-wrap gap-x-2 gap-y-1">
                      <span className="font-mono text-[11px] font-bold text-blue-400 uppercase tracking-wider shrink-0">
                        SYNONYMS:
                      </span>
                      <div className="flex items-center flex-wrap justify-center gap-x-1.5 gap-y-0.5 font-medium text-slate-200">
                        {synonyms.map((syn, idx) => {
                          const isSynSpeaking = speakingWord === syn;
                          return (
                            <React.Fragment key={idx}>
                              <span
                                onClick={(e) => handleSpeakWord(e, syn)}
                                className={`cursor-pointer hover:underline transition ${
                                  isSynSpeaking ? 'text-amber-300 font-bold' : 'hover:text-amber-300 text-slate-200'
                                }`}
                                title={`Tap to listen ${syn}`}
                              >
                                {syn}
                              </span>
                              {idx < synonyms.length - 1 && (
                                <span className="text-slate-600 font-bold">•</span>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {antonyms.length > 0 && (
                    <div className="flex items-baseline justify-center flex-wrap gap-x-2 gap-y-1">
                      <span className="font-mono text-[11px] font-bold text-rose-400 uppercase tracking-wider shrink-0">
                        ANTONYMS:
                      </span>
                      <div className="flex items-center flex-wrap justify-center gap-x-1.5 gap-y-0.5 font-medium text-slate-200">
                        {antonyms.map((ant, idx) => {
                          const isAntSpeaking = speakingWord === ant;
                          return (
                            <React.Fragment key={idx}>
                              <span
                                onClick={(e) => handleSpeakWord(e, ant)}
                                className={`cursor-pointer hover:underline transition ${
                                  isAntSpeaking ? 'text-amber-300 font-bold' : 'hover:text-amber-300 text-slate-200'
                                }`}
                                title={`Tap to listen ${ant}`}
                              >
                                {ant}
                              </span>
                              {idx < antonyms.length - 1 && (
                                <span className="text-slate-600 font-bold">•</span>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Elegant Example Sentence Block */}
              {stage?.item?.sentence && (
                <div className="w-full bg-slate-950/90 border-l-2 border-amber-400 p-2.5 sm:p-3 text-xs sm:text-sm text-slate-200 font-sans italic text-left max-w-md break-words rounded-none mt-0.5 leading-relaxed">
                  {renderSentenceWithHighlight(stage.item.sentence, targetWord)}
                </div>
              )}
            </div>

            {/* Back Footer: Tap to Flip Back Cue */}
            <div className="relative z-10 flex items-center justify-center">
              <div className="inline-flex items-center space-x-1.5 text-slate-400 font-mono text-[11px] tracking-wider uppercase font-bold">
                <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                <span>Tap to flip back</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ACTIVE RECALL QUIZ CONTAINER ================= */}
      <div
        className={`p-4 sm:p-5 rounded-none bg-[#0e1626]/95 border-2 transition-all duration-200 shadow-[0_4px_0_#020617] ${
          isSecondChanceActive
            ? 'border-amber-400/80 shadow-[0_4px_0_#78350f]'
            : 'border-slate-800'
        }`}
      >
        {/* Quiz Header */}
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-800 gap-2">
          <div className="flex items-center space-x-2 text-white font-bold text-sm sm:text-base min-w-0">
            <span className="p-1.5 rounded-none bg-slate-900 border border-slate-800 text-blue-400 shrink-0">
              <HelpCircle className="w-4 h-4" />
            </span>
            <span className="break-words font-sans">
              {stage?.question || `Select the correct meaning of "${targetWord}"`}
            </span>
          </div>

          {isSecondChanceActive && (
            <span className="shrink-0 px-2.5 py-1 bg-amber-600 text-white font-mono text-xs font-black uppercase tracking-wider rounded-none shadow-xs border border-amber-300">
              2nd Chance
            </span>
          )}
        </div>

        {/* Option Tiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(stage?.options || []).map((opt, i) => {
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
                className={`relative p-3.5 sm:p-4 rounded-none border-2 font-bold text-left transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer ${
                  isWrong
                    ? 'border-rose-300 bg-rose-600 text-white shadow-[0_4px_0_#9f1239] cursor-not-allowed opacity-90'
                    : isSelected
                    ? 'border-emerald-300 bg-emerald-600 text-white shadow-[0_4px_0_#065f46]'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-blue-500 text-white shadow-[0_4px_0_#020617] active:translate-y-1 active:shadow-none'
                } ${isShaking ? 'animate-shake' : ''}`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0 pr-1">
                  {/* Number Chip */}
                  <span
                    className={`w-7 h-7 shrink-0 rounded-none flex items-center justify-center text-xs font-mono font-bold border ${
                      isWrong
                        ? 'bg-rose-700 border-rose-300 text-white'
                        : isSelected
                        ? 'bg-emerald-700 border-emerald-300 text-white'
                        : 'bg-slate-950 border-slate-700 text-blue-300'
                    }`}
                  >
                    {chipNum}
                  </span>

                  {/* Option Text */}
                  <span className="leading-snug font-sans text-sm sm:text-base font-bold text-white break-words min-w-0">
                    {opt}
                  </span>
                </div>

                {/* Status Indicator Icon */}
                {isWrong ? (
                  <XCircle className="w-5 h-5 text-white shrink-0 ml-1" />
                ) : isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0 ml-1" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
