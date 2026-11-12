import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Puzzle,
  RotateCcw,
  Sliders,
  Sparkles,
  Star,
  Volume2,
} from 'lucide-react';
import { LessonConfig } from '../types/lesson';
import { LETTER_STROKES } from '../data/strokes';
import {
  getGroupComparison,
  getLetterAnatomy,
  STROKE_PIECES,
  StrokePieceId,
} from '../data/letterGamesData';
import { audioManager } from '../utils/audio';
import { ConfettiOverlay } from './ConfettiOverlay';

interface Stage5MagicBookProps {
  lesson: LessonConfig;
  onBackHub: () => void;
  onNextStage: () => void;
  onOpenVoiceSettings: () => void;
}

type BookMode = 'explore' | 'puzzle';

const DISTRACTOR_PIECE_POOL: StrokePieceId[] = [
  'dau-mu',
  'dau-moc',
  'dau-trang',
  'net-ngang',
  'cong-ho-phai',
  'cong-kin',
  'so-thang-phai',
  'gach-ngang-d',
];

function buildPuzzleTray(required: StrokePieceId[]): StrokePieceId[] {
  const pool: StrokePieceId[] = [...required];
  for (const cand of DISTRACTOR_PIECE_POOL) {
    if (pool.length >= 5) break;
    if (!pool.includes(cand)) {
      pool.push(cand);
    }
  }
  const out = [...pool];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

export const Stage5MagicBook: React.FC<Stage5MagicBookProps> = ({
  lesson,
  onBackHub,
  onNextStage,
  onOpenVoiceSettings,
}) => {
  const targetLetters = useMemo(() => {
    return lesson.targetLetters.length > 0
      ? lesson.targetLetters.map((c) => c.toLocaleLowerCase('vi-VN'))
      : ['e', 'ê'];
  }, [lesson.targetLetters]);

  const [mode, setMode] = useState<BookMode>('explore');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [puzzleLetterIdx, setPuzzleLetterIdx] = useState(0);
  const [pickedPieces, setPickedPieces] = useState<StrokePieceId[]>([]);
  const [trayPieces, setTrayPieces] = useState<StrokePieceId[]>([]);
  const [wrongPiece, setWrongPiece] = useState<StrokePieceId | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [allPuzzleDone, setAllPuzzleDone] = useState(false);

  const currentExploreLetter = targetLetters[selectedIdx] ?? targetLetters[0];
  const exploreAnatomy = useMemo(
    () => getLetterAnatomy(currentExploreLetter),
    [currentExploreLetter]
  );
  const comparison = useMemo(() => getGroupComparison(targetLetters), [targetLetters]);

  const currentPuzzleLetter = targetLetters[puzzleLetterIdx] ?? targetLetters[0];
  const puzzleAnatomy = useMemo(
    () => getLetterAnatomy(currentPuzzleLetter),
    [currentPuzzleLetter]
  );
  const strokeDef = LETTER_STROKES[currentPuzzleLetter];

  const initPuzzleForLetter = useCallback((idx: number, letters: string[], announce = false) => {
    const ch = letters[idx] ?? letters[0];
    const anat = getLetterAnatomy(ch);
    setPuzzleLetterIdx(idx);
    setPickedPieces([]);
    setWrongPiece(null);
    setTrayPieces(buildPuzzleTray(anat.pieces));
    setFeedback(`Bé hãy chọn đủ ${anat.pieces.length} nét đúng để ghép thành chữ ${ch} nhé!`);
    if (announce) {
      audioManager.speakVi(`Bé hãy chọn các nét đúng để ghép thành chữ ${ch} nhé!`);
    }
  }, []);

  useEffect(() => {
    setSelectedIdx(0);
    setMode('explore');
    setAllPuzzleDone(false);
    initPuzzleForLetter(0, targetLetters, false);
    const introTimer = window.setTimeout(() => {
      audioManager.speakVi(
        `Cuốn sách kì diệu! Cô và các bé cùng khám phá cấu tạo chữ ${targetLetters.join(', ')} nhé!`
      );
    }, 250);
    return () => {
      window.clearTimeout(introTimer);
      audioManager.stopSpeaking();
    };
  }, [targetLetters, initPuzzleForLetter]);

  const handleStartPuzzle = () => {
    audioManager.playClick();
    setAllPuzzleDone(false);
    setMode('puzzle');
    initPuzzleForLetter(0, targetLetters, true);
  };

  const handlePickPiece = (pieceId: StrokePieceId) => {
    if (allPuzzleDone || pickedPieces.includes(pieceId)) return;

    const isRequired = puzzleAnatomy.pieces.includes(pieceId);
    if (!isRequired) {
      setWrongPiece(pieceId);
      audioManager.playRetry();
      setFeedback('Nét này chưa đúng rồi, bé nhìn kỹ và chọn nét khác nhé!');
      audioManager.speakVi('Chưa đúng, bé chọn lại nhé!');
      window.setTimeout(() => setWrongPiece(null), 650);
      return;
    }

    const nextPicked = [...pickedPieces, pieceId];
    setPickedPieces(nextPicked);
    setWrongPiece(null);

    if (nextPicked.length < puzzleAnatomy.pieces.length) {
      audioManager.playStrokeComplete();
      const pieceName = STROKE_PIECES[pieceId].label;
      setFeedback(`Đúng rồi: ${pieceName}! Bé chọn tiếp nét còn lại nhé!`);
      audioManager.speakVi(pieceName);
      return;
    }

    // Completed this letter!
    audioManager.playCorrect();
    setFeedback(`Tuyệt vời! Bé đã ghép hoàn chỉnh chữ ${currentPuzzleLetter}!`);

    if (puzzleLetterIdx + 1 < targetLetters.length) {
      audioManager.speakVi(`Chính xác! Bé giỏi quá!`, undefined, () => {
        window.setTimeout(() => {
          initPuzzleForLetter(puzzleLetterIdx + 1, targetLetters, true);
        }, 450);
      });
    } else {
      audioManager.playCelebration();
      setAllPuzzleDone(true);
      audioManager.speakVi(
        `Hoan hô! Bé đã giải mã xong cuốn sách kì diệu chữ ${targetLetters.join(' và ')}!`,
        undefined,
        undefined,
        'character'
      );
    }
  };

  const assembledRatio =
    puzzleAnatomy.pieces.length > 0 ? pickedPieces.length / puzzleAnatomy.pieces.length : 0;

  return (
    <div className="safe-pad relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-b from-amber-100 via-sky-50 to-emerald-100 px-3 py-2.5 sm:px-6 sm:py-4 select-none">
      <ConfettiOverlay active={allPuzzleDone} />

      {/* Top Navigation Bar */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            audioManager.playClick();
            audioManager.stopSpeaking();
            onBackHub();
          }}
          className="flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-2xl border-3 border-slate-300 bg-white px-3.5 py-2 font-heading text-sm sm:text-base font-extrabold text-slate-700 shadow-[0_4px_0_#CBD5E1] hover:bg-slate-50 active:translate-y-0.5"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Sảnh chính</span>
        </button>

        <div className="flex items-center gap-2 rounded-full border-4 border-amber-400 bg-white px-4 py-1 sm:px-6 sm:py-1.5 shadow-[0_4px_0_rgba(217,119,6,0.28)]">
          <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
          <h1 className="font-heading text-base sm:text-xl md:text-2xl font-extrabold text-amber-900">
            Chặng 5: Cuốn Sách Kì Diệu
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch Mode Tabs */}
          <div className="flex rounded-2xl border-3 border-amber-400 bg-amber-50 p-1 shadow-xs">
            <button
              type="button"
              onClick={() => {
                audioManager.playClick();
                setMode('explore');
              }}
              className={`flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1 font-heading text-xs sm:text-sm font-extrabold transition ${
                mode === 'explore'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Mở Sách</span>
            </button>
            <button
              type="button"
              onClick={handleStartPuzzle}
              className={`flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1 font-heading text-xs sm:text-sm font-extrabold transition ${
                mode === 'puzzle'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              <Puzzle className="h-4 w-4" />
              <span>Ghép Nét</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenVoiceSettings}
            aria-label="Cài đặt giọng nói"
            className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-2xl border-3 border-pink-300 bg-pink-500 text-white shadow-[0_4px_0_#BE185D] hover:bg-pink-400 active:translate-y-0.5"
          >
            <Sliders className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main 3D Claymorphism Open Book Container */}
      <main className="relative z-10 mx-auto my-2 flex w-full max-w-6xl flex-1 min-h-0 items-center justify-center">
        <div className="relative grid h-full max-h-[600px] w-full grid-cols-1 gap-3 overflow-y-auto md:grid-cols-2 md:gap-0 md:overflow-hidden rounded-[28px] sm:rounded-[36px] border-6 border-amber-700 bg-amber-600 p-2.5 sm:p-3.5 shadow-[0_12px_0_#92400E]">
          {/* Center Spine Accent on Desktop */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-3 left-1/2 z-20 hidden w-4 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 shadow-inner md:block"
          />

          {mode === 'explore' ? (
            <>
              {/* LEFT BOOK PAGE: Letter Cards & Stroke Structure */}
              <section className="flex flex-col justify-between rounded-2xl md:rounded-l-[24px] md:rounded-r-lg border-3 border-amber-200 bg-[#FFFDF7] p-3.5 sm:p-5 md:pr-6">
                <div>
                  {/* Letter Switcher Pills */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-heading text-sm sm:text-base font-extrabold text-amber-800">
                      Chọn trang chữ:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {targetLetters.map((ch, idx) => {
                        const active = idx === selectedIdx;
                        return (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => {
                              audioManager.playClick();
                              setSelectedIdx(idx);
                              audioManager.speakVi(`Chữ ${ch}`);
                            }}
                            className={`font-letter min-h-[48px] min-w-[54px] cursor-pointer rounded-2xl border-3 px-4 py-1 text-xl sm:text-2xl font-extrabold transition ${
                              active
                                ? 'border-blue-800 bg-blue-600 text-white shadow-[0_4px_0_#1E3A8A]'
                                : 'border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100'
                            }`}
                          >
                            {ch}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3 Styles of the Vietnamese Letter */}
                  <div className="mt-3 grid grid-cols-3 gap-2.5 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        audioManager.playClick();
                        audioManager.speakVi(`Chữ ${exploreAnatomy.letter} in thường`);
                      }}
                      className="flex min-h-[96px] sm:min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-3xl border-4 border-blue-400 bg-blue-50 p-2 shadow-[0_6px_0_#60A5FA] transition hover:-translate-y-0.5 active:translate-y-0.5"
                    >
                      <span className="font-letter text-5xl sm:text-6xl font-extrabold leading-tight text-blue-700">
                        {exploreAnatomy.letter}
                      </span>
                      <span className="mt-1 text-xs sm:text-sm font-bold text-blue-900">
                        In thường
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        audioManager.playClick();
                        audioManager.speakVi(`Chữ ${exploreAnatomy.letter} in hoa`);
                      }}
                      className="flex min-h-[96px] sm:min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-3xl border-4 border-pink-400 bg-pink-50 p-2 shadow-[0_6px_0_#F472B6] transition hover:-translate-y-0.5 active:translate-y-0.5"
                    >
                      <span className="font-letter text-5xl sm:text-6xl font-extrabold leading-tight text-pink-600">
                        {exploreAnatomy.upper}
                      </span>
                      <span className="mt-1 text-xs sm:text-sm font-bold text-pink-900">
                        In hoa
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        audioManager.playClick();
                        audioManager.speakVi(`Chữ ${exploreAnatomy.letter} viết thường`);
                      }}
                      className="flex min-h-[96px] sm:min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-3xl border-4 border-emerald-400 bg-emerald-50 p-2 shadow-[0_6px_0_#34D399] transition hover:-translate-y-0.5 active:translate-y-0.5"
                    >
                      <span className="font-letter italic text-5xl sm:text-6xl font-bold leading-tight text-emerald-700">
                        {exploreAnatomy.letter}
                      </span>
                      <span className="mt-1 text-xs sm:text-sm font-bold text-emerald-900">
                        Viết thường
                      </span>
                    </button>
                  </div>

                  {/* Stroke Structure Breakdown */}
                  <div className="mt-3 rounded-2xl border-3 border-indigo-200 bg-indigo-50/80 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading text-sm sm:text-base font-extrabold text-indigo-950">
                        Cấu tạo nét của chữ{' '}
                        <strong className="font-letter text-lg text-pink-600">
                          {exploreAnatomy.letter}
                        </strong>
                        :
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          audioManager.playClick();
                          audioManager.speakVi(exploreAnatomy.structureSummary);
                        }}
                        className="flex min-h-[38px] cursor-pointer items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1 text-xs sm:text-sm font-bold text-white hover:bg-indigo-500"
                      >
                        <Volume2 className="h-4 w-4" />
                        <span>Nghe cô đọc</span>
                      </button>
                    </div>
                    <p className="mt-1.5 text-sm sm:text-base font-bold text-indigo-900">
                      {exploreAnatomy.structureSummary}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {exploreAnatomy.pieces.map((pid) => {
                        const meta = STROKE_PIECES[pid];
                        return (
                          <button
                            key={pid}
                            type="button"
                            onClick={() => {
                              audioManager.playClick();
                              audioManager.speakVi(meta.label);
                            }}
                            className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-indigo-300 bg-white px-3 py-1.5 shadow-xs hover:bg-indigo-50"
                          >
                            <svg viewBox="0 0 100 100" className="h-7 w-7 text-indigo-600">
                              <path
                                d={meta.svgPath}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span className="text-xs sm:text-sm font-extrabold text-indigo-950">
                              {meta.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              {/* RIGHT BOOK PAGE: Similarity / Difference & Puzzle CTA */}
              <section className="flex flex-col justify-between rounded-2xl md:rounded-r-[24px] md:rounded-l-lg border-3 border-amber-200 bg-[#FFFDF7] p-3.5 sm:p-5 md:pl-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-lg sm:text-2xl font-extrabold text-amber-900">
                      So Sánh Chữ{' '}
                      <span className="font-letter text-pink-600">
                        {targetLetters.join(' – ')}
                      </span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        audioManager.playClick();
                        audioManager.speakVi(`${comparison.similarity} ${comparison.difference}`);
                      }}
                      className="flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-xl border-2 border-amber-500 bg-amber-400 px-3 py-1 font-heading text-xs sm:text-sm font-extrabold text-amber-950 shadow-xs hover:bg-amber-300"
                    >
                      <Volume2 className="h-4 w-4" />
                      <span>Đọc so sánh</span>
                    </button>
                  </div>

                  {/* Similarity Box */}
                  <div className="rounded-2xl border-3 border-emerald-300 bg-emerald-50 p-3 sm:p-3.5">
                    <div className="font-heading text-sm sm:text-base font-extrabold text-emerald-800">
                      Điểm giống nhau:
                    </div>
                    <p className="mt-1 text-sm sm:text-base font-bold text-emerald-950">
                      {comparison.similarity}
                    </p>
                  </div>

                  {/* Difference Box */}
                  <div className="rounded-2xl border-3 border-rose-300 bg-rose-50 p-3 sm:p-3.5">
                    <div className="font-heading text-sm sm:text-base font-extrabold text-rose-800">
                      Điểm khác nhau:
                    </div>
                    <p className="mt-1 text-sm sm:text-base font-bold text-rose-950">
                      {comparison.difference}
                    </p>
                  </div>
                </div>

                {/* Big Action Button to Enter Stroke Assembly Game */}
                <div className="mt-4 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={handleStartPuzzle}
                    className="flex min-h-[64px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-3xl border-4 border-emerald-700 bg-emerald-500 px-5 py-3 font-heading text-lg sm:text-2xl font-extrabold text-white shadow-[0_6px_0_#047857] transition hover:bg-emerald-400 active:translate-y-1"
                  >
                    <Sparkles className="h-6 w-6" />
                    <span>Chơi Ghép Nét Tạo Chữ!</span>
                  </button>
                </div>
              </section>
            </>
          ) : (
            <>
              {/* PUZZLE MODE LEFT PAGE: Magic Letter Assembly Frame */}
              <section className="flex flex-col items-center justify-between rounded-2xl md:rounded-l-[24px] md:rounded-r-lg border-3 border-amber-200 bg-[#FFFDF7] p-3.5 sm:p-5 md:pr-6">
                <div className="flex w-full items-center justify-between">
                  <span className="rounded-full bg-blue-100 px-3.5 py-1 font-heading text-xs sm:text-sm font-extrabold text-blue-800">
                    Chữ {puzzleLetterIdx + 1} / {targetLetters.length}
                  </span>
                  <div className="flex gap-1.5">
                    {targetLetters.map((ch, idx) => (
                      <span
                        key={ch}
                        className={`font-letter flex h-9 w-9 items-center justify-center rounded-xl border-2 text-base font-extrabold ${
                          idx < puzzleLetterIdx || allPuzzleDone
                            ? 'border-emerald-600 bg-emerald-500 text-white'
                            : idx === puzzleLetterIdx
                              ? 'border-blue-700 bg-blue-600 text-white'
                              : 'border-slate-200 bg-slate-100 text-slate-400'
                        }`}
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Assembled Letter Display */}
                <div className="relative my-2 flex h-44 w-44 sm:h-56 sm:w-56 items-center justify-center rounded-[32px] border-4 border-dashed border-amber-400 bg-amber-50/70 shadow-inner">
                  {strokeDef ? (
                    <svg viewBox="0 0 400 400" className="h-full w-full">
                      {/* Dotted outline guide */}
                      {strokeDef.strokes.map((st, idx) => (
                        <path
                          key={`guide-${idx}`}
                          d={st.svgPath}
                          fill="none"
                          stroke="#CBD5E1"
                          strokeWidth="26"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeDasharray="16 18"
                        />
                      ))}
                      {/* Lit strokes proportional to assembled pieces */}
                      {strokeDef.strokes.map((st, idx) => {
                        const litCount = Math.round(assembledRatio * strokeDef.strokes.length);
                        if (idx >= litCount && !allPuzzleDone) return null;
                        return (
                          <path
                            key={`lit-${idx}`}
                            d={st.svgPath}
                            fill="none"
                            stroke="#2563EB"
                            strokeWidth="30"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        );
                      })}
                    </svg>
                  ) : (
                    <span
                      className={`font-letter text-8xl font-extrabold transition ${
                        assembledRatio >= 1 ? 'text-blue-600 scale-110' : 'text-slate-300'
                      }`}
                    >
                      {currentPuzzleLetter}
                    </span>
                  )}
                </div>

                {/* Slots Progress */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {puzzleAnatomy.pieces.map((reqId, idx) => {
                    const done = pickedPieces.includes(reqId);
                    return (
                      <div
                        key={`${reqId}-${idx}`}
                        className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs sm:text-sm font-extrabold ${
                          done
                            ? 'border-emerald-500 bg-emerald-100 text-emerald-900'
                            : 'border-slate-300 bg-slate-100 text-slate-500'
                        }`}
                      >
                        {done && <Check className="h-4 w-4 text-emerald-600" />}
                        <span>{ done ? STROKE_PIECES[reqId].label : `Nét ${idx + 1}` }</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* PUZZLE MODE RIGHT PAGE: Tactile Stroke Piece Tiles */}
              <section className="flex flex-col justify-between rounded-2xl md:rounded-r-[24px] md:rounded-l-lg border-3 border-amber-200 bg-[#FFFDF7] p-3.5 sm:p-5 md:pl-6">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-heading text-base sm:text-xl font-extrabold text-blue-950">
                      Chạm chọn nét ghép chữ{' '}
                      <span className="font-letter text-2xl text-pink-600">
                        {currentPuzzleLetter}
                      </span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => initPuzzleForLetter(puzzleLetterIdx, targetLetters, true)}
                      className="flex min-h-[40px] cursor-pointer items-center gap-1 rounded-xl border-2 border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Đặt lại</span>
                    </button>
                  </div>

                  <p className="mt-1.5 rounded-xl bg-amber-100/80 px-3 py-2 text-xs sm:text-sm font-bold text-amber-950">
                    {feedback}
                  </p>

                  {/* Grid of Stroke Tiles (Minimum 64x64px for children) */}
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {trayPieces.map((pid) => {
                      const meta = STROKE_PIECES[pid];
                      const isPicked = pickedPieces.includes(pid);
                      const isWrong = wrongPiece === pid;
                      return (
                        <button
                          key={pid}
                          type="button"
                          disabled={isPicked}
                          onClick={() => handlePickPiece(pid)}
                          className={`flex min-h-[86px] sm:min-h-[98px] cursor-pointer flex-col items-center justify-center rounded-2xl border-4 p-2 text-center transition ${
                            isPicked
                              ? 'border-emerald-500 bg-emerald-100 text-emerald-900 opacity-80'
                              : isWrong
                                ? 'border-amber-500 bg-amber-100 text-amber-900 scale-95'
                                : 'border-blue-400 bg-white text-blue-950 shadow-[0_5px_0_#60A5FA] hover:-translate-y-0.5 active:translate-y-0.5'
                          }`}
                        >
                          <svg viewBox="0 0 100 100" className="h-10 w-10 sm:h-11 sm:w-11 text-blue-600">
                            <path
                              d={meta.svgPath}
                              fill="none"
                              stroke={isPicked ? '#059669' : '#2563EB'}
                              strokeWidth="10"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className="mt-1 text-xs sm:text-sm font-extrabold leading-tight">
                            {meta.shortLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Victory Banner inside Right Page */}
                {allPuzzleDone && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-3 border-emerald-500 bg-emerald-50 p-3">
                    <div className="flex items-center gap-2">
                      <Star className="h-7 w-7 fill-amber-400 text-amber-500" />
                      <span className="font-heading text-base sm:text-lg font-extrabold text-emerald-900">
                        Giỏi lắm! Sang Chặng 6 giải mã Quizizz nào!
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleStartPuzzle}
                        className="cursor-pointer rounded-xl border-2 border-emerald-600 bg-white px-3 py-2 font-heading text-sm font-bold text-emerald-800 hover:bg-emerald-100"
                      >
                        Ghép lại
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          audioManager.playClick();
                          audioManager.stopSpeaking();
                          onNextStage();
                        }}
                        className="flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-blue-800 bg-blue-600 px-4 py-2 font-heading text-sm sm:text-base font-extrabold text-white shadow-[0_3px_0_#1E3A8A] hover:bg-blue-500"
                      >
                        <span>Sang Chặng 6</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      {/* Footer Quick Bar */}
      <footer className="relative z-20 flex items-center justify-between gap-2">
        <span className="text-xs sm:text-sm font-bold text-amber-950/80">
          Nhóm chữ đang học:{' '}
          <strong className="font-letter text-base text-pink-700">
            {targetLetters.join(', ')}
          </strong>
        </span>
        <button
          type="button"
          onClick={() => {
            audioManager.playClick();
            audioManager.stopSpeaking();
            onNextStage();
          }}
          className="flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-2xl border-3 border-blue-700 bg-blue-600 px-4 py-1.5 font-heading text-sm sm:text-base font-extrabold text-white shadow-[0_4px_0_#1E3A8A] hover:bg-blue-500 active:translate-y-0.5"
        >
          <span>Chặng 6: Giải Mã Quizizz</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </footer>
    </div>
  );
};
