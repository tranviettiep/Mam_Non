import React, { useEffect, useState } from 'react';
import { ActiveScreen, EditorTab, LessonConfig, VoiceSettings } from './types/lesson';
import {
  loadInitialLesson,
  saveLessonToStorage,
  syncGreetingWithClassInfo,
} from './data/lessons';
import { audioManager } from './utils/audio';
import { exportStandaloneGameHtml } from './utils/exportHtml';
import { PwaInstallState, pwaManager } from './utils/pwa';
import { SecretCallScreen } from './components/SecretCallScreen';
import { HubScreen } from './components/HubScreen';
import { Stage1Runner } from './components/Stage1Runner';
import { Stage2HeadTilt } from './components/Stage2HeadTilt';
import { Stage3Tracing } from './components/Stage3Tracing';
import { Stage4AppleHarvest } from './components/Stage4AppleHarvest';
import { Stage5MagicBook } from './components/Stage5MagicBook';
import { Stage6QuizizzGame } from './components/Stage6QuizizzGame';
import { Stage7WordwallSort } from './components/Stage7WordwallSort';
import { Stage8MemoryWrite } from './components/Stage8MemoryWrite';
import { LessonEditorModal } from './components/LessonEditorModal';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { InstallAppModal } from './components/InstallAppModal';

export const App: React.FC = () => {
  const [lesson, setLesson] = useState<LessonConfig>(() => loadInitialLesson());
  const [screen, setScreen] = useState<ActiveScreen>('call');
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() =>
    audioManager.getSettings()
  );
  const [pwaState, setPwaState] = useState<PwaInstallState>(() => pwaManager.getState());
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorInitialTab, setEditorInitialTab] = useState<EditorTab>('general');
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);

  const openEditorOnTab = (tab: EditorTab) => {
    setEditorInitialTab(tab);
    setEditorOpen(true);
  };

  useEffect(() => {
    const unsubAudio = audioManager.subscribe((next) => {
      setVoiceSettings(next);
    });
    const unsubPwa = pwaManager.subscribe((next) => {
      setPwaState(next);
    });
    return () => {
      unsubAudio();
      unsubPwa();
    };
  }, []);

  const handleToggleMute = () => {
    audioManager.updateSettings({ muted: !voiceSettings.muted });
  };

  const handleSaveLesson = (updated: LessonConfig) => {
    setLesson(updated);
    saveLessonToStorage(updated);
  };

  const handleSelectPreset = (preset: LessonConfig) => {
    const merged: LessonConfig = {
      ...structuredClone(preset),
      schoolName: lesson.schoolName,
      className: lesson.className,
      teacherNames: lesson.teacherNames,
      tracingOverrides: lesson.tracingOverrides,
      secretCallGreeting: syncGreetingWithClassInfo(
        preset.secretCallGreeting,
        lesson.teacherNames,
        lesson.className
      ),
    };
    handleSaveLesson(merged);
  };

  const handleRequestInstallApp = async () => {
    audioManager.playClick();
    if (pwaState.canNativePrompt && !pwaState.isStandalone) {
      const outcome = await pwaManager.triggerNativeInstall();
      if (outcome === 'unavailable') {
        setInstallModalOpen(true);
      }
      return;
    }
    setInstallModalOpen(true);
  };

  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      {screen === 'call' && (
        <SecretCallScreen
          lesson={lesson}
          pwaState={pwaState}
          onFinishCall={() => setScreen('hub')}
          onOpenVoiceSettings={() => setVoiceModalOpen(true)}
          onInstallApp={handleRequestInstallApp}
        />
      )}

      {screen === 'hub' && (
        <HubScreen
          lesson={lesson}
          muted={voiceSettings.muted}
          pwaState={pwaState}
          onToggleMute={handleToggleMute}
          onNavigate={setScreen}
          onSelectPreset={handleSelectPreset}
          onOpenEditor={() => openEditorOnTab('general')}
          onOpenVoiceSettings={() => setVoiceModalOpen(true)}
          onExportHtml={() => exportStandaloneGameHtml(lesson)}
          onInstallApp={handleRequestInstallApp}
        />
      )}

      {screen === 'stage1' && (
        <Stage1Runner
          lesson={lesson}
          onBackHub={() => setScreen('hub')}
          onNextStage={() => setScreen('stage2')}
          onOpenVoiceSettings={() => setVoiceModalOpen(true)}
        />
      )}

      {screen === 'stage2' && (
        <Stage2HeadTilt
          lesson={lesson}
          onBackHub={() => setScreen('hub')}
          onNextStage={() => setScreen('stage3')}
          onOpenEditor={() => openEditorOnTab('questions')}
          onOpenVoiceSettings={() => setVoiceModalOpen(true)}
          onExportHtml={() => exportStandaloneGameHtml(lesson)}
        />
      )}

      {screen === 'stage3' && (
        <Stage3Tracing
          lesson={lesson}
          onBackHub={() => setScreen('hub')}
          onNextStage={() => setScreen('stage4')}
          onOpenEditor={() => openEditorOnTab('tracing')}
          onOpenVoiceSettings={() => setVoiceModalOpen(true)}
        />
      )}

      {screen === 'stage4' && (
        <Stage4AppleHarvest
          lesson={lesson}
          onBackHub={() => setScreen('hub')}
          onNextStage={() => setScreen('stage5')}
          onOpenVoiceSettings={() => setVoiceModalOpen(true)}
        />
      )}

      {screen === 'stage5' && (
        <Stage5MagicBook
          lesson={lesson}
          onBackHub={() => setScreen('hub')}
          onNextStage={() => setScreen('stage6')}
          onOpenVoiceSettings={() => setVoiceModalOpen(true)}
        />
      )}

      {screen === 'stage6' && (
        <Stage6QuizizzGame
          lesson={lesson}
          onBackHub={() => setScreen('hub')}
          onNextStage={() => setScreen('stage7')}
          onOpenVoiceSettings={() => setVoiceModalOpen(true)}
        />
      )}

      {screen === 'stage7' && (
        <Stage7WordwallSort
          lesson={lesson}
          onBackHub={() => setScreen('hub')}
          onNextStage={() => setScreen('stage8')}
          onOpenVoiceSettings={() => setVoiceModalOpen(true)}
        />
      )}

      {screen === 'stage8' && (
        <Stage8MemoryWrite
          lesson={lesson}
          onBackHub={() => setScreen('hub')}
          onOpenVoiceSettings={() => setVoiceModalOpen(true)}
        />
      )}

      <LessonEditorModal
        open={editorOpen}
        lesson={lesson}
        initialTab={editorInitialTab}
        onClose={() => setEditorOpen(false)}
        onSave={handleSaveLesson}
        onExportHtml={(updated) => exportStandaloneGameHtml(updated)}
      />

      <VoiceSettingsModal
        open={voiceModalOpen}
        settings={voiceSettings}
        onChangeSettings={(patch) => audioManager.updateSettings(patch)}
        onResetSettings={() => audioManager.resetSettings()}
        onClose={() => setVoiceModalOpen(false)}
      />

      <InstallAppModal
        open={installModalOpen}
        pwaState={pwaState}
        lesson={lesson}
        onClose={() => setInstallModalOpen(false)}
      />
    </div>
  );
};

export default App;
