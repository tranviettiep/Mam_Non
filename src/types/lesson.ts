export interface Point2D {
  x: number;
  y: number;
}

export interface StrokeDef {
  instruction: string;
  svgPath: string;
  waypoints: Point2D[];
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
}

export type ActiveScreen = 'call' | 'hub' | 'stage1' | 'stage2' | 'stage3';
