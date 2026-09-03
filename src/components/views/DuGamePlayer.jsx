import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Star, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  RotateCcw, 
  Trophy, 
  Sparkles,
  HelpCircle,
  BookOpen,
  Globe,
  Flame,
  ChevronDown
} from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';
import { 
  loadDuQuestions, 
  filterMcqQuestions, 
  calculateDuLevelStars, 
  saveDuLevelStars,
  DU_SUBJECTS
} from '../../utils/duDataHelper';
import { mistakeManager } from '../../utils/mistakeManager';

export default function DuGamePlayer({
  level,
  subject = DU_SUBJECTS.BANGLA,
  onBackToMap,
  onNextLevel,
  isAudioMuted = false,
  setIsAudioMuted
}) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Game session states
  const [userAnswers, setUserAnswers] = useState({}); // { [id]: { chosenKey, isCorrect } }
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Load questions for this subject and year
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setCurrentIndex(0);
    setUserAnswers({});
    setSelectedOption(null);
    setIsAnswered(false);
    setShowExplanation(false);
    setStreak(0);
    setIsComplete(false);

    loadDuQuestions().then(data => {
      if (!isMounted) return;
      const filtered = filterMcqQuestions(data.mcq, {
        subject: subject === DU_SUBJECTS.ENGLISH ? 'English' : subject,
        year: level.year
      });
      setQuestions(filtered);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load level questions:', err);
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [level.year, subject]);

  const currentQ = questions[currentIndex] || null;
  const totalQuestions = questions.length;

  // Answer handler
  const handleSelectOption = (key) => {
    if (isAnswered || !currentQ) return;

    setSelectedOption(key);
    setIsAnswered(true);

    const isCorrect = key.toUpperCase() === currentQ.correctKey.toUpperCase();
    if (isCorrect) {
      sound.playCorrect();
      setStreak(s => s + 1);
    } else {
      sound.playWrong();
      setStreak(0);

      try {
        const chosenText = currentQ.cleanOptions?.[key] || key;
        const correctText = currentQ.cleanOptions?.[currentQ.correctKey] || currentQ.correctKey;
        mistakeManager.recordMistake({
          id: `du_q_${currentQ.id || currentQ.question_no}_${currentQ.subject || subject}`,
          source: 'du_game',
          subject: currentQ.subject || subject,
          subTitle: `${currentQ.subject || subject} • ${level.year} গেম`,
          questionText: currentQ.questionText || currentQ.question,
          userAnswer: `${key}. ${chosenText}`,
          correctAnswer: `${currentQ.correctKey}. ${correctText}`,
          explanation: currentQ.explanationText || currentQ.explanation || ''
        });
      } catch (err) {
        console.warn('Failed to record DU game mistake:', err);
      }
    }

    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        chosenKey: key,
        isCorrect
      }
    }));
  };

  // Move to next question or complete level
  const handleProceed = () => {
    sound.playClick();
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowExplanation(false);
    } else {
      // Level complete!
      setIsComplete(true);
      sound.playLevelComplete();
    }
  };

  // Calculate session results
  const correctCount = useMemo(() => {
    return Object.values(userAnswers).filter(a => a.isCorrect).length;
  }, [userAnswers]);

  const earnedStars = useMemo(() => {
    return calculateDuLevelStars(correctCount, totalQuestions);
  }, [correctCount, totalQuestions]);

  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Persist stars when completed
  useEffect(() => {
    if (isComplete && totalQuestions > 0) {
      saveDuLevelStars(subject, level.year, earnedStars);
    }
  }, [isComplete, subject, level.year, earnedStars, totalQuestions]);

  // Restart level
  const handleRestart = () => {
    sound.playClick();
    setCurrentIndex(0);
    setUserAnswers({});
    setSelectedOption(null);
    setIsAnswered(false);
    setShowExplanation(false);
    setStreak(0);
    setIsComplete(false);
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center text-neutral-300 font-sans p-4">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-mono text-neutral-400">Loading {level.title} Questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center text-neutral-300 font-sans p-6 text-center">
        <p className="text-sm text-neutral-300 mb-4">এই লেভেলের কোনো প্রশ্ন পাওয়া যায়নি।</p>
        <button
          onClick={onBackToMap}
          className="px-4 py-2 bg-neutral-800 text-white font-mono text-xs font-bold border border-neutral-700"
        >
          BACK TO MAP
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none pb-20 bg-[#0a0a0c] min-h-screen text-neutral-100 font-sans px-3">
      {/* 1. ULTRA-COMPACT EDITORIAL STICKY HEADER (Budget <= 80px) */}
      <header 
        className="sticky top-0 z-40 w-full bg-[#0a0a0c] border-b border-neutral-800 py-2.5 space-y-2 shadow-sm mb-3"
        style={{ paddingTop: 'max(0.6rem, env(safe-area-inset-top, 0px))' }}
      >
        {/* Row 1: Back + Level Title + Counter + Sound */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2 min-w-0">
            <button
              onClick={() => {
                sound.playClick();
                if (onBackToMap) onBackToMap();
              }}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-white text-xs font-semibold shrink-0 transition cursor-pointer active:scale-95"
              title="Back to Level Map"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] font-bold">MAP</span>
            </button>

            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white tracking-tight truncate">
                Level {level.levelId} <span className="text-slate-400 font-normal">({level.year})</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {streak > 1 && (
              <div className="flex items-center space-x-1 px-2 py-0.5 bg-[#1e293b] rounded-lg text-amber-300 font-mono text-[10px] font-bold">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{streak}</span>
              </div>
            )}

            <div className="flex items-center space-x-1 px-2.5 py-1 bg-[#1e293b] rounded-lg font-mono text-xs font-bold text-white">
              <span>{currentIndex + 1}</span>
              <span className="text-slate-400">/</span>
              <span>{totalQuestions}</span>
            </div>

            {setIsAudioMuted && (
              <button
                onClick={() => {
                  const next = !isAudioMuted;
                  setIsAudioMuted(next);
                  sound.enabled = !next;
                }}
                className="w-7 h-7 rounded-lg bg-[#1e293b] hover:bg-[#334155] flex items-center justify-center text-white transition cursor-pointer active:scale-90"
                title={isAudioMuted ? 'Unmute' : 'Mute'}
              >
                {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Smooth Progress Bar */}
        <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-[#2563eb] h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / totalQuestions) * 100}%` }}
          />
        </div>
      </header>

      {/* 2. QUESTION CARD */}
      {!isComplete && currentQ && (
        <div className="w-full flex flex-col space-y-3 pt-1">
          {/* Question Box */}
          <div className="w-full bg-[#1e293b] rounded-2xl p-4.5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-700/60 pb-2">
              <span className="text-amber-400 font-bold">
                {currentQ.subject} • প্রশ্ন {currentIndex + 1}
              </span>
              <span className="text-slate-400">
                {currentQ.session_year}
              </span>
            </div>

            <p className="text-sm sm:text-base font-semibold text-white leading-relaxed font-sans pt-1">
              {currentQ.questionText}
            </p>
          </div>

          {/* Options Grid (A, B, C, D) - SOLID FLAT 2-COLOR */}
          <div className="w-full space-y-2">
            {['A', 'B', 'C', 'D'].map((optKey) => {
              const optText = currentQ.cleanOptions[optKey];
              if (!optText) return null;

              const isSelected = selectedOption === optKey;
              const isCorrectOpt = optKey.toUpperCase() === currentQ.correctKey.toUpperCase();

              let btnStyle = "bg-[#1e293b] text-white hover:bg-[#283548]";

              if (isAnswered) {
                if (isCorrectOpt) {
                  btnStyle = "bg-[#059669] text-white font-bold";
                } else if (isSelected && !isCorrectOpt) {
                  btnStyle = "bg-[#b91c1c] text-white font-bold";
                } else {
                  btnStyle = "bg-[#0f172a] text-slate-500 opacity-60";
                }
              }

              return (
                <button
                  key={optKey}
                  onClick={() => handleSelectOption(optKey)}
                  disabled={isAnswered}
                  className={`w-full p-3.5 rounded-xl text-left flex items-start space-x-3 transition cursor-pointer active:scale-[0.99] shadow-sm ${btnStyle}`}
                >
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                    isAnswered && isCorrectOpt
                      ? 'bg-[#047857] text-white'
                      : isAnswered && isSelected && !isCorrectOpt
                      ? 'bg-[#991b1b] text-white'
                      : 'bg-[#0f172a] text-white'
                  }`}>
                    {optKey}
                  </span>
                  <span className="text-xs sm:text-sm font-sans flex-1 pt-0.5 leading-relaxed">
                    {optText}
                  </span>
                  {isAnswered && isCorrectOpt && (
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  )}
                  {isAnswered && isSelected && !isCorrectOpt && (
                    <XCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Accordion */}
          {isAnswered && currentQ.explanationText && (
            <div className="w-full bg-[#1e293b] rounded-xl overflow-hidden transition shadow-sm">
              <button
                onClick={() => setShowExplanation(s => !s)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-mono text-white cursor-pointer"
              >
                <div className="flex items-center space-x-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold">ব্যাখ্যা</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showExplanation ? 'rotate-180' : ''}`} />
              </button>

              {showExplanation && (
                <div className="px-3.5 pb-3 pt-1 text-xs text-slate-200 font-sans leading-relaxed border-t border-slate-700/60 bg-[#0f172a]">
                  {currentQ.explanationText}
                </div>
              )}
            </div>
          )}

          {/* Action Continue Button */}
          {isAnswered && (
            <button
              onClick={handleProceed}
              className="w-full py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-95 shadow-md mt-1"
            >
              <span>{currentIndex + 1 < totalQuestions ? 'পরবর্তী প্রশ্ন' : 'লেভেল সমাপ্ত করুন'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* 3. LEVEL COMPLETION MODAL */}
      {isComplete && (
        <div className="w-full flex flex-col items-center justify-center text-center space-y-4 pt-6 animate-pop">
          {/* Trophy Badge */}
          <div className="w-16 h-16 rounded-2xl bg-[#1e293b] flex items-center justify-center text-amber-400 shadow-sm">
            <Trophy className="w-8 h-8 stroke-[1.75]" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white font-sans tracking-tight">
              {level.title} সমাপ্ত!
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              ভর্তি পরীক্ষা: {level.year} • {subject}
            </p>
          </div>

          {/* 10 Stars Display */}
          <div className="bg-[#1e293b] rounded-2xl p-4 w-full flex flex-col items-center space-y-2 shadow-sm">
            <div className="flex items-center space-x-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < earnedStars 
                      ? 'text-amber-400 fill-amber-400 animate-pop' 
                      : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-base font-bold font-mono text-white">
              {earnedStars} / 10 Stars অর্জিত
            </p>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-2 gap-3 w-full font-mono text-xs">
            <div className="bg-[#1e293b] rounded-xl p-3 shadow-sm">
              <span className="text-slate-400 text-[10px]">সঠিক উত্তর</span>
              <p className="text-base font-bold text-emerald-400 mt-1">{correctCount} / {totalQuestions}</p>
            </div>
            <div className="bg-[#1e293b] rounded-xl p-3 shadow-sm">
              <span className="text-slate-400 text-[10px]">নির্ভুলতা</span>
              <p className="text-base font-bold text-amber-300 mt-1">{accuracy}%</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-2 pt-2">
            {onNextLevel && level.levelId < 10 && (
              <button
                onClick={() => {
                  sound.playClick();
                  onNextLevel();
                }}
                className="w-full py-3.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-95 shadow-sm"
              >
                <span>NEXT LEVEL ({level.levelId + 1})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleRestart}
              className="w-full py-3 bg-[#1e293b] hover:bg-[#334155] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-95 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RETRY LEVEL</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                if (onBackToMap) onBackToMap();
              }}
              className="w-full py-3 bg-[#0f172a] hover:bg-[#1e293b] text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95"
            >
              BACK TO MAP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
