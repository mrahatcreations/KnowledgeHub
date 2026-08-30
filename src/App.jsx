import React from 'react';
import MobileHUD from './components/MobileHUD';
import SagaLevelPath from './components/SagaLevelPath';
import BottomNav from './components/BottomNav';
import VocabBookView from './components/views/VocabBookView';

import FlashcardStage from './components/stages/FlashcardStage';
import MatchingStage from './components/stages/MatchingStage';
import DragDropStage from './components/stages/DragDropStage';
import TrueFalseSwipeStage from './components/stages/TrueFalseSwipeStage';
import OddOneOutStage from './components/stages/OddOneOutStage';

import AnswerRevealModal from './components/modals/AnswerRevealModal';
import CompletionModal from './components/modals/CompletionModal';

import { STAGE_TYPES } from './engine/GameEngine';
import { useGameState } from './hooks/useGameState';
import { useSoundEffects } from './hooks/useSoundEffects';
import { Star, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const soundController = useSoundEffects();
  const {
    isAudioMuted,
    setIsAudioMuted
  } = soundController;

  const {
    // Levels & Loading
    levels,

    // Progression
    unlockedLevel,
    levelStars,

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

    // Navigation
    activeTab,
    setActiveTab,
    toastMessage,
    stageCelebration
  } = useGameState({ soundController });

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center selection:bg-indigo-500 selection:text-white font-sans antialiased">
      <div className="max-w-md mx-auto w-full min-h-screen flex flex-col relative">
        <MobileHUD
          currentLevel={currentLevel}
          stageIndex={stageIndex}
          stageStars={stageStars}
          totalStages={stages.length || 10}
          isAudioMuted={isAudioMuted}
          setIsAudioMuted={setIsAudioMuted}
          onBackToMap={handleBackToMap}
          levelStars={levelStars}
          unlockedLevel={unlockedLevel}
        />

        <main className={`flex-1 flex flex-col justify-start py-3 px-3 sm:px-4 max-w-md w-full mx-auto ${!currentLevel ? 'pb-32' : 'pb-8'}`}>
          {!currentLevel ? (
            <>
              {activeTab === 'path' && (
                <SagaLevelPath
                  levels={levels}
                  unlockedLevel={unlockedLevel}
                  levelStars={levelStars}
                  onSelectLevel={(lvl) => handleStartLevel(lvl, true)}
                />
              )}
              {activeTab === 'vocab' && <VocabBookView levels={levels} levelStars={levelStars} />}
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

        {!currentLevel && (
          <BottomNav 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
        )}

        {/* First-Attempt Perfect Stage Micro-Celebration Overlay */}
        {stageCelebration && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center animate-pop px-4 select-none">
            <div className="bg-slate-900/95 border border-amber-400/60 shadow-[0_0_35px_rgba(251,191,36,0.5)] rounded-2xl px-6 py-4 flex flex-col items-center space-y-1.5 text-center transform scale-105 sm:scale-110">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                <Star className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-bounce" />
                <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
              </div>
              <div className="text-xl font-black text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
                {stageCelebration.title}
              </div>
              <div className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{stageCelebration.subtitle}</span>
              </div>
            </div>
          </div>
        )}

        {toastMessage && !stageCelebration && (
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
      </div>
    </div>
  );
}
