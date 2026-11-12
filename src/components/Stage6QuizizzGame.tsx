import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Flame,
  RotateCcw,
  Sliders,
  Sparkles,
  Star,
  Trophy,
  Volume2,
} from 'lucide-react';
import { LessonConfig } from '../types/lesson';
import { buildQuizizzQuestionsForLesson } from '../data/letterGamesData';
import { audioManager } from '../utils/audio';
import { ConfettiOverlay } from './ConfettiOverlay';
import { VocabIllustration } from './VocabIllustration';

interface Stage6QuizizzGameProps {
  lesson: LessonConfig;
  onBackHub: () => void;
  onNextStage: () => void;
  onOpenVoiceSettings: () => void;
}

const CARD_STYLES = [
  {
    bg: 'bg-blue-600 hover:bg-blue-500',
    border: 'border-blue-800',
    shadow: 'shadow-[0_7px_0_#1E3A8A]',
    badgeBg: 'bg-blue-800/60',
    shape: 'triangle' as const,
  },
  {
    bg: 'bg-teal-600 hover:bg-teal-500',
    border: 'border-teal-800',
    shadow: 'shadow-[0_7px_0_#115E59]',
    badgeBg: 'bg-teal-800/60',
    shape: 'diamond' as const,
  },
  {
    bg: 'bg-amber-500 hover:bg-amber-400',
    border: 'border-amber-700',
    shadow: 'shadow-[0_7px_0_#B45309]',
    badgeBg: 'bg-amber-700/60',
    shape: 'circle' as const,
  },
  {
    bg: 'bg-pink-600 hover:bg-pink-500',
    border: 'border-pink-800',
    shadow: 'shadow-[0_7px_0_#9D174D]',
    badgeBg: 'bg-pink-800/60',
    shape: 'star' as const,
  },
];

const ShapeBadgeSvg: React.FC<{ shape: 'triangle' | 'diamond' | 'circle' | 'star' }> = ({
  shape,
}) => {
  return (
    <svg viewBox="0 0 32 32" className="h-5 w-5 sm:h-6 sm:w-6 fill-white" aria-hidden="true">
      {shape === 'triangle' && <polygon points="16,4 29,27 3,27" />}
      {shape === 'diamond' && <polygon points="16,3 29,16 16,29 3,16" />}
      {shape === 'circle' && <circle cx="16" cy="16" r="12" />}
      {shape === 'star' && (
        <polygon points="16,3 20,11 29,12 22,19 24,28 16,23 8,28 10,19 3,12 12,11" />
      )}
    </svg>
  );
};

export const Stage6QuizizzGame: React.FC<Stage6QuizizzGameProps> = ({
  lesson,
  onBackHub,
  onNextStage,
  onOpenVoiceSettings,
}) => {
  const questions = useMemo(() => buildQuizizzQuestionsForLesson(lesson), [lesson]);
  const [qIdx, setQIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrongIndices, setWrongIndices] = useState<number[]>([]);
  const [celebrateCorrect, setCelebrateCorrect] = useState(false);
  const [gentleHint, setGentleHint] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const advanceTimerRef = useRef<number | null>(null);
  const currentQ = questions[qIdx] ?? questions[0];

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearAdvanceTimer();
      audioManager.stopSpeaking();
    };
  }, [clearAdvanceTimer]);

  useEffect(() => {
    if (finished || !currentQ) return;
    const t = window.setTimeout(() => {
      audioManager.speakVi(currentQ.prompt);
    }, 220);
    return () => window.clearTimeout(t);
  }, [qIdx, finished, currentQ]);

  const handleSelectOption = useCallback(
    (optIdx: number) => {
      if (finished || celebrateCorrect || !currentQ) return;
      if (wrongIndices.includes(optIdx)) return;

      if (optIdx === currentQ.correctIndex) {
        const firstTry = wrongIndices.length === 0;
        setStars((prev) => prev + (firstTry ? 2 : 1));
        setStreak((prev) => (firstTry ? prev + 1 : 1));
        setGentleHint(null);
        setCelebrateCorrect(true);
        audioManager.playCorrect();
        audioManager.speakVi('Chính xác! Bé giỏi quá!', undefined, undefined, 'character');

        clearAdvanceTimer();
        advanceTimerRef.current = window.setTimeout(() => {
          setCelebrateCorrect(false);
          setWrongIndices([]);
          if (qIdx + 1 < questions.length) {
            setQIdx((prev) => prev + 1);
          } else {
            setFinished(true);
            audioManager.playCelebration();
            audioManager.speakVi(
              'Tuyệt vời! Cả lớp đã giải mã xuất sắc tất cả câu hỏi!',
              undefined,
              undefined,
              'character'
            );
          }
        }, 1250);
      } else {
        setWrongIndices((prev) => [...prev, optIdx]);
        setStreak(0);
        setGentleHint('Chưa đúng rồi, nhóm mình thảo luận và chọn ô màu khác nhé!');
        audioManager.playRetry();
        audioManager.speakVi('Chưa đúng, bé chọn lại nhé!');
      }
    },
    [finished, celebrateCorrect, currentQ, wrongIndices, clearAdvanceTimer, qIdx, questions.length]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') handleSelectOption(0);
      if (e.key === '2') handleSelectOption(1);
      if (e.key === '3') handleSelectOption(2);
      if (e.key === '4') handleSelectOption(3);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSelectOption]);

  const handleRestart = () => {
    clearAdvanceTimer();
    audioManager.playClick();
    setQIdx(0);
    setStars(0);
    setStreak(0);
    setWrongIndices([]);
    setCelebrateCorrect(false);
    setGentleHint(null);
    setFinished(false);
  };

  return (
    <div className="safe-pad relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 px-3 py-2.5 sm:px-6 sm:py-4 text-white select-none">
      <ConfettiOverlay active={finished} />

      {/* Top Quizizz-style Arena Header */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            clearAdvanceTimer();
            audioManager.playClick();
            audioManager.stopSpeaking();
            onBackHub();
          }}
          className="flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-2xl border-3 border-indigo-300/40 bg-white/95 px-3.5 py-1.5 font-heading text-sm sm:text-base font-extrabold text-indigo-950 shadow-[0_4px_0_rgba(15,23,42,0.4)] hover:bg-white active:translate-y-0.5"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Sảnh chính</span>
        </button>

        <div className="flex items-center gap-2 rounded-full border-3 border-amber-400 bg-indigo-950/90 px-4 py-1 sm:px-6 sm:py-1.5 shadow-md">
          <Award className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
          <h1 className="font-heading text-base sm:text-xl md:text-2xl font-extrabold text-amber-300">
            Chặng 6: Giải Mã Chữ Cái
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Streak Badge */}
          {streak >= 2 && (
            <div className="flex items-center gap-1 rounded-full border-2 border-orange-300 bg-orange-500 px-3 py-1 font-heading text-xs sm:text-sm font-extrabold text-white shadow-sm">
              <Flame className="h-4 w-4 fill-amber-200 text-amber-100" />
              <span>Combo x{streak}</span>
            </div>
          )}

          {/* Stars Counter */}
          <div className="flex items-center gap-1.5 rounded-2xl border-3 border-amber-400 bg-amber-50 px-3.5 py-1.5 font-heading text-sm sm:text-lg font-extrabold text-amber-900">
            <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
            <span>{stars}</span>
          </div>

          <button
            type="button"
            onClick={onOpenVoiceSettings}
            aria-label="Cài đặt giọng nói"
            className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-2xl border-3 border-pink-300 bg-pink-500 text-white shadow-[0_4px_0_#9D174D] hover:bg-pink-400"
          >
            <Sliders className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="relative z-20 mx-auto mt-2 w-full max-w-5xl">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-indigo-200 mb-1">
          <span>
            Câu hỏi {Math.min(qIdx + 1, questions.length)} / {questions.length}
          </span>
          <span>Chạm vào 1 trong 4 ô màu hoặc bấm phím 1 – 4</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-indigo-950/80 p-0.5 border border-indigo-500/40">
          <div
            style={{
              width: `${((finished ? questions.length : qIdx + 1) / questions.length) * 100}%`,
            }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-pink-400 transition-all duration-300"
          />
        </div>
      </div>

      {/* Main Quizizz Arena */}
      {!finished && currentQ ? (
        <main className="relative z-10 mx-auto my-2 flex w-full max-w-6xl flex-1 min-h-0 flex-col justify-between gap-3">
          {/* Question Board */}
          <div className="relative flex flex-col items-center justify-center rounded-[28px] border-4 border-indigo-300 bg-white px-4 py-3.5 sm:px-8 sm:py-5 text-center text-slate-900 shadow-[0_8px_0_rgba(30,27,75,0.5)]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  audioManager.playClick();
                  audioManager.speakVi(currentQ.prompt);
                }}
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl border-2 border-indigo-700 bg-indigo-600 text-white shadow-xs hover:bg-indigo-500"
                aria-label="Đọc lại câu hỏi"
              >
                <Volume2 className="h-6 w-6" />
              </button>
              <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-indigo-950">
                {currentQ.prompt}
              </h2>
            </div>

            {/* Optional Picture + Masked Word Hint */}
            {currentQ.illustration && currentQ.wordHint && (
              <div className="mt-2.5 flex items-center justify-center gap-4 rounded-2xl border-3 border-amber-300 bg-amber-50 px-5 py-2">
                <div className="h-14 w-14 sm:h-18 sm:w-18">
                  <VocabIllustration id={currentQ.illustration} />
                </div>
                <span className="font-letter text-2xl sm:text-4xl font-extrabold tracking-wider text-blue-900">
                  {currentQ.wordHint}
                </span>
              </div>
            )}

            {gentleHint && (
              <p className="mt-2 rounded-xl bg-amber-100 px-4 py-1 text-xs sm:text-sm font-extrabold text-amber-900">
                {gentleHint}
              </p>
            )}
          </div>

          {/* 4 Colorful Quizizz Answer Blocks */}
          <div className="relative grid flex-1 min-h-0 grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {currentQ.options.map((opt, idx) => {
              const style = CARD_STYLES[idx];
              const isEliminated = wrongIndices.includes(idx);
              const isSingleChar = Array.from(opt.trim()).length <= 2;

              return (
                <button
                  key={`${currentQ.id}-${idx}`}
                  type="button"
                  disabled={isEliminated || celebrateCorrect}
                  onClick={() => handleSelectOption(idx)}
                  className={`relative flex min-h-[110px] cursor-pointer flex-col items-center justify-center rounded-[28px] border-4 p-4 transition duration-150 ${
                    isEliminated
                      ? 'border-slate-600 bg-slate-700/60 text-slate-400 opacity-50 scale-95'
                      : `${style.bg} ${style.border} ${style.shadow} text-white active:translate-y-1`
                  }`}
                >
                  {/* Top-Left Geometric Quizizz Shape + Number */}
                  <div
                    className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-xl px-2.5 py-1 ${style.badgeBg}`}
                  >
                    <ShapeBadgeSvg shape={style.shape} />
                    <span className="font-heading text-xs sm:text-sm font-extrabold">{idx + 1}</span>
                  </div>

                  <span
                    className={`font-letter mt-3 text-center font-extrabold drop-shadow-[0_3px_0_rgba(0,0,0,0.22)] ${
                      isSingleChar
                        ? 'text-5xl sm:text-6xl md:text-7xl'
                        : 'text-2xl sm:text-3xl md:text-4xl'
                    }`}
                  >
                    {opt}
                  </span>
                </button>
              );
            })}

            {/* Quizizz Full Green Celebration Banner when Correct (Matches 1:20 in video!) */}
            {celebrateCorrect && (
              <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rounded-[28px] border-4 border-emerald-200 bg-emerald-500/96 shadow-2xl">
                <div className="flex flex-col items-center text-center px-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-10 w-10 text-amber-200" />
                    <span className="font-heading text-4xl sm:text-6xl font-extrabold uppercase tracking-wide text-white drop-shadow-[0_4px_0_#065F46]">
                      YEAH! CHÍNH XÁC!
                    </span>
                    <Sparkles className="h-10 w-10 text-amber-200" />
                  </div>
                  <p className="mt-2 font-heading text-lg sm:text-2xl font-bold text-emerald-50">
                    Đáp án đúng:{' '}
                    <strong className="font-letter rounded-2xl bg-white px-4 py-0.5 text-emerald-700">
                      {currentQ.options[currentQ.correctIndex]}
                    </strong>
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      ) : (
        /* Final Victory Screen */
        <main className="relative z-10 mx-auto flex flex-1 items-center justify-center p-3">
          <div className="flex max-w-lg flex-col items-center rounded-[32px] border-4 border-amber-400 bg-white px-7 py-6 sm:px-10 sm:py-8 text-center text-slate-900 shadow-[0_12px_0_rgba(0,0,0,0.3)]">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-amber-300 bg-amber-400 text-amber-950 shadow-md">
              <Trophy className="h-11 w-11" />
            </div>
            <h2 className="font-heading mt-3 text-3xl sm:text-4xl font-extrabold text-indigo-950">
              Nhà Vô Địch Giải Mã!
            </h2>
            <p className="mt-1.5 text-base sm:text-lg font-bold text-slate-700">
              Các nhóm đã hoàn thành {questions.length} thử thách và giành được{' '}
              <strong className="text-amber-600">{stars} ngôi sao vàng</strong>!
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="flex min-h-[54px] cursor-pointer items-center gap-2 rounded-2xl border-3 border-indigo-700 bg-indigo-600 px-5 py-2.5 font-heading text-base sm:text-lg font-extrabold text-white shadow-[0_4px_0_#312E81] hover:bg-indigo-500"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Chơi lại</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  audioManager.playClick();
                  audioManager.stopSpeaking();
                  onNextStage();
                }}
                className="flex min-h-[54px] cursor-pointer items-center gap-2 rounded-2xl border-3 border-emerald-700 bg-emerald-500 px-6 py-2.5 font-heading text-base sm:text-xl font-extrabold text-white shadow-[0_4px_0_#047857] hover:bg-emerald-400"
              >
                <span>Sang Chặng 7</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </main>
      )}

      {/* Footer Quick Stage Skip */}
      <footer className="relative z-20 flex items-center justify-between text-xs sm:text-sm text-indigo-200">
        <span>Mẹo: Cô có thể chia lớp thành các nhóm cùng thảo luận chọn màu!</span>
        <button
          type="button"
          onClick={() => {
            clearAdvanceTimer();
            audioManager.playClick();
            audioManager.stopSpeaking();
            onNextStage();
          }}
          className="flex min-h-[42px] cursor-pointer items-center gap-1.5 rounded-2xl border-2 border-emerald-400 bg-emerald-600 px-4 py-1.5 font-heading text-xs sm:text-sm font-extrabold text-white hover:bg-emerald-500"
        >
          <span>Chặng 7: Phân Loại Tranh</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </footer>
    </div>
  );
};
