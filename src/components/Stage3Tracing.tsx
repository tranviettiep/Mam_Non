import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Lightbulb, Play, RotateCcw, Sliders, Sparkles, Star, Trophy, Volume2 } from 'lucide-react';
import { LessonConfig, Point2D } from '../types/lesson';
import { AVAILABLE_TRACING_LETTERS, LETTER_STROKES } from '../data/strokes';
import { audioManager } from '../utils/audio';
import { ConfettiOverlay } from './ConfettiOverlay';

interface Stage3TracingProps {
  lesson: LessonConfig;
  onBackHub: () => void;
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
        const firstInstruction = (LETTER_STROKES[activeLetterKey] ?? LETTER_STROKES['e']).strokes[0]?.instruction;
        if (firstInstruction) {
          audioManager.speakVi(firstInstruction);
        }
      }
    },
    [activeLetterKey, stopHintAnimation]
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
      audioManager.speakVi(`Bé tập viết ${def.pronounce}. ${def.strokes[0].instruction}`);
    }
  };

  const triggerHint = () => {
    if (!activeStroke || letterCompleted) return;
    stopHintAnimation();
    audioManager.playClick();
    audioManager.speakVi(activeStroke.instruction);

    const pts = activeStroke.waypoints;
    const startIdx = Math.min(progressIdx, pts.length - 1);
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
      audioManager.speakVi(letterDef.strokes[nextIdx].instruction);
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
    <div className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-sky-200 via-blue-100 to-indigo-100 p-4">
      <ConfettiOverlay active={letterCompleted} />

      {/* Main Classroom Tracing Board (Matches c3_tv.jpg!) */}
      <div className="relative flex h-full w-full max-w-6xl flex-col justify-between rounded-[36px] border-4 border-blue-400 bg-gradient-to-b from-sky-100/95 to-white px-6 py-4 shadow-[0_12px_0_rgba(59,130,246,0.22)]">
        {/* Top Bar inside Board */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                audioManager.stopSpeaking();
                onBackHub();
              }}
              className="flex cursor-pointer items-center gap-1.5 rounded-2xl border-2 border-slate-300 bg-white px-4 py-2 font-heading text-base font-bold text-slate-700 shadow-xs hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Sảnh chính
            </button>

            {/* Cute Star Mascot + Current Letter Badge */}
            <div className="flex items-center gap-2 rounded-2xl border-4 border-amber-300 bg-amber-100 px-4 py-1.5 shadow-xs">
              <Star className="h-7 w-7 fill-amber-400 text-amber-500" />
              <span className="font-letter text-3xl font-extrabold text-blue-700">{letterDef.letter}</span>
            </div>
          </div>

          {/* Step Instruction Pill */}
          <button
            type="button"
            onClick={() => activeStroke && audioManager.speakVi(activeStroke.instruction)}
            className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-blue-200 bg-white px-6 py-2 shadow-xs hover:bg-blue-50"
          >
            <span className="font-heading text-xl font-extrabold text-blue-900 md:text-2xl">
              {letterCompleted
                ? `Hoàn thành ${letterDef.pronounce} xuất sắc!`
                : `Nét ${strokeIdx + 1}/${letterDef.strokes.length}: ${activeStroke?.instruction ?? ''}`}
            </span>
            <Volume2 className="h-5 w-5 text-blue-600" />
          </button>

          {/* Quick Extra Letter Picker & Voice Settings for Teachers */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenVoiceSettings}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-indigo-200 bg-indigo-50 px-3 py-1.5 font-heading text-sm font-bold text-indigo-800 hover:bg-indigo-100"
            >
              <Sliders className="h-4 w-4" />
              Giọng nói
            </button>
            <div className="hidden items-center gap-1.5 lg:flex">
              <span className="text-xs font-bold text-slate-500">Thư viện:</span>
              <select
                aria-label="Chọn chữ cái tập viết"
                value={activeLetterKey}
                onChange={(e) => selectLetter(e.target.value)}
                className="font-letter cursor-pointer rounded-xl border-2 border-blue-300 bg-white px-3 py-1.5 text-base font-bold text-blue-900"
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
        <main className="relative flex flex-1 items-center justify-center overflow-hidden py-1">
          <div className="relative aspect-square h-full max-h-[430px] rounded-[32px] border-2 border-dashed border-sky-200 bg-white/85 shadow-inner">
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

            {/* Completion Celebration Modal inside Canvas (Matches c3_done.jpg!) */}
            {letterCompleted && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[32px] bg-slate-900/30 backdrop-blur-[2px]">
                <div className="flex flex-col items-center rounded-[32px] border-4 border-amber-400 bg-white px-9 py-7 text-center shadow-2xl">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-9 w-9 text-amber-500" />
                    <Trophy className="h-14 w-14 text-amber-500" />
                    <Sparkles className="h-9 w-9 text-amber-500" />
                  </div>
                  <h2 className="font-heading mt-2 text-4xl font-extrabold text-blue-900">BÉ GIỎI LẮM!</h2>
                  <p className="mt-1 text-base font-bold text-slate-600">
                    Bé đã tô hoàn chỉnh <strong className="font-letter text-xl text-blue-700">{letterDef.letter}</strong> thật đẹp!
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => resetCurrentLetter(true)}
                      className="flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-amber-600 bg-amber-400 px-5 py-2.5 font-heading text-lg font-extrabold text-slate-950 shadow-[0_4px_0_#B45309] hover:bg-amber-300"
                    >
                      <RotateCcw className="h-5 w-5" />
                      Viết lại
                    </button>
                    <button
                      type="button"
                      onClick={handleNextLetter}
                      className="flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-emerald-700 bg-emerald-500 px-5 py-2.5 font-heading text-lg font-extrabold text-white shadow-[0_4px_0_#047857] hover:bg-emerald-400"
                    >
                      Tiếp tục
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Bottom 6-Button Action Bar (Exact match to video Stage 3!) */}
        <footer className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              resetCurrentLetter(false);
              triggerHint();
            }}
            className="flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-emerald-700 bg-emerald-500 px-5 py-2.5 font-heading text-lg font-extrabold text-white shadow-[0_5px_0_#047857] transition hover:bg-emerald-400 active:translate-y-0.5"
          >
            <Play className="h-5 w-5 fill-current" />
            BẮT ĐẦU
          </button>

          {validLessonLetters.map((ch) => {
            const selected = ch === activeLetterKey;
            return (
              <button
                key={ch}
                type="button"
                onClick={() => selectLetter(ch)}
                className={`font-letter cursor-pointer rounded-2xl border-2 px-5 py-2.5 text-lg font-extrabold shadow-[0_5px_0_rgba(30,58,138,0.45)] transition active:translate-y-0.5 ${
                  selected
                    ? 'border-blue-900 bg-blue-700 text-white ring-4 ring-blue-300'
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
            className="flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-amber-600 bg-amber-400 px-5 py-2.5 font-heading text-lg font-extrabold text-slate-950 shadow-[0_5px_0_#B45309] transition hover:bg-amber-300 active:translate-y-0.5"
          >
            <RotateCcw className="h-5 w-5" />
            VIẾT LẠI
          </button>

          <button
            type="button"
            onClick={triggerHint}
            className="flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-indigo-800 bg-indigo-600 px-5 py-2.5 font-heading text-lg font-extrabold text-white shadow-[0_5px_0_#3730A3] transition hover:bg-indigo-500 active:translate-y-0.5"
          >
            <Lightbulb className="h-5 w-5" />
            GỢI Ý
          </button>

          <button
            type="button"
            onClick={handleNextLetter}
            className="flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-fuchsia-900 bg-fuchsia-600 px-5 py-2.5 font-heading text-lg font-extrabold text-white shadow-[0_5px_0_#701A75] transition hover:bg-fuchsia-500 active:translate-y-0.5"
          >
            TIẾP TỤC
            <ArrowRight className="h-5 w-5" />
          </button>
        </footer>
      </div>
    </div>
  );
};
