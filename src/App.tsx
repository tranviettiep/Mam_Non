import React, { useEffect, useState } from 'react';
import { ActiveScreen, LessonConfig, VoiceSettings } from './types/lesson';
import {
  loadInitialLesson,
  saveLessonToStorage,
  syncGreetingWithClassInfo,
} from './data/lessons';
import { audioManager } from './utils/audio';
import { exportStandaloneGameHtml } from './utils/exportHtml';
import { SecretCallScreen } from './components/SecretCallScreen';
import { HubScreen } from './components/HubScreen';
import { Stage1Runner } from './components/Stage1Runner';
import { Stage2HeadTilt } from './components/Stage2HeadTilt';
import { Stage3Tracing } from './components/Stage3Tracing';
import { LessonEditorModal } from './components/LessonEditorModal';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';

export const App: React.FC = () => {
  const [lesson, setLesson] = useState<LessonConfig>(() => loadInitialLesson());
  const [screen, setScreen] = useState<ActiveScreen>('call');
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() =>
    audioManager.getSettings()
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  useEffect(() => {
    return audioManager.subscribe((next) => {
      setVoiceSettings(next);
    });
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
      secretCallGreeting: syncGreetingWithClassInfo(
        preset.secretCallGreeting,
        lesson.teacherNames,
        lesson.className
      ),
    };
    handleSaveLesson(merged);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden select-none">
      {screen === 'call' && (
        <SecretCallScreen
          lesson={lesson}
          onFinishCall={() => setScreen('hub')}
          onOpenVoiceSettings={() => setVoiceModalOpen(true)}
        />
      )}

      {screen === 'hub' && (
        <HubScreen
          lesson={lesson}
          muted={voiceSettings.muted}
          onToggleMute={handleToggleMute}
          onNavigate={setScreen}
          onSelectPreset={handleSelectPreset}
          onOpenEditor={() => setEditorOpen(true)}
          onOpenVoiceSettings={() => setVoiceModalOpen(true)}
          onExportHtml={() => exportStandaloneGameHtml(lesson)}
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
          onOpenEditor={() => setEditorOpen(true)}
          onOpenVoiceSettings={() => setVoiceModalOpen(true)}
          onExportHtml={() => exportStandaloneGameHtml(lesson)}
        />
      )}

      {screen === 'stage3' && (
        <Stage3Tracing
          lesson={lesson}
          onBackHub={() => setScreen('hub')}
          onOpenVoiceSettings={() => setVoiceModalOpen(true)}
        />
      )}

      <LessonEditorModal
        open={editorOpen}
        lesson={lesson}
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
    </div>
  );
};

export default App;
