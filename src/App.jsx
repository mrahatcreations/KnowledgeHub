import React, { useState, useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import MobileHUD from './components/MobileHUD';
import SagaLevelPath from './components/SagaLevelPath';
import SubjectHubView from './components/views/SubjectHubView';
import VocabBookView from './components/views/VocabBookView';
import DuHomeView from './components/views/DuHomeView';
import DuYearListView from './components/views/DuYearListView';
import DuQuestionBankView from './components/views/DuQuestionBankView';
import DuLevelMap from './components/views/DuLevelMap';
import DuGamePlayer from './components/views/DuGamePlayer';
import MyMistakesView from './components/views/MyMistakesView';
import { getDuGameLevels } from './utils/duDataHelper';

import FlashcardStage from './components/stages/FlashcardStage';
import MatchingStage from './components/stages/MatchingStage';
import DragDropStage from './components/stages/DragDropStage';
import TrueFalseSwipeStage from './components/stages/TrueFalseSwipeStage';
import OddOneOutStage from './components/stages/OddOneOutStage';

import AnswerRevealModal from './components/modals/AnswerRevealModal';
import CompletionModal from './components/modals/CompletionModal';
import AudioPackSettingsModal from './components/modals/AudioPackSettingsModal';
import UpdateModal from './components/modals/UpdateModal';
import { updateManager } from './utils/updateManager';

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
  const [duConfig, setDuConfig] = useState({ subject: 'ALL', mode: 'mcq', year: 'ALL' });
  const [duGameSubject, setDuGameSubject] = useState('বাংলা');
  const [duActiveLevel, setDuActiveLevel] = useState(null);
  const [hubMode, setHubMode] = useState('practice');
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [hasUpdateBadge, setHasUpdateBadge] = useState(false);

  // Background In-App Update Check on Startup (silent check after 2.5s)
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const info = await updateManager.checkForUpdates({ force: false });
        if (info?.hasUpdate) {
          setUpdateInfo(info);
          setHasUpdateBadge(true);
          if (!info.isDismissed) {
            setIsUpdateModalOpen(true);
          }
        }
      } catch (err) {
        // Silent background fallback
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleSelectSubject = (subj, filter = 'ALL', extra = {}) => {
    if (subj === 'learning') {
      setHubMode('learning');
      setVocabFilter(filter);
      setSelectedSubject(subj);
    } else if (subj === 'english') {
      setHubMode('practice');
      setVocabFilter(filter);
      setSelectedSubject(subj);
    } else if (subj === 'du_home') {
      setSelectedSubject('du_home');
    } else if (subj === 'du_years') {
      setDuConfig(prev => ({
        ...prev,
        mode: filter || extra?.mode || 'mcq'
      }));
      setSelectedSubject('du_years');
    } else if (subj === 'du_bank') {
      setDuConfig(prev => ({
        ...prev,
        year: filter || 'ALL',
        mode: extra?.mode || prev.mode || 'mcq',
        subject: extra?.subject || 'ALL'
      }));
      setSelectedSubject('du_bank');
    } else if (subj === 'du_game_map') {
      setDuGameSubject(filter || 'বাংলা');
      setSelectedSubject('du_game_map');
    } else if (subj === 'du_game_play') {
      setDuGameSubject(filter || 'বাংলা');
      setDuActiveLevel(extra?.level);
      setSelectedSubject('du_game_play');
    } else if (subj === 'my_mistakes') {
      setSelectedSubject('my_mistakes');
    }
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
          // Priority 0: Close open modals first
          if (isUpdateModalOpen) {
            setIsUpdateModalOpen(false);
            return;
          }
          if (isAudioSettingsOpen) {
            setIsAudioSettingsOpen(false);
            return;
          }

          // Priority 1: If in an active English saga level stage:
          if (currentLevel) {
            handleBackToMap();
            return;
          }
          // Priority 2: If in active DU Game Player -> back to DU Level Map:
          if (selectedSubject === 'du_game_play') {
            setSelectedSubject('du_game_map');
            return;
          }
          // Priority 3: If in DU Level Map -> back to Hub (Practice):
          if (selectedSubject === 'du_game_map') {
            setSelectedSubject(null);
            setHubMode('practice');
            return;
          }
          // Priority 4: If inside DU Question Bank, return to DU Year list:
          if (selectedSubject === 'du_bank') {
            setSelectedSubject('du_years');
            return;
          }
          // Priority 5: If inside DU Year list, return to DU Home:
          if (selectedSubject === 'du_years') {
            setSelectedSubject('du_home');
            return;
          }
          // Priority 6: If inside DU Home or any subject (selectedSubject != null), return to Hub:
          if (selectedSubject) {
            setSelectedSubject(null);
            return;
          }
          // Priority 7: At root Subject Hub, exit app
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

        <main className={`flex-1 flex flex-col justify-start max-w-md w-full mx-auto ${currentLevel ? 'py-3 px-3 sm:px-4 pb-8' : (selectedSubject === 'learning' || selectedSubject === 'du_bank' || selectedSubject === 'du_years' || selectedSubject === 'du_home' || selectedSubject === 'du_game_map' || selectedSubject === 'du_game_play') ? 'pt-0 px-0 pb-8' : 'px-3 pb-8'}`}>
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
                  onOpenUpdateModal={() => setIsUpdateModalOpen(true)}
                  hasUpdateBadge={hasUpdateBadge}
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
                  onOpenMistakes={() => handleSelectSubject('my_mistakes')}
                />
              )}
              {selectedSubject === 'du_home' && (
                <DuHomeView
                  onSelectCategory={(categoryKey) => handleSelectSubject('du_years', categoryKey)}
                  onBack={() => {
                    setSelectedSubject(null);
                  }}
                  isAudioMuted={isAudioMuted}
                  setIsAudioMuted={setIsAudioMuted}
                />
              )}
              {selectedSubject === 'du_years' && (
                <DuYearListView
                  mode={duConfig.mode}
                  onSelectYear={(year, mode) => handleSelectSubject('du_bank', year, { mode })}
                  onBack={() => {
                    setSelectedSubject('du_home');
                  }}
                  isAudioMuted={isAudioMuted}
                  setIsAudioMuted={setIsAudioMuted}
                />
              )}
              {selectedSubject === 'du_bank' && (
                <DuQuestionBankView
                  initialSubject={duConfig.subject}
                  initialMode={duConfig.mode}
                  initialYear={duConfig.year}
                  onBackToHub={() => {
                    setSelectedSubject('du_years');
                  }}
                  isAudioMuted={isAudioMuted}
                  setIsAudioMuted={setIsAudioMuted}
                />
              )}
              {selectedSubject === 'du_game_map' && (
                <DuLevelMap
                  subject={duGameSubject}
                  onSelectLevel={(lvl) => handleSelectSubject('du_game_play', duGameSubject, { level: lvl })}
                  onBack={() => {
                    setSelectedSubject(null);
                    setHubMode('practice');
                  }}
                  isAudioMuted={isAudioMuted}
                  setIsAudioMuted={setIsAudioMuted}
                />
              )}
              {selectedSubject === 'du_game_play' && duActiveLevel && (
                <DuGamePlayer
                  level={duActiveLevel}
                  subject={duGameSubject}
                  onBackToMap={() => setSelectedSubject('du_game_map')}
                  onNextLevel={() => {
                    const nextId = duActiveLevel.levelId + 1;
                    const allLevels = getDuGameLevels(duGameSubject);
                    const nextLvl = allLevels.find(l => l.levelId === nextId);
                    if (nextLvl) {
                      setDuActiveLevel(nextLvl);
                    } else {
                      setSelectedSubject('du_game_map');
                    }
                  }}
                  isAudioMuted={isAudioMuted}
                  setIsAudioMuted={setIsAudioMuted}
                />
              )}
              {selectedSubject === 'my_mistakes' && (
                <MyMistakesView
                  onBack={() => {
                    setSelectedSubject(null);
                    setHubMode('learning');
                  }}
                  isAudioMuted={isAudioMuted}
                  setIsAudioMuted={setIsAudioMuted}
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

        {/* In-App Update Modal */}
        <UpdateModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          initialUpdateInfo={updateInfo}
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
            isMastered={completionResult.isMastered}
            isPassed={completionResult.isPassed}
            mistakes={completionResult.mistakes || mistakes}
            onNextLevel={handleNextLevel}
            onRetryLevel={handleRetryLevel}
            onBackToMap={handleBackToMap}
          />
        )}
      </div>
    </div>
  );
}
