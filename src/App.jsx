import React from 'react';
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

import { STAGE_TYPES } from './engine/GameEngine';
import { useGameState } from './hooks/useGameState';
import { useSoundEffects } from './hooks/useSoundEffects';

export default function App() {
  const soundController = useSoundEffects();
  const {
    isAudioMuted,
    setIsAudioMuted
  } = soundController;

  const {
    // Levels & Loading
    levels,
    loadLevelsData,

    // Progression
    unlockedLevel,
    levelStars,
    streak,
    gems,
    lives,

    // Active Level / 10-Stage Session
    currentLevel,
    stages,
    stageIndex,
    stageStars,
    stageAttempts,
    currentStage,
    mistakes,
    revealModalData,
    completionResult,

    // Actions & Handlers
    handleStartLevel,
    handleAnswerSubmit,
    closeRevealModalAndProceed,
    handleNextLevel,
    handleRetryLevel,
    handleBackToMap,

    // Navigation & Modals
    activeTab,
    setActiveTab,
    isSettingsOpen,
    setIsSettingsOpen,
    toastMessage
  } = useGameState({ soundController });

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-[100vw] bg-slate-950 text-slate-100 flex flex-col items-center selection:bg-indigo-500 selection:text-white font-sans antialiased overflow-x-hidden touch-manipulation">
      <div className="max-w-md mx-auto w-full min-h-screen min-h-[100dvh] flex flex-col relative overflow-x-hidden">
        <MobileHUD
          currentLevel={currentLevel}
          stageIndex={stageIndex}
          stageStars={stageStars}
          totalStages={stages.length || 10}
          isAudioMuted={isAudioMuted}
          setIsAudioMuted={setIsAudioMuted}
          onBackToMap={handleBackToMap}
          onOpenSettings={() => setIsSettingsOpen(true)}
          streak={streak}
          gems={gems}
          lives={lives}
        />

        <main className={`flex-1 flex flex-col justify-start py-4 px-3 sm:px-4 max-w-md w-full mx-auto ${!currentLevel ? 'pb-24' : 'pb-6'}`}>
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
            <div className="w-full flex flex-col space-y-4 sm:space-y-5 animate-pop">
              <div className="text-center space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{currentStage?.title}</h2>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">{currentStage?.instruction}</p>
              </div>

              {currentStage && (
                <>
                  {currentStage.type === STAGE_TYPES.FLASHCARD && (
                    <FlashcardStage key={`stage_${stageIndex}_${currentStage.item?.id || ''}_${currentStage.correctAnswer}`} stage={currentStage} onSubmitAnswer={handleAnswerSubmit} isSecondChance={stageAttempts === 1} />
                  )}
                  {currentStage.type === STAGE_TYPES.MATCHING && (
                    <MatchingStage key={`stage_${stageIndex}_${currentStage.item?.id || ''}_${currentStage.correctAnswer}`} stage={currentStage} onSubmitAnswer={handleAnswerSubmit} isSecondChance={stageAttempts === 1} />
                  )}
                  {currentStage.type === STAGE_TYPES.DRAG_DROP && (
                    <DragDropStage key={`stage_${stageIndex}_${currentStage.item?.id || ''}_${currentStage.correctAnswer}`} stage={currentStage} onSubmitAnswer={handleAnswerSubmit} isSecondChance={stageAttempts === 1} />
                  )}
                  {currentStage.type === STAGE_TYPES.TRUE_FALSE && (
                    <TrueFalseSwipeStage key={`stage_${stageIndex}_${currentStage.item?.id || ''}_${currentStage.correctAnswer}`} stage={currentStage} onSubmitAnswer={handleAnswerSubmit} isSecondChance={stageAttempts === 1} />
                  )}
                  {currentStage.type === STAGE_TYPES.ODD_ONE_OUT && (
                    <OddOneOutStage key={`stage_${stageIndex}_${currentStage.item?.id || ''}_${currentStage.correctAnswer}`} stage={currentStage} onSubmitAnswer={handleAnswerSubmit} isSecondChance={stageAttempts === 1} />
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
            onContinue={closeRevealModalAndProceed}
          />
        )}

        {completionResult && (
          <CompletionModal
            level={completionResult.level}
            totalStars={completionResult.totalStars}
            totalStages={completionResult.totalPossible || 10}
            isTenStar={completionResult.isTenStar}
            isFiveStar={completionResult.isFiveStar}
            mistakes={mistakes}
            onNextLevel={handleNextLevel}
            onRetryLevel={handleRetryLevel}
            onBackToMap={handleBackToMap}
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
    </div>
  );
}
