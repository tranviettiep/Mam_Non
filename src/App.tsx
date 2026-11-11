import React, { useState } from 'react';
import { ActiveScreen, LessonConfig } from './types/lesson';
import { loadInitialLesson, saveLessonToStorage } from './data/lessons';
import { audioManager } from './utils/audio';
import { exportStandaloneGameHtml } from './utils/exportHtml';
import { SecretCallScreen } from './components/SecretCallScreen';
import { HubScreen } from './components/HubScreen';
import { Stage1Runner } from './components/Stage1Runner';
import { Stage2HeadTilt } from './components/Stage2HeadTilt';
import { Stage3Tracing } from './components/Stage3Tracing';
import { LessonEditorModal } from './components/LessonEditorModal';

export const App: React.FC = () => {
  const [lesson, setLesson] = useState<LessonConfig>(() => loadInitialLesson());
  const [screen, setScreen] = useState<ActiveScreen>('call');
  const [muted, setMuted] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  const handleToggleMute = () => {
    const next = !muted;
    audioManager.muted = next;
    if (next) {
      audioManager.stopRingtone();
      audioManager.stopSpeaking();
    }
    setMuted(next);
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
    };
    handleSaveLesson(merged);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden select-none">
      {screen === 'call' && (
        <SecretCallScreen lesson={lesson} onFinishCall={() => setScreen('hub')} />
      )}

      {screen === 'hub' && (
        <HubScreen
          lesson={lesson}
          muted={muted}
          onToggleMute={handleToggleMute}
          onNavigate={setScreen}
          onSelectPreset={handleSelectPreset}
          onOpenEditor={() => setEditorOpen(true)}
          onExportHtml={() => exportStandaloneGameHtml(lesson)}
        />
      )}

      {screen === 'stage1' && (
        <Stage1Runner
          lesson={lesson}
          onBackHub={() => setScreen('hub')}
          onNextStage={() => setScreen('stage2')}
        />
      )}

      {screen === 'stage2' && (
        <Stage2HeadTilt
          lesson={lesson}
          onBackHub={() => setScreen('hub')}
          onNextStage={() => setScreen('stage3')}
          onOpenEditor={() => setEditorOpen(true)}
          onExportHtml={() => exportStandaloneGameHtml(lesson)}
        />
      )}

      {screen === 'stage3' && (
        <Stage3Tracing lesson={lesson} onBackHub={() => setScreen('hub')} />
      )}

      <LessonEditorModal
        open={editorOpen}
        lesson={lesson}
        onClose={() => setEditorOpen(false)}
        onSave={handleSaveLesson}
        onExportHtml={(updated) => exportStandaloneGameHtml(updated)}
      />
    </div>
  );
};

export default App;
