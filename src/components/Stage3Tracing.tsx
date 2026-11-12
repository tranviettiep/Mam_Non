import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Edit3, Lightbulb, Play, RotateCcw, Sliders, Sparkles, Star, Trophy, Volume2 } from 'lucide-react';
import { LessonConfig, Point2D } from '../types/lesson';
import { getEffectiveStrokeInstruction } from '../data/lessons';
import { AVAILABLE_TRACING_LETTERS, LETTER_STROKES } from '../data/strokes';
import { audioManager } from '../utils/audio';
import { ConfettiOverlay } from './ConfettiOverlay';

interface Stage3TracingProps {
  lesson: LessonConfig;
  onBackHub: () => void;
  onNextStage: () => void;
  onOpenEditor: () => void;
  onOpenVoiceSettings: () => void;
}

const START_HIT_RADIUS = 44;
const MOVE_HIT_RADIUS = 46;

function pointsToPath(pts: Point2D[]): string {
  if (pts.length === 0) return '';
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

export const Stage3Tracing: React.FC<Stage3TracingProps> = ({
  lesson,
  onBackHub,
  onNextStage,
  onOpenEditor,
  onOpenVoiceSettings,
}) => {
  const validLessonLetters = useMemo(() => {
    const filtered = lesson.targetLetters.filter((l) => Boolean(LETTER_STROKES[l]));
    return filtered.length > 0 ? filtered : ['e', 'ê'];
  }, [lesson.targetLetters]);

  const [activeLetterKey, setActiveLetterKey] = useState<string>(validLessonLetters[0]);
  const [strokeIdx, setStrokeIdx] = useState(0);
  const [progressIdx, setProgressIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [letterCompleted, setLetterCompleted] = useState(false);
  const [hintPoint, setHintPoint] = useState<Point2D | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const hintRafRef = useRef<number>(0);

  // Sync activeLetterKey if lesson changes
  useEffect(() => {
    setActiveLetterKey(validLessonLetters[0]);
    setStrokeIdx(0);
    setProgressIdx(0);
    setLetterCompleted(false);
  }, [validLessonLetters]);

  const letterDef = LETTER_STROKES[activeLetterKey] ?? LETTER_STROKES['e'];
  const activeStroke = letterDef.strokes[strokeIdx];
  const activeStrokeInfo = useMemo(
    () => getEffectiveStrokeInstruction(lesson, activeLetterKey, strokeIdx),
    [lesson, activeLetterKey, strokeIdx]
  );

  const stopHintAnimation = useCallback(() => {
    if (hintRafRef.current) {
      window.cancelAnimationFrame(hintRafRef.current);
      hintRafRef.current = 0;
    }
    setHintPoint(null);
  }, []);

  useEffect(() => {
    return () => {
      stopHintAnimation();
      audioManager.stopSpeaking();
    };
  }, [stopHintAnimation]);

  const resetCurrentLetter = useCallback(
    (announce = false) => {
      stopHintAnimation();
      setStrokeIdx(0);
      setProgressIdx(0);
      setIsDragging(false);
      setLetterCompleted(false);
      if (announce) {
        const first = getEffectiveStrokeInstruction(lesson, activeLetterKey, 0);
        if (first.instruction) {
          audioManager.speakVi(first.instruction, first.customAudioUrl);
        }
      }
    },
    [lesson, activeLetterKey, stopHintAnimation]
  );

  const selectLetter = (ch: string) => {
    stopHintAnimation();
    audioManager.playClick();
    setActiveLetterKey(ch);
    setStrokeIdx(0);
    setProgressIdx(0);
    setIsDragging(false);
    setLetterCompleted(false);
    const def = LETTER_STROKES[ch];
    if (def?.strokes[0]) {
      const first = getEffectiveStrokeInstruction(lesson, ch, 0);
      if (first.customAudioUrl) {
        audioManager.speakVi(first.instruction, first.customAudioUrl);
      } else {
        audioManager.speakVi(`Bé tập viết ${def.pronounce}. ${first.instruction}`);
      }
    }
  };

  const triggerHint = (overrideStrokeIdx?: number) => {
    const targetIdx = typeof overrideStrokeIdx === 'number' ? overrideStrokeIdx : strokeIdx;
    const targetStroke = letterDef.strokes[targetIdx];
    if (!targetStroke || (letterCompleted && typeof overrideStrokeIdx !== 'number')) return;

    stopHintAnimation();
    audioManager.playClick();
    const info = getEffectiveStrokeInstruction(lesson, activeLetterKey, targetIdx);
    audioManager.speakVi(info.instruction, info.customAudioUrl);

    const pts = targetStroke.waypoints;
    const baseProgress = typeof overrideStrokeIdx === 'number' ? 0 : progressIdx;
    const startIdx = Math.min(baseProgress, pts.length - 1);
    const remaining = pts.slice(startIdx);
    if (remaining.length < 2) return;

    const durationMs = 1150;
    const t0 = performance.now();

    const step = (now: number) => {
      const ratio = Math.min(1, (now - t0) / durationMs);
      const pos = ratio * (remaining.length - 1);
      const idx = Math.floor(pos);
      const frac = pos - idx;
      const pA = remaining[idx];
      const pB = remaining[Math.min(remaining.length - 1, idx + 1)];
      setHintPoint({
        x: pA.x + (pB.x - pA.x) * frac,
        y: pA.y + (pB.y - pA.y) * frac,
      });

      if (ratio < 1) {
        hintRafRef.current = window.requestAnimationFrame(step);
      } else {
        window.setTimeout(() => setHintPoint(null), 220);
      }
    };

    hintRafRef.current = window.requestAnimationFrame(step);
  };

  const clientToSvgCoords = (clientX: number, clientY: number): Point2D | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    return {
      x: ((clientX - rect.left) / rect.width) * 400,
      y: ((clientY - rect.top) / rect.height) * 400,
    };
  };

  const advanceAlongStroke = (pt: Point2D, currentProgress: number): number => {
    if (!activeStroke) return currentProgress;
    const wps = activeStroke.waypoints;
    const lastIdx = wps.length - 1;
    let nextProg = currentProgress;

    // Monotonically advance within a generous forward lookahead window
    const maxLookahead = Math.min(lastIdx, currentProgress + 12);
    for (let i = currentProgress; i <= maxLookahead; i++) {
      const d = Math.hypot(pt.x - wps[i].x, pt.y - wps[i].y);
      if (d <= MOVE_HIT_RADIUS) {
        nextProg = i;
      }
    }
    return nextProg;
  };

  const completeActiveStroke = () => {
    if (strokeIdx + 1 < letterDef.strokes.length) {
      audioManager.playStrokeComplete();
      const nextIdx = strokeIdx + 1;
      setStrokeIdx(nextIdx);
      setProgressIdx(0);
      setIsDragging(false);
      const nextInfo = getEffectiveStrokeInstruction(lesson, activeLetterKey, nextIdx);
      audioManager.speakVi(nextInfo.instruction, nextInfo.customAudioUrl);
    } else {
      setIsDragging(false);
      setLetterCompleted(true);
      audioManager.playCelebration();
      audioManager.speakVi(`Hoan hô! Bé viết ${letterDef.pronounce} giỏi lắm!`);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (letterCompleted || !activeStroke) return;
    audioManager.unlock();
    stopHintAnimation();

    const pt = clientToSvgCoords(e.clientX, e.clientY);
    if (!pt) return;

    const targetWp = activeStroke.waypoints[progressIdx];
    const dist = Math.hypot(pt.x - targetWp.x, pt.y - targetWp.y);

    if (dist <= START_HIT_RADIUS) {
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
      const updated = advanceAlongStroke(pt, progressIdx);
      if (updated >= activeStroke.waypoints.length - 2) {
        completeActiveStroke();
      } else {
        setProgressIdx(updated);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging || letterCompleted || !activeStroke) return;
    const pt = clientToSvgCoords(e.clientX, e.clientY);
    if (!pt) return;

    const updated = advanceAlongStroke(pt, progressIdx);
    if (updated !== progressIdx) {
      if (updated >= activeStroke.waypoints.length - 2) {
        completeActiveStroke();
      } else {
        setProgressIdx(updated);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isDragging) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore release error
      }
      setIsDragging(false);
    }
  };

  const handleNextLetter = () => {
    const curPos = validLessonLetters.indexOf(activeLetterKey);
    const nextLetter = validLessonLetters[(curPos + 1) % validLessonLetters.length];
    selectLetter(nextLetter);
  };

  // Compute current start indicator & tangent arrow
  const cursorGuide = useMemo(() => {
    if (!activeStroke || letterCompleted) return null;
    const wps = activeStroke.waypoints;
    const cur = wps[Math.min(progressIdx, wps.length - 1)];
    const look = wps[Math.min(progressIdx + 4, wps.length - 1)];
    const angleDeg = (Math.atan2(look.y - cur.y, look.x - cur.x) * 180) / Math.PI;
    return { x: cur.x, y: cur.y, angleDeg };
  }, [activeStroke, progressIdx, letterCompleted]);

  return (
    <div className="safe-pad relative flex h-full w-full flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-sky-200 via-blue-100 to-indigo-100 p-2 sm:p-4">
      <ConfettiOverlay active={letterCompleted} />

      {/* Main Classroom Tracing Board */}
      <div className="relative flex h-full w-full max-w-6xl flex-col justify-between rounded-[28px] sm:rounded-[36px] border-4 border-blue-400 bg-gradient-to-b from-sky-100/95 to-white px-3 py-2.5 sm:px-6 sm:py-4 shadow-[0_10px_0_rgba(59,130,246,0.22)]">
        {/* Top Bar inside Board */}
        <header className="flex flex-wrap items-center justify-between gap-2 md:flex-nowrap md:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                audioManager.stopSpeaking();
                onBackHub();
              }}
              className="flex cursor-pointer items-center gap-1.5 rounded-2xl border-2 border-slate-300 bg-white px-3 py-1.5 sm:px-4 sm:py-2 font-heading text-sm sm:text-base font-bold text-slate-700 shadow-xs hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Sảnh chính</span>
              <span className="sm:hidden">Sảnh</span>
            </button>

            {/* Cute Star Mascot + Current Letter Badge */}
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-2xl border-3 sm:border-4 border-amber-300 bg-amber-100 px-3 py-1 sm:px-4 sm:py-1.5 shadow-xs">
              <Star className="h-5 w-5 sm:h-7 sm:w-7 fill-amber-400 text-amber-500" />
              <span className="font-letter text-2xl sm:text-3xl font-extrabold text-blue-700">
                {letterDef.letter}
              </span>
            </div>
          </div>

          {/* Step Instruction Pill */}
          <button
            type="button"
            onClick={() =>
              activeStroke &&
              audioManager.speakVi(activeStrokeInfo.instruction, activeStrokeInfo.customAudioUrl)
            }
            className="order-last flex w-full md:order-none md:w-auto cursor-pointer items-center justify-center gap-2 rounded-2xl md:rounded-full border-2 border-blue-200 bg-white px-3.5 py-1.5 sm:px-6 sm:py-2 shadow-xs hover:bg-blue-50"
          >
            <span className="font-heading text-sm sm:text-lg md:text-2xl font-extrabold text-blue-900">
              {letterCompleted
                ? `Hoàn thành ${letterDef.pronounce} xuất sắc!`
                : `Nét ${strokeIdx + 1}/${letterDef.strokes.length}: ${activeStrokeInfo.instruction}`}
            </span>
            <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-blue-600" />
          </button>

          {/* Quick Extra Letter Picker, Editor & Voice Settings for Teachers */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onOpenEditor}
              className="hidden sm:flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-purple-200 bg-purple-50 px-3 py-1.5 font-heading text-sm font-bold text-purple-800 hover:bg-purple-100"
              title="Chỉnh sửa lời hướng dẫn viết Chặng 3"
            >
              <Edit3 className="h-4 w-4" />
              Chỉnh sửa
            </button>
            <button
              type="button"
              onClick={onOpenVoiceSettings}
              className="flex cursor-pointer items-center gap-1 rounded-xl border-2 border-indigo-200 bg-indigo-50 px-2.5 py-1.5 sm:px-3 font-heading text-xs sm:text-sm font-bold text-indigo-800 hover:bg-indigo-100"
            >
              <Sliders className="h-4 w-4" />
              <span className="hidden sm:inline">Giọng nói</span>
            </button>
            <div className="flex items-center gap-1">
              <span className="hidden xl:inline text-xs font-bold text-slate-500">Thư viện:</span>
              <select
                aria-label="Chọn chữ cái tập viết"
                value={activeLetterKey}
                onChange={(e) => selectLetter(e.target.value)}
                className="font-letter cursor-pointer rounded-xl border-2 border-blue-300 bg-white px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-base font-bold text-blue-900"
              >
                {AVAILABLE_TRACING_LETTERS.map((ch) => (
                  <option key={ch} value={ch}>
                    Chữ {ch} ({LETTER_STROKES[ch].upper})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Interactive Center SVG Tracing Area */}
        <main className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden py-1">
          <div className="relative aspect-square max-h-full w-full max-w-[min(85vw,430px)] rounded-[28px] sm:rounded-[32px] border-2 border-dashed border-sky-200 bg-white/85 shadow-inner">
            {/* Primary writing grid lines (subtle 4-square schoolbook guide) */}
            <svg
              ref={svgRef}
              viewBox="0 0 400 400"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{ touchAction: 'none' }}
              className="h-full w-full cursor-crosshair select-none"
            >
              {/* Subtle notebook horizontal guide lines */}
              <line x1="40" y1="146" x2="360" y2="146" stroke="#E0F2FE" strokeWidth="2" />
              <line x1="40" y1="226" x2="360" y2="226" stroke="#E0F2FE" strokeWidth="2" />
              <line x1="40" y1="306" x2="360" y2="306" stroke="#BAE6FD" strokeWidth="3" />

              {/* 1. Future strokes (light dotted) */}
              {letterDef.strokes.map((st, idx) => {
                if (idx <= strokeIdx) return null;
                return (
                  <path
                    key={`future-${idx}`}
                    d={st.svgPath}
                    fill="none"
                    stroke="#CBD5E1"
                    strokeWidth="15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="2 22"
                  />
                );
              })}

              {/* 2. Already completed strokes (solid royal blue) */}
              {letterDef.strokes.map((st, idx) => {
                if (idx >= strokeIdx && !letterCompleted) return null;
                return (
                  <path
                    key={`done-${idx}`}
                    d={st.svgPath}
                    fill="none"
                    stroke="#1D4ED8"
                    strokeWidth="30"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })}

              {/* 3. Active stroke dotted guide + traced segment */}
              {!letterCompleted && activeStroke && (
                <>
                  <path
                    d={activeStroke.svgPath}
                    fill="none"
                    stroke="#64748B"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="2 22"
                  />

                  {progressIdx > 0 && (
                    <path
                      d={pointsToPath(activeStroke.waypoints.slice(0, progressIdx + 1))}
                      fill="none"
                      stroke="#1D4ED8"
                      strokeWidth="30"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </>
              )}

              {/* 4. Directional Start/Cursor Dot */}
              {cursorGuide && (
                <g transform={`translate(${cursorGuide.x}, ${cursorGuide.y})`}>
                  <circle r="24" fill="rgba(239, 68, 68, 0.22)" />
                  <circle r="15" fill="#EF4444" stroke="#FFFFFF" strokeWidth="4" />
                  <g transform={`rotate(${cursorGuide.angleDeg})`}>
                    <path
                      d="M -4 -5 L 6 0 L -4 5 Z"
                      fill="#FFFFFF"
                    />
                  </g>
                </g>
              )}

              {/* 5. Animated Hint Star */}
              {hintPoint && (
                <g transform={`translate(${hintPoint.x}, ${hintPoint.y})`}>
                  <circle r="20" fill="#FDE047" stroke="#F59E0B" strokeWidth="4" />
                  <circle r="7" fill="#FFFFFF" />
                </g>
              )}
            </svg>

            {/* Completion Celebration Modal inside Canvas */}
            {letterCompleted && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[28px] sm:rounded-[32px] bg-slate-900/30 p-3 backdrop-blur-[2px]">
                <div className="flex flex-col items-center rounded-[28px] sm:rounded-[32px] border-4 border-amber-400 bg-white px-5 py-5 sm:px-9 sm:py-7 text-center shadow-2xl">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-7 w-7 sm:h-9 sm:w-9 text-amber-500" />
                    <Trophy className="h-11 w-11 sm:h-14 sm:w-14 text-amber-500" />
                    <Sparkles className="h-7 w-7 sm:h-9 sm:w-9 text-amber-500" />
                  </div>
                  <h2 className="font-heading mt-1.5 sm:mt-2 text-2xl sm:text-4xl font-extrabold text-blue-900">
                    BÉ GIỎI LẮM!
                  </h2>
                  <p className="mt-1 text-sm sm:text-base font-bold text-slate-600">
                    Bé đã tô hoàn chỉnh <strong className="font-letter text-lg sm:text-xl text-blue-700">{letterDef.letter}</strong> thật đẹp!
                  </p>
                  <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => resetCurrentLetter(true)}
                      className="flex cursor-pointer items-center gap-1.5 rounded-2xl border-2 border-amber-600 bg-amber-400 px-4 py-2 sm:px-5 sm:py-2.5 font-heading text-base sm:text-lg font-extrabold text-slate-950 shadow-[0_4px_0_#B45309] hover:bg-amber-300"
                    >
                      <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                      Viết lại
                    </button>
                    <button
                      type="button"
                      onClick={handleNextLetter}
                      className="flex cursor-pointer items-center gap-1.5 rounded-2xl border-2 border-blue-700 bg-blue-600 px-4 py-2 sm:px-5 sm:py-2.5 font-heading text-base sm:text-lg font-extrabold text-white shadow-[0_4px_0_#1E3A8A] hover:bg-blue-500"
                    >
                      Chữ tiếp
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        audioManager.stopSpeaking();
                        onNextStage();
                      }}
                      className="flex cursor-pointer items-center gap-1.5 rounded-2xl border-2 border-emerald-700 bg-emerald-500 px-4 py-2 sm:px-5 sm:py-2.5 font-heading text-base sm:text-lg font-extrabold text-white shadow-[0_4px_0_#047857] hover:bg-emerald-400"
                    >
                      Sang Chặng 4
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Bottom Action Bar */}
        <footer className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => {
              resetCurrentLetter(false);
              triggerHint(0);
            }}
            className="flex cursor-pointer items-center gap-1.5 rounded-2xl border-2 border-emerald-700 bg-emerald-500 px-3 py-2 sm:px-5 sm:py-2.5 font-heading text-sm sm:text-lg font-extrabold text-white shadow-[0_4px_0_#047857] transition hover:bg-emerald-400 active:translate-y-0.5"
          >
            <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
            BẮT ĐẦU
          </button>

          {validLessonLetters.map((ch) => {
            const selected = ch === activeLetterKey;
            return (
              <button
                key={ch}
                type="button"
                onClick={() => selectLetter(ch)}
                className={`font-letter cursor-pointer rounded-2xl border-2 px-3 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-lg font-extrabold shadow-[0_4px_0_rgba(30,58,138,0.45)] transition active:translate-y-0.5 ${
                  selected
                    ? 'border-blue-900 bg-blue-700 text-white ring-3 sm:ring-4 ring-blue-300'
                    : 'border-blue-700 bg-blue-500 text-white hover:bg-blue-400'
                }`}
              >
                CHỮ {ch}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => resetCurrentLetter(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-2xl border-2 border-amber-600 bg-amber-400 px-3 py-2 sm:px-5 sm:py-2.5 font-heading text-sm sm:text-lg font-extrabold text-slate-950 shadow-[0_4px_0_#B45309] transition hover:bg-amber-300 active:translate-y-0.5"
          >
            <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
            VIẾT LẠI
          </button>

          <button
            type="button"
            onClick={() => triggerHint()}
            className="flex cursor-pointer items-center gap-1.5 rounded-2xl border-2 border-indigo-800 bg-indigo-600 px-3 py-2 sm:px-5 sm:py-2.5 font-heading text-sm sm:text-lg font-extrabold text-white shadow-[0_4px_0_#3730A3] transition hover:bg-indigo-500 active:translate-y-0.5"
          >
            <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" />
            GỢI Ý
          </button>

          <button
            type="button"
            onClick={() => {
              audioManager.stopSpeaking();
              onNextStage();
            }}
            className="flex cursor-pointer items-center gap-1.5 rounded-2xl border-2 border-emerald-800 bg-emerald-600 px-3 py-2 sm:px-5 sm:py-2.5 font-heading text-sm sm:text-lg font-extrabold text-white shadow-[0_4px_0_#065F46] transition hover:bg-emerald-500 active:translate-y-0.5"
          >
            HÁI TÁO
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </footer>
      </div>
    </div>
  );
};
