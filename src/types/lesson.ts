export interface Point2D {
  x: number;
  y: number;
}

export interface StrokeDef {
  instruction: string;
  svgPath: string;
  waypoints: Point2D[];
}

export interface CustomStrokeInstruction {
  instruction: string;
  customAudioUrl?: string;
}

export interface LetterStrokeDef {
  letter: string;
  upper: string;
  pronounce: string;
  strokes: StrokeDef[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  leftOption: string;
  rightOption: string;
  correctSide: 'left' | 'right';
  customAudioUrl?: string;
}

export interface LessonConfig {
  id: string;
  title: string;
  schoolName: string;
  className: string;
  teacherNames: string;
  targetLetters: string[];
  secretCallGreeting: string;
  secretCallCustomAudioUrl?: string;
  runnerLetters: string[];
  questions: QuizQuestion[];
  tracingOverrides?: Record<string, CustomStrokeInstruction[]>;
}

export type EditorTab = 'general' | 'questions' | 'tracing';

export type ActiveScreen =
  | 'call'
  | 'hub'
  | 'stage1'
  | 'stage2'
  | 'stage3'
  | 'stage4'
  | 'stage5'
  | 'stage6'
  | 'stage7'
  | 'stage8'
  | 'stage9'
  | 'stage10'
  | 'stage11';

export type VoicePreset = 'auto_role' | 'teacher_sweet' | 'cartoon_cute' | 'slow_clear';

export type VoiceRole = 'character' | 'teacher';

export interface VoiceSettings {
  preset: VoicePreset;
  rate: number; // 0.75 .. 1.25
  voiceVolume: number; // 0 .. 1
  sfxVolume: number; // 0 .. 1
  muted: boolean;
}
