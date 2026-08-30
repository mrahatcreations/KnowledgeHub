import React, { useState, useEffect } from 'react';
import MobileHUD from './components/MobileHUD';
import SagaLevelPath from './components/SagaLevelPath';
import BottomNav from './components/BottomNav';
import VocabBookView from './components/views/VocabBookView';
import LeaderboardView from './components/views/LeaderboardView';
import ProfileView from './components/views/ProfileView';

import FlashcardStage from './components/stages/FlashcardStage';
import MatchingStage from './components/stages/MatchingStage';
import DragDropStage from './components/stages/DragDropStage';
import TrueFalseSwipeStage from './components/stages/TrueFalseSwipeStage';
import OddOneOutStage from './components/stages/OddOneOutStage';

import AnswerRevealModal from './components/modals/AnswerRevealModal';
import CompletionModal from './components/modals/CompletionModal';
import SyncModal from './components/modals/SyncModal';

import { buildLevelStages, STAGE_TYPES } from './engine/GameEngine';
import { sound } from './audio/SoundSynthesizer';

export default function App() {
  const [levels, setLevels] = useState([]);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [levelStars, setLevelStars] = useState({});
  const [currentLevel, setCurrentLevel] = useState(null);
  const [stages, setStages] = useState([]);
  const [stageIndex, setStageIndex] = useState(0);
  const [stageStars, setStageStars] = useState([false, false, false, false, false]);
  const [stageAttempts, setStageAttempts] = useState(0); // 0: 1st chance, 1: 2nd chance, 2: failed
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Gamification Stats
  const [streak, setStreak] = useState(5);
  const [gems, setGems] = useState(240);
  const [lives, setLives] = useState(5);

  // Navigation
  const [activeTab, setActiveTab] = useState('path'); // 'path', 'vocab', 'ranks', 'profile'

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [revealModalData, setRevealModalData] = useState(null);
  const [completionResult, setCompletionResult] = useState(null);

  useEffect(() => {
    loadLocalProgress();
    loadLevelsData();
  }, []);

  const loadLocalProgress = () => {
    try {
      const saved = localStorage.getItem('vocabmaster_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.unlockedLevel) setUnlockedLevel(parsed.unlockedLevel);
        if (parsed.levelStars) setLevelStars(parsed.levelStars);
        if (parsed.gems) setGems(parsed.gems);
        if (parsed.streak) setStreak(parsed.streak);
        if (parsed.lives !== undefined) setLives(parsed.lives);
      }
    } catch (e) {}
  };

  const saveProgress = (newUnlocked, newStars, newGems = gems) => {
    try {
      localStorage.setItem('vocabmaster_progress', JSON.stringify({
        unlockedLevel: newUnlocked,
        levelStars: newStars,
        gems: newGems,
        streak: streak,
        lives: lives
      }));
    } catch (e) {}
  };

  const loadLevelsData = async () => {
    try {
      const res = await fetch('/data/levels.json');
      const data = await res.json();
      if (data.levels && Array.isArray(data.levels)) {
        setLevels(data.levels);
      }
    } catch (e) {
      console.warn('Fallback loading levels error:', e);
    }
  };

  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const handleStartLevel = (level, isRetry = false) => {
    if (lives <= 0) {
      showToast('আপনার কোনো হার্টস অবশিষ্ট নেই! কিছুক্ষণ অপেক্ষা করুন।', 'warning');
      return;
    }
    const compiledStages = buildLevelStages(level, isRetry);
    setCurrentLevel(level);
    setStages(compiledStages);
    setStageIndex(0);
    setStageStars([false, false, false, false, false]);
    setStageAttempts(0);
    setCompletionResult(null);
    setRevealModalData(null);
  };

  const handleAnswerSubmit = (userAnswer) => {
    const currentStage = stages[stageIndex];
    let isCorrect = false;

    if (currentStage.type === STAGE_TYPES.MATCHING) {
      isCorrect = true; // Matching handles pairs internally
    } else {
      isCorrect = String(userAnswer).trim().toLowerCase() === String(currentStage.correctAnswer).trim().toLowerCase();
    }

    if (isCorrect) {
      sound.playCorrect();
      if (stageAttempts === 0) {
        const updatedStars = [...stageStars];
        updatedStars[stageIndex] = true;
        setStageStars(updatedStars);
        showToast('দারুণ উত্তর! (+১ স্টার অর্জিত)', 'success');
      } else {
        showToast('সঠিক উত্তর!', 'success');
      }

      setTimeout(() => {
        proceedNextStage();
      }, 700);
    } else {
      if (stageAttempts === 0) {
        setStageAttempts(1);
        sound.playSecondChance();
        showToast('ভুল উত্তর! ২য় সুযোগে আবার চেষ্টা করুন', 'warning');
      } else {
        setStageAttempts(2);
        sound.playWrong();
        setRevealModalData({
          correctAnswer: currentStage.correctAnswer,
          explanation: currentStage.explanation
        });
      }
    }
  };

  const proceedNextStage = () => {
    const nextIdx = stageIndex + 1;
    if (nextIdx >= 5) {
      finishLevel();
    } else {
      setStageIndex(nextIdx);
      setStageAttempts(0);
    }
  };

  const finishLevel = () => {
    const totalStarsEarned = stageStars.filter(Boolean).length;
    const isFiveStar = totalStarsEarned === 5;

    let newUnlocked = unlockedLevel;
    let newGems = gems;
    const updatedLevelStars = { ...levelStars, [currentLevel.level_id]: totalStarsEarned };

    if (isFiveStar) {
      sound.playVictory();
      newGems += 25;
      setGems(newGems);
      if (currentLevel.level_id >= unlockedLevel) {
        newUnlocked = currentLevel.level_id + 1;
        setUnlockedLevel(newUnlocked);
      }
    }

    setLevelStars(updatedLevelStars);
    saveProgress(newUnlocked, updatedLevelStars, newGems);

    setCompletionResult({
      level: currentLevel,
      totalStars: totalStarsEarned,
      isFiveStar: isFiveStar
    });
  };

  const currentStage = stages[stageIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans antialiased overflow-x-hidden">
      <MobileHUD
        currentLevel={currentLevel}
        stageIndex={stageIndex}
        stageStars={stageStars}
        isAudioMuted={isAudioMuted}
        setIsAudioMuted={setIsAudioMuted}
        onBackToMap={() => setCurrentLevel(null)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        streak={streak}
        gems={gems}
        lives={lives}
      />

      <main className="flex-1 flex flex-col justify-start py-4 px-3 sm:px-4 max-w-md w-full mx-auto">
        {!currentLevel ? (
          <>
            {activeTab === 'path' && (
              <SagaLevelPath
                levels={levels}
                unlockedLevel={unlockedLevel}
                levelStars={levelStars}
                onSelectLevel={(lvl) => handleStartLevel(lvl, false)}
              />
            )}
            {activeTab === 'vocab' && <VocabBookView levels={levels} levelStars={levelStars} />}
            {activeTab === 'ranks' && <LeaderboardView unlockedLevel={unlockedLevel} levelStars={levelStars} streak={streak} />}
            {activeTab === 'profile' && (
              <ProfileView
                levels={levels}
                unlockedLevel={unlockedLevel}
                levelStars={levelStars}
                streak={streak}
                gems={gems}
                lives={lives}
                isAudioMuted={isAudioMuted}
                setIsAudioMuted={setIsAudioMuted}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            )}
          </>
        ) : (
          <div className="w-full flex flex-col space-y-5 animate-pop">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{currentStage?.title}</h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">{currentStage?.instruction}</p>
            </div>

            {currentStage && (
              <>
                {currentStage.type === STAGE_TYPES.FLASHCARD && (
                  <FlashcardStage key={stageIndex} stage={currentStage} onSubmitAnswer={handleAnswerSubmit} />
                )}
                {currentStage.type === STAGE_TYPES.MATCHING && (
                  <MatchingStage key={stageIndex} stage={currentStage} onSubmitAnswer={handleAnswerSubmit} />
                )}
                {currentStage.type === STAGE_TYPES.DRAG_DROP && (
                  <DragDropStage key={stageIndex} stage={currentStage} onSubmitAnswer={handleAnswerSubmit} />
                )}
                {currentStage.type === STAGE_TYPES.TRUE_FALSE && (
                  <TrueFalseSwipeStage key={stageIndex} stage={currentStage} onSubmitAnswer={handleAnswerSubmit} />
                )}
                {currentStage.type === STAGE_TYPES.ODD_ONE_OUT && (
                  <OddOneOutStage key={stageIndex} stage={currentStage} onSubmitAnswer={handleAnswerSubmit} />
                )}
              </>
            )}
          </div>
        )}
      </main>

      {!currentLevel && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />}

      {toastMessage && (
        <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-black z-50 animate-pop text-white border ${
          toastMessage.type === 'success' ? 'bg-emerald-600 border-emerald-400 shadow-emerald-600/30' : 
          toastMessage.type === 'warning' ? 'bg-amber-600 border-amber-400 shadow-amber-600/30' : 'bg-slate-800 border-slate-700'
        }`}>
          {toastMessage.msg}
        </div>
      )}

      {revealModalData && (
        <AnswerRevealModal
          correctAnswer={revealModalData.correctAnswer}
          explanation={revealModalData.explanation}
          onContinue={() => { setRevealModalData(null); proceedNextStage(); }}
        />
      )}

      {completionResult && (
        <CompletionModal
          level={completionResult.level}
          totalStars={completionResult.totalStars}
          isFiveStar={completionResult.isFiveStar}
          onNextLevel={() => {
            const nextLvl = levels.find(l => l.level_id === currentLevel.level_id + 1);
            if (nextLvl) handleStartLevel(nextLvl, false); else setCurrentLevel(null);
          }}
          onRetryLevel={() => handleStartLevel(currentLevel, true)}
          onBackToMap={() => setCurrentLevel(null)}
        />
      )}

      {isSettingsOpen && (
        <SyncModal
          totalLevels={levels.length}
          onClose={() => setIsSettingsOpen(false)}
          onReloadLevels={loadLevelsData}
        />
      )}
    </div>
  );
}
