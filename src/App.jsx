import React, { useState, useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import MobileHUD from './components/MobileHUD';
import SagaLevelPath from './components/SagaLevelPath';
import SubjectHubView from './components/views/SubjectHubView';
import VocabBookView from './components/views/VocabBookView';

import FlashcardStage from './components/stages/FlashcardStage';
import MatchingStage from './components/stages/MatchingStage';
import DragDropStage from './components/stages/DragDropStage';
import TrueFalseSwipeStage from './components/stages/TrueFalseSwipeStage';
import OddOneOutStage from './components/stages/OddOneOutStage';

import AnswerRevealModal from './components/modals/AnswerRevealModal';
import CompletionModal from './components/modals/CompletionModal';
import AudioPackSettingsModal from './components/modals/AudioPackSettingsModal';

import { STAGE_TYPES } from './engine/GameEngine';
import { useGameState } from './hooks/useGameState';
import { useSoundEffects } from './hooks/useSoundEffects';
import { Star, Sparkles, CheckCircle2 } from 'lucide-react';

class StageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Stage Error Caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full flex flex-col items-center justify-center p-6 space-y-4 bg-slate-900 border border-red-500/40 rounded-none text-center">
          <p className="text-sm font-bold text-red-400">An error occurred while loading this stage.</p>
          <p className="text-xs text-slate-400 font-mono">{this.state.error?.message || 'Unknown error'}</p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onRetry) this.props.onRetry();
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-none"
          >
            Retry Stage
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const soundController = useSoundEffects();
  const {
    isAudioMuted,
    setIsAudioMuted
  } = soundController;

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [vocabFilter, setVocabFilter] = useState('ALL');
  const [hubMode, setHubMode] = useState('practice');
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false);

  const handleSelectSubject = (subj, filter = 'ALL') => {
    if (subj === 'learning') {
      setHubMode('learning');
    } else if (subj === 'english') {
      setHubMode('practice');
    }
    setVocabFilter(filter);
    setSelectedSubject(subj);
  };

  const {
    // Levels & Loading
    levels,

    // Progression
    unlockedLevel,
    levelStars,
    gems,
    streak,
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

    // Notifications & Effects
    toastMessage,
    stageCelebration
  } = useGameState({ soundController });

  useEffect(() => {
    let backListener = null;
    const setupBackListener = async () => {
      try {
        backListener = await CapApp.addListener('backButton', ({ canGoBack }) => {
          // Priority 1: If in an active level stage (currentLevel != null):
          if (currentLevel) {
            handleBackToMap();
            return;
          }
          // Priority 2: If inside a subject (selectedSubject != null):
          if (selectedSubject) {
            setSelectedSubject(null);
            return;
          }
          // Priority 3: At root Subject Hub, exit app
          CapApp.exitApp();
        });
      } catch (e) {
        console.warn('Capacitor App plugin not available in web browser mode', e);
      }
    };

    setupBackListener();

    return () => {
      if (backListener && backListener.remove) {
        backListener.remove();
      }
    };
  }, [currentLevel, selectedSubject, handleBackToMap]);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center selection:bg-indigo-500 selection:text-white font-sans antialiased">
      <div className="max-w-md mx-auto w-full min-h-screen flex flex-col relative">
        {currentLevel && (
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
        )}

        <main className={`flex-1 flex flex-col justify-start max-w-md w-full mx-auto ${currentLevel ? 'py-3 px-3 sm:px-4 pb-8' : selectedSubject === 'learning' ? 'pt-0 px-0 pb-8' : 'px-3 pb-8'}`}>
          {!currentLevel ? (
            <>
              {!selectedSubject && (
                <SubjectHubView
                  levels={levels}
                  unlockedLevel={unlockedLevel}
                  levelStars={levelStars}
                  gems={gems}
                  streak={streak}
                  lives={lives}
                  isAudioMuted={isAudioMuted}
                  setIsAudioMuted={setIsAudioMuted}
                  activeMode={hubMode}
                  onModeChange={setHubMode}
                  onSelectSubject={handleSelectSubject}
                  onStartLevel={(lvl) => handleStartLevel(lvl || 1, true)}
                  onOpenAudioSettings={() => setIsAudioSettingsOpen(true)}
                />
              )}
              {selectedSubject === 'english' && (
                <SagaLevelPath
                  levels={levels}
                  unlockedLevel={unlockedLevel}
                  levelStars={levelStars}
                  gems={gems}
                  streak={streak}
                  lives={lives}
                  isAudioMuted={isAudioMuted}
                  setIsAudioMuted={setIsAudioMuted}
                  onSelectLevel={(lvl) => handleStartLevel(lvl, true)}
                  onBackToHub={() => {
                    setSelectedSubject(null);
                    setHubMode('practice');
                  }}
                  onOpenAudioSettings={() => setIsAudioSettingsOpen(true)}
                />
              )}
              {selectedSubject === 'learning' && (
                <VocabBookView
                  levels={levels}
                  levelStars={levelStars}
                  initialFilter={vocabFilter}
                  onBackToHub={() => {
                    setSelectedSubject(null);
                    setHubMode('learning');
                  }}
                  onOpenAudioSettings={() => setIsAudioSettingsOpen(true)}
                />
              )}
            </>
          ) : (
            <div className="w-full flex flex-col space-y-3 sm:space-y-4 animate-pop">
              <StageErrorBoundary key={`eb_${stageIndex}`} onRetry={handleRetryLevel}>
                {currentStage ? (
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
                    {!Object.values(STAGE_TYPES).includes(currentStage.type) && (
                      <FlashcardStage key={`stage_fb_${stageIndex}_${currentStage.item?.id || ''}`} stage={currentStage} onSubmitAnswer={handleAnswerSubmit} isSecondChance={stageAttempts === 1} />
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[320px] text-center p-8 bg-slate-900/60 border border-slate-800 rounded-none space-y-4">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent animate-spin rounded-none" />
                    <div className="flex flex-col items-center space-y-1">
                      <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300">
                        Preparing Stage {stageIndex + 1}...
                      </p>
                      <p className="text-[11px] text-slate-500 font-sans">
                        Compiling stage items and interactive challenges
                      </p>
                    </div>
                    <button
                      onClick={handleBackToMap}
                      className="mt-2 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer rounded-none"
                    >
                      Return to Map
                    </button>
                  </div>
                )}
              </StageErrorBoundary>
            </div>
          )}
        </main>

        {/* Audio Pack & Storage Settings Modal */}
        <AudioPackSettingsModal
          isOpen={isAudioSettingsOpen}
          onClose={() => setIsAudioSettingsOpen(false)}
        />

        {/* First-Attempt Perfect Stage Micro-Celebration Overlay */}
        {stageCelebration && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center animate-pop px-4 select-none">
            <div className="bg-slate-900/95 border border-amber-400/60 shadow-[0_0_35px_rgba(251,191,36,0.5)] rounded-none px-6 py-4 flex flex-col items-center space-y-1.5 text-center transform scale-105 sm:scale-110">
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
          <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 px-5 py-3 rounded-none shadow-2xl text-xs sm:text-sm font-black z-50 animate-pop text-white border ${
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
            totalStages={completionResult.totalStages || completionResult.totalPossible || 10}
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
