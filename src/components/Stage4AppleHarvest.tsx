import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Sliders, Star, Volume2 } from 'lucide-react';
import { LessonConfig } from '../types/lesson';
import { audioManager } from '../utils/audio';
import { ConfettiOverlay } from './ConfettiOverlay';

interface Stage4AppleHarvestProps {
  lesson: LessonConfig;
  onBackHub: () => void;
  onNextStage?: () => void;
  onOpenVoiceSettings: () => void;
}

interface AppleItem {
  id: number;
  letter: string;
  isTarget: boolean;
  slotIndex: number;
  xPct: number;
  yPct: number;
  picked: boolean;
  pickedBy?: string;
}

interface DragState {
  appleId: number;
  pointerId: number;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  hoveredBasket: string | null;
}

// 10 well-spaced positions inside the lush apple tree canopy (x%, y%)
const CANOPY_SLOTS: ReadonlyArray<{ xPct: number; yPct: number }> = [
  { xPct: 32, yPct: 22 },
  { xPct: 51, yPct: 17 },
  { xPct: 70, yPct: 24 },
  { xPct: 19, yPct: 44 },
  { xPct: 39, yPct: 40 },
  { xPct: 60, yPct: 42 },
  { xPct: 80, yPct: 47 },
  { xPct: 27, yPct: 66 },
  { xPct: 49, yPct: 63 },
  { xPct: 70, yPct: 67 },
];

function getDistractorPool(targets: string[]): string[] {
  const key = targets.join(',');
  let preferred: string[];
  if (key === 'e,ê' || key === 'ê,e') {
    preferred = ['o', 'ô']; // Giống hệt các quả táo nhiễu trong video gốc
  } else if (targets.some((c) => ['o', 'ô', 'ơ'].includes(c))) {
    preferred = ['e', 'ê', 'a'];
  } else if (targets.some((c) => ['a', 'ă', 'â'].includes(c))) {
    preferred = ['o', 'ô', 'e'];
  } else if (targets.some((c) => ['u', 'ư'].includes(c))) {
    preferred = ['o', 'ơ'];
  } else if (targets.some((c) => ['b', 'd', 'đ'].includes(c))) {
    preferred = ['o', 'a', 'e'];
  } else {
    preferred = ['o', 'ô', 'e', 'ê', 'a', 'u'];
  }
  const filtered = preferred.filter((c) => !targets.includes(c));
  return filtered.length > 0 ? filtered : ['o', 'a'];
}

export function formatLettersWithAnd(letters: string[]): string {
  if (letters.length === 0) return 'e và ê';
  if (letters.length === 1) return letters[0];
  if (letters.length === 2) return `${letters[0]} và ${letters[1]}`;
  return `${letters.slice(0, -1).join(', ')} và ${letters[letters.length - 1]}`;
}

export function buildAppleInstructionText(targets: string[]): string {
  return `Bé vui hái táo! Bé hãy kéo thả táo có chữ ${targets.join(', ')} vào đúng giỏ nhé!`;
}

export function buildAppleVictorySpeech(targets: string[]): string {
  return `Bé giỏi quá! Em đã hái đủ táo chữ ${formatLettersWithAnd(targets)}!`;
}

function generateApples(targets: string[]): AppleItem[] {
  const distractors = getDistractorPool(targets);
  const totalSlots = CANOPY_SLOTS.length;

  // Determine balanced target count per letter so total fits 10 canopy slots cleanly
  const perTarget =
    targets.length === 1 ? 5 : targets.length === 2 ? 3 : targets.length === 3 ? 2 : 2;

  const lettersPool: Array<{ letter: string; isTarget: boolean }> = [];
  for (const t of targets) {
    for (let i = 0; i < perTarget && lettersPool.length < totalSlots - 2; i++) {
      lettersPool.push({ letter: t, isTarget: true });
    }
  }

  let dIdx = 0;
  while (lettersPool.length < totalSlots) {
    lettersPool.push({
      letter: distractors[dIdx % distractors.length],
      isTarget: false,
    });
    dIdx++;
  }

  // Fisher-Yates shuffle so every replay has a fresh layout on the tree
  for (let i = lettersPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = lettersPool[i];
    lettersPool[i] = lettersPool[j];
    lettersPool[j] = tmp;
  }

  return CANOPY_SLOTS.map((slot, idx) => ({
    id: idx + 1,
    letter: lettersPool[idx].letter,
    isTarget: lettersPool[idx].isTarget,
    slotIndex: idx,
    xPct: slot.xPct,
    yPct: slot.yPct,
    picked: false,
  }));
}

const RedAppleSvg: React.FC<{ letter: string; className?: string; textClassName?: string }> = ({
  letter,
  className = 'h-full w-full',
  textClassName = 'text-2xl sm:text-3xl md:text-4xl',
}) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 100 108" className="h-full w-full drop-shadow-[0_5px_4px_rgba(15,23,42,0.25)]">
      {/* Stem */}
      <path
        d="M49 22 C49 12, 53 6, 57 4"
        fill="none"
        stroke="#78350F"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Green Leaf */}
      <path
        d="M52 17 C62 7, 79 9, 82 19 C73 25, 60 24, 52 17 Z"
        fill="#22C55E"
        stroke="#15803D"
        strokeWidth="2.5"
      />
      {/* Glossy Red Apple Body */}
      <path
        d="M50 25 C34 16, 10 26, 10 53 C10 81, 31 101, 46 101 C48 101, 49 99, 50 99 C51 99, 52 101, 54 101 C69 101, 90 81, 90 53 C90 26, 66 16, 50 25 Z"
        fill="#EF4444"
        stroke="#B91C1C"
        strokeWidth="3.5"
      />
      {/* Soft inner highlight */}
      <ellipse
        cx="31"
        cy="44"
        rx="9"
        ry="14"
        transform="rotate(-18 31 44)"
        fill="rgba(254, 202, 202, 0.55)"
      />
    </svg>
    <span
      className={`font-letter pointer-events-none absolute inset-0 flex items-center justify-center pt-2 font-extrabold leading-none text-white drop-shadow-[0_2px_1px_rgba(127,29,29,0.85)] ${textClassName}`}
    >
      {letter}
    </span>
  </div>
);

const WickerBasketCard: React.FC<{
  letter: string;
  collectedCount: number;
  targetTotal: number;
  highlighted: boolean;
  justCollected: boolean;
  basketRef: (el: HTMLDivElement | null) => void;
  onTapBasket: () => void;
}> = ({
  letter,
  collectedCount,
  targetTotal,
  highlighted,
  justCollected,
  basketRef,
  onTapBasket,
}) => {
  return (
    <div
      ref={basketRef}
      onClick={onTapBasket}
      className={`relative flex cursor-pointer flex-col items-center select-none transition-transform duration-150 ${
        highlighted ? 'scale-110 -translate-y-1' : justCollected ? 'scale-105' : 'hover:scale-[1.03]'
      }`}
    >
      <div className="relative w-28 sm:w-36 md:w-44 lg:w-48 aspect-[1.22/1]">
        <svg viewBox="0 0 220 180" className="h-full w-full drop-shadow-[0_8px_6px_rgba(15,23,42,0.22)]">
          {/* Basket Arched Handle */}
          <path
            d="M 46 76 C 46 12, 174 12, 174 76"
            fill="none"
            stroke="#B45309"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 46 76 C 46 12, 174 12, 174 76"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Inner dark rim */}
          <ellipse cx="110" cy="78" rx="76" ry="18" fill="#78350F" />

          {/* Collected Mini Apples peeking out inside the basket */}
          {Array.from({ length: Math.min(collectedCount, 5) }).map((_, idx) => {
            const offsets = [-38, -18, 4, 24, 42];
            const cx = 110 + offsets[idx % offsets.length];
            const cy = 70 - (idx % 2) * 5;
            return (
              <g key={idx}>
                <circle cx={cx} cy={cy} r="16" fill="#EF4444" stroke="#991B1B" strokeWidth="2.5" />
                <circle cx={cx - 5} cy={cy - 4} r="4" fill="#FECACA" opacity="0.7" />
              </g>
            );
          })}

          {/* Woven Basket Body */}
          <path
            d="M 30 78 L 48 156 C 51 167, 169 167, 172 156 L 190 78 Z"
            fill="#FBBF24"
            stroke="#B45309"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Horizontal wicker weave lines */}
          <path d="M 36 102 Q 110 112 184 102" fill="none" stroke="#D97706" strokeWidth="4" />
          <path d="M 42 126 Q 110 136 178 126" fill="none" stroke="#D97706" strokeWidth="4" />
          <path d="M 47 148 Q 110 156 173 148" fill="none" stroke="#D97706" strokeWidth="3.5" />

          {/* Braided Rim */}
          <rect
            x="24"
            y="68"
            width="172"
            height="20"
            rx="10"
            fill="#F59E0B"
            stroke="#92400E"
            strokeWidth="4.5"
          />

          {/* Cute Purple/Lavender Ribbon Bow on Handle Top (matches video!) */}
          <g transform="translate(110, 26)">
            <path
              d="M -4 0 C -22 -16, -34 -6, -28 8 C -24 18, -10 12, -3 4 Z"
              fill="#A855F7"
              stroke="#6B21A8"
              strokeWidth="3"
            />
            <path
              d="M 4 0 C 22 -16, 34 -6, 28 8 C 24 18, 10 12, 3 4 Z"
              fill="#A855F7"
              stroke="#6B21A8"
              strokeWidth="3"
            />
            <path d="M -6 6 L -14 22 L -4 19 L -1 8 Z" fill="#9333EA" />
            <path d="M 6 6 L 14 22 L 4 19 L 1 8 Z" fill="#9333EA" />
            <circle cx="0" cy="3" r="7" fill="#C084FC" stroke="#6B21A8" strokeWidth="3" />
          </g>

          {/* Glow ring when dragging an apple over this basket */}
          {highlighted && (
            <rect
              x="16"
              y="60"
              width="188"
              height="112"
              rx="28"
              fill="none"
              stroke="#10B981"
              strokeWidth="6"
              strokeDasharray="10 6"
            />
          )}
        </svg>

        {/* Front White Circular Letter Label on Basket */}
        <div
          className={`pointer-events-none absolute bottom-[10%] left-1/2 flex h-12 w-12 sm:h-15 sm:w-15 md:h-18 md:w-18 -translate-x-1/2 items-center justify-center rounded-full border-4 bg-white shadow-md transition ${
            highlighted ? 'border-emerald-500 ring-4 ring-emerald-300' : 'border-sky-300'
          }`}
        >
          <span className="font-letter text-2xl sm:text-3xl md:text-4xl font-extrabold leading-none text-blue-700">
            {letter}
          </span>
        </div>
      </div>

      {/* Progress Counter Pill */}
      <span className="mt-0.5 rounded-full border-2 border-white bg-emerald-600/95 px-2.5 py-0.5 font-heading text-xs sm:text-sm font-extrabold text-white shadow">
        Giỏ {letter}: {collectedCount}/{targetTotal}
      </span>
    </div>
  );
};

export const Stage4AppleHarvest: React.FC<Stage4AppleHarvestProps> = ({
  lesson,
  onBackHub,
  onNextStage,
  onOpenVoiceSettings,
}) => {
  const targetLetters = useMemo(() => {
    const normalized = Array.from(
      new Set(lesson.targetLetters.map((c) => c.trim().toLowerCase()).filter(Boolean))
    );
    return normalized.length > 0 ? normalized : ['e', 'ê'];
  }, [lesson.targetLetters]);

  const [apples, setApples] = useState<AppleItem[]>(() => generateApples(targetLetters));
  const [drag, setDrag] = useState<DragState | null>(null);
  const [wrongAppleId, setWrongAppleId] = useState<number | null>(null);
  const [justCollectedBasket, setJustCollectedBasket] = useState<string | null>(null);
  const [hintBanner, setHintBanner] = useState<string>(
    `Kéo táo chữ ${targetLetters.join(', ')} thả vào đúng giỏ nhé!`
  );

  const basketElsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const timersRef = useRef<number[]>([]);

  const registerTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const speakInstruction = useCallback(() => {
    audioManager.speakVi(buildAppleInstructionText(targetLetters));
  }, [targetLetters]);

  // Reset apples when lesson targetLetters change & read instruction aloud
  useEffect(() => {
    setApples(generateApples(targetLetters));
    setDrag(null);
    setWrongAppleId(null);
    setHintBanner(`Kéo táo chữ ${targetLetters.join(', ')} thả vào đúng giỏ nhé!`);

    const t = window.setTimeout(() => {
      audioManager.speakVi(buildAppleInstructionText(targetLetters));
    }, 320);

    return () => {
      window.clearTimeout(t);
      clearAllTimers();
      audioManager.stopSpeaking();
    };
  }, [targetLetters, clearAllTimers]);

  const targetCountsByLetter = useMemo(() => {
    const total: Record<string, number> = {};
    const picked: Record<string, number> = {};
    for (const ch of targetLetters) {
      total[ch] = 0;
      picked[ch] = 0;
    }
    for (const a of apples) {
      if (a.isTarget && total[a.letter] !== undefined) {
        total[a.letter] += 1;
        if (a.picked) picked[a.letter] += 1;
      }
    }
    return { total, picked };
  }, [apples, targetLetters]);

  const totalTargets = useMemo(
    () => apples.filter((a) => a.isTarget).length,
    [apples]
  );
  const pickedTargets = useMemo(
    () => apples.filter((a) => a.isTarget && a.picked).length,
    [apples]
  );
  const allCompleted = totalTargets > 0 && pickedTargets >= totalTargets;

  const findBasketAtPoint = (clientX: number, clientY: number): string | null => {
    const hitPad = 20;
    for (const ch of targetLetters) {
      const el = basketElsRef.current[ch];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (
        clientX >= rect.left - hitPad &&
        clientX <= rect.right + hitPad &&
        clientY >= rect.top - hitPad &&
        clientY <= rect.bottom + hitPad
      ) {
        return ch;
      }
    }
    return null;
  };

  const handleReplay = () => {
    clearAllTimers();
    audioManager.unlock();
    audioManager.playClick();
    setApples(generateApples(targetLetters));
    setDrag(null);
    setWrongAppleId(null);
    setHintBanner(`Lượt mới! Bé hãy hái táo chữ ${targetLetters.join(', ')} vào đúng giỏ nhé!`);
    speakInstruction();
  };

  const handleApplePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    apple: AppleItem
  ) => {
    if (apple.picked || allCompleted) return;
    e.preventDefault();
    audioManager.unlock();
    audioManager.playClick();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore pointer capture issues on synthetic events
    }
    setWrongAppleId(null);
    setDrag({
      appleId: apple.id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      dx: 0,
      dy: 0,
      hoveredBasket: null,
    });
  };

  const handleApplePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const hoveredBasket = findBasketAtPoint(e.clientX, e.clientY);
    setDrag((prev) => (prev ? { ...prev, dx, dy, hoveredBasket } : null));
  };

  const handleApplePointerUp = (
    e: React.PointerEvent<HTMLDivElement>,
    apple: AppleItem
  ) => {
    if (!drag || drag.pointerId !== e.pointerId) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const movedDist = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY);
    const droppedBasket = findBasketAtPoint(e.clientX, e.clientY);
    setDrag(null);

    // Quick tap on apple -> read its letter aloud to assist child
    if (!droppedBasket && movedDist < 12) {
      audioManager.speakVi(`Chữ ${apple.letter}`);
      setHintBanner(`Quả táo mang chữ ${apple.letter}`);
      return;
    }

    // Released in mid-air away from baskets -> gently return to branch
    if (!droppedBasket) {
      return;
    }

    // Correct match!
    if (apple.isTarget && apple.letter === droppedBasket) {
      const nextPickedCount = pickedTargets + 1;
      setApples((prev) =>
        prev.map((it) =>
          it.id === apple.id ? { ...it, picked: true, pickedBy: droppedBasket } : it
        )
      );
      setJustCollectedBasket(droppedBasket);
      registerTimeout(() => setJustCollectedBasket(null), 500);

      if (nextPickedCount >= totalTargets) {
        audioManager.playCelebration();
        setHintBanner(`Hoan hô! Bé đã hái đủ ${totalTargets} quả táo!`);
        registerTimeout(() => {
          audioManager.speakVi(buildAppleVictorySpeech(targetLetters), undefined, undefined, 'character');
        }, 250);
      } else {
        audioManager.playCorrect();
        setHintBanner(`Đúng rồi! Táo chữ ${apple.letter} vào giỏ chữ ${droppedBasket}!`);
        audioManager.speakVi(`Chính xác!`);
      }
      return;
    }

    // Wrong basket or distractor letter -> gentle positive encouragement, no negative penalty
    audioManager.playRetry();
    setWrongAppleId(apple.id);
    registerTimeout(() => setWrongAppleId(null), 650);

    if (!apple.isTarget) {
      setHintBanner(`Đây là chữ ${apple.letter}, bé tìm táo chữ ${targetLetters.join(', ')} nhé!`);
      audioManager.speakVi('Quả táo này không có chữ cần tìm, bé chọn quả khác nhé!');
    } else {
      setHintBanner(`Nhầm giỏ rồi! Đây là chữ ${apple.letter}, bé thả vào giỏ chữ ${apple.letter} nhé!`);
      audioManager.speakVi('Nhầm giỏ rồi, bé nhìn kỹ chữ trên giỏ nhé!');
    }
  };

  return (
    <div
      style={{ touchAction: 'none' }}
      className="safe-pad relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-b from-sky-400 via-sky-200 to-lime-200 select-none"
    >
      <ConfettiOverlay active={allCompleted} />

      {/* Scenic Orchard Background (Sun, Clouds, Cottage, Fence & Flower Meadow) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Soft Clouds */}
        <div className="absolute left-[6%] top-[10%] h-16 w-40 sm:h-24 sm:w-56 rounded-full bg-white/75 blur-[2px]" />
        <div className="absolute left-[58%] top-[8%] h-14 w-36 sm:h-20 sm:w-48 rounded-full bg-white/70 blur-[2px]" />

        {/* Smiling Sun (Top Right, just like video!) */}
        <div className="animate-float-slow absolute right-4 top-12 sm:right-8 sm:top-14 flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-full border-4 border-amber-200 bg-amber-300 shadow-[0_0_35px_rgba(251,191,36,0.85)]">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-amber-950" />
              <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-amber-950" />
            </div>
            <span className="mt-1 h-2 w-4 sm:h-2.5 sm:w-5 rounded-b-full bg-rose-500" />
          </div>
        </div>

        {/* Distant Little Red-Roof Cottage & White Fence on Right Horizon */}
        <svg
          viewBox="0 0 220 150"
          className="hidden sm:block absolute bottom-[22%] right-[2%] w-36 md:w-48 lg:w-56 opacity-95"
        >
          {/* White picket fence */}
          {[10, 32, 54, 76].map((fx) => (
            <rect
              key={fx}
              x={fx}
              y="98"
              width="14"
              height="42"
              rx="4"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="2"
            />
          ))}
          <rect x="6" y="110" width="88" height="7" rx="3" fill="#F8FAFC" />
          <rect x="6" y="126" width="88" height="7" rx="3" fill="#F8FAFC" />
          {/* House walls & red roof */}
          <rect x="96" y="68" width="96" height="72" rx="6" fill="#FEF3C7" stroke="#D97706" strokeWidth="3" />
          <polygon points="84,72 144,24 204,72" fill="#EF4444" stroke="#B91C1C" strokeWidth="4" />
          <rect x="132" y="98" width="26" height="42" rx="5" fill="#92400E" />
          <rect x="108" y="84" width="20" height="20" rx="3" fill="#7DD3FC" stroke="#0284C7" strokeWidth="2.5" />
          <rect x="162" y="84" width="20" height="20" rx="3" fill="#7DD3FC" stroke="#0284C7" strokeWidth="2.5" />
        </svg>

        {/* Rolling Green Meadow Hills */}
        <div className="absolute -bottom-16 -left-[10%] h-48 sm:h-56 md:h-64 w-[120%] rounded-[100%] bg-gradient-to-b from-lime-400 via-emerald-400 to-emerald-600 shadow-inner" />
      </div>

      {/* Top Navigation & Score Bar */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-2 px-3 pt-2 sm:px-5 sm:pt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              audioManager.stopSpeaking();
              onBackHub();
            }}
            className="flex cursor-pointer items-center gap-1.5 rounded-2xl border-2 border-white bg-slate-800/90 px-3 py-1.5 sm:px-4 sm:py-2 font-heading text-sm sm:text-base font-bold text-white shadow hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Sảnh chính</span>
          </button>

          <button
            type="button"
            onClick={speakInstruction}
            className="flex cursor-pointer items-center gap-1.5 rounded-2xl border-2 border-amber-400 bg-white/95 px-3 py-1.5 sm:px-4 sm:py-2 font-heading text-sm sm:text-base font-extrabold text-rose-700 shadow hover:bg-white"
          >
            <Volume2 className="h-4 w-4 text-rose-600" />
            <span className="hidden sm:inline">Chặng 4:</span>
            <span>Bé Vui Hái Táo</span>
          </button>
        </div>

        {/* Status Pill (Center on Desktop) */}
        <div className="hidden lg:flex items-center rounded-full border-2 border-white bg-white/90 px-4 py-1 text-sm font-extrabold text-emerald-900 shadow-xs">
          {hintBanner}
        </div>

        {/* Right Controls: Progress + Replay + Voice */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 rounded-full border-2 border-amber-300 bg-white px-3 py-1 sm:px-4 sm:py-1.5 shadow">
            <span className="font-heading text-sm sm:text-lg font-extrabold text-rose-600">
              {pickedTargets}/{totalTargets}
            </span>
            <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-amber-400 text-amber-500" />
          </div>

          <button
            type="button"
            onClick={handleReplay}
            title="Xáo lại cây táo mới"
            className="flex cursor-pointer items-center gap-1 rounded-xl border-2 border-white bg-emerald-600 px-2.5 py-1.5 sm:px-3.5 sm:py-2 font-heading text-xs sm:text-sm font-bold text-white shadow hover:bg-emerald-500"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Chơi lại</span>
          </button>

          <button
            type="button"
            onClick={onOpenVoiceSettings}
            title="Cài đặt giọng nói"
            className="flex cursor-pointer items-center gap-1 rounded-xl border-2 border-white bg-indigo-600 px-2.5 py-1.5 sm:px-3.5 sm:py-2 font-heading text-xs sm:text-sm font-bold text-white shadow hover:bg-indigo-500"
          >
            <Sliders className="h-4 w-4" />
            <span className="hidden md:inline">Giọng nói</span>
          </button>
        </div>
      </header>

      {/* Compact Mobile Instruction Banner (< md) */}
      <div className="relative z-20 mx-3 mt-1 flex md:hidden items-center justify-between gap-2 rounded-2xl border-2 border-amber-500 bg-amber-50/95 px-3 py-1.5 shadow">
        <p className="text-xs font-bold text-amber-950 leading-snug">
          Kéo thả táo có chữ{' '}
          <strong className="font-letter text-sm text-rose-600">
            {targetLetters.join(', ')}
          </strong>{' '}
          vào đúng giỏ bên dưới nhé!
        </p>
        <button
          type="button"
          onClick={speakInstruction}
          aria-label="Nghe hướng dẫn"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900"
        >
          <Volume2 className="h-4 w-4" />
        </button>
      </div>

      {/* Main Orchard Playground */}
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col md:flex-row items-center justify-between px-2 pb-1 sm:px-4 md:pb-2 min-h-0">
        {/* Left Instruction Signboard & Cheering Mascot (Tablet/PC/TV >= md, matching video!) */}
        <aside className="hidden md:flex md:w-56 lg:w-64 shrink-0 flex-col items-center justify-between self-stretch py-2">
          {/* Wooden / Parchment Instruction Scroll Board */}
          <button
            type="button"
            onClick={speakInstruction}
            className="group relative w-full cursor-pointer rounded-[26px] border-[5px] border-amber-700 bg-gradient-to-b from-amber-50 to-orange-50 p-4 text-center shadow-[0_8px_0_#92400E] transition hover:-translate-y-0.5"
          >
            <div className="font-heading text-2xl lg:text-3xl font-extrabold text-rose-600 drop-shadow-[0_1px_0_#fff]">
              Bé vui hái táo
            </div>
            <div className="mx-auto my-1 h-7 w-7">
              <RedAppleSvg letter="" />
            </div>
            <p className="text-sm lg:text-base font-bold leading-snug text-slate-800">
              Bé hãy kéo thả táo có chữ{' '}
              <strong className="font-letter text-lg lg:text-xl font-extrabold text-rose-600">
                {targetLetters.join(', ')}
              </strong>{' '}
              vào đúng giỏ nhé!
            </p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-200/80 px-3 py-0.5 text-xs font-extrabold text-amber-900 group-hover:bg-amber-300">
              <Volume2 className="h-3.5 w-3.5" /> Nghe cô đọc
            </span>
          </button>

          {/* Cute Cheering Preschool Mascot SVG */}
          <div className="pointer-events-none flex flex-col items-center">
            <svg viewBox="0 0 140 165" className="h-36 lg:h-44 w-auto drop-shadow-md">
              {/* Hair pigtails */}
              <circle cx="34" cy="48" r="14" fill="#451A03" />
              <circle cx="106" cy="48" r="14" fill="#451A03" />
              <circle cx="44" cy="44" r="5" fill="#EC4899" />
              <circle cx="96" cy="44" r="5" fill="#EC4899" />
              {/* Head */}
              <circle cx="70" cy="54" r="30" fill="#FDE68A" stroke="#D97706" strokeWidth="3" />
              {/* Bangs */}
              <path
                d="M 40 48 C 44 22, 96 22, 100 48 C 88 38, 52 38, 40 48 Z"
                fill="#451A03"
              />
              {/* Eyes & Rosy Cheeks & Big Smile */}
              <circle cx="58" cy="55" r="4" fill="#1E293B" />
              <circle cx="82" cy="55" r="4" fill="#1E293B" />
              <circle cx="50" cy="63" r="5" fill="#FDA4AF" opacity="0.75" />
              <circle cx="90" cy="63" r="5" fill="#FDA4AF" opacity="0.75" />
              <path
                d="M 60 64 Q 70 74 80 64"
                fill="none"
                stroke="#E11D48"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Waving Arms */}
              <path
                d="M 48 94 L 24 74"
                stroke="#FDE68A"
                strokeWidth="11"
                strokeLinecap="round"
              />
              <path
                d="M 92 94 L 116 74"
                stroke="#FDE68A"
                strokeWidth="11"
                strokeLinecap="round"
              />
              {/* Pink Dress */}
              <path
                d="M 48 86 L 92 86 L 104 134 L 36 134 Z"
                fill="#EC4899"
                stroke="#BE185D"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Shoes */}
              <rect x="52" y="134" width="12" height="18" rx="5" fill="#FDE68A" />
              <rect x="76" y="134" width="12" height="18" rx="5" fill="#FDE68A" />
              <ellipse cx="58" cy="153" rx="10" ry="6" fill="#2563EB" />
              <ellipse cx="82" cy="153" rx="10" ry="6" fill="#2563EB" />
            </svg>
          </div>
        </aside>

        {/* Center + Right: Giant Apple Tree + Baskets underneath */}
        <div className="relative flex h-full w-full flex-1 flex-col items-center justify-between min-h-0">
          {/* Apple Tree Stage */}
          <div
            style={{ containerType: 'size' }}
            className="relative flex w-full flex-1 items-center justify-center min-h-0"
          >
            <div
              style={{
                width: 'min(100cqw, calc(100cqh * 1.25), 550px)',
                aspectRatio: '5 / 4',
              }}
              className="relative"
            >
              {/* Tree Trunk & Lush Layered Foliage SVG */}
              <svg
                viewBox="0 0 500 400"
                className="pointer-events-none h-full w-full drop-shadow-[0_10px_10px_rgba(21,128,61,0.22)]"
              >
                {/* Sturdy Tree Trunk & Roots */}
                <path
                  d="M 212 240 C 216 305, 198 355, 175 388 L 325 388 C 302 355, 284 305, 288 240 Z"
                  fill="#92400E"
                  stroke="#78350F"
                  strokeWidth="6"
                  strokeLinejoin="round"
                />
                {/* Bark lines */}
                <path
                  d="M 238 265 C 235 310, 228 345, 218 378"
                  fill="none"
                  stroke="#78350F"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M 264 275 C 266 315, 272 348, 280 378"
                  fill="none"
                  stroke="#78350F"
                  strokeWidth="5"
                  strokeLinecap="round"
                />

                {/* Back Foliage Shadow Layer */}
                <circle cx="145" cy="195" r="88" fill="#15803D" />
                <circle cx="355" cy="195" r="88" fill="#15803D" />
                <circle cx="250" cy="115" r="102" fill="#15803D" />

                {/* Main Bright Green Canopy Lobes */}
                <circle cx="132" cy="182" r="82" fill="#22C55E" />
                <circle cx="368" cy="182" r="82" fill="#22C55E" />
                <circle cx="195" cy="110" r="88" fill="#22C55E" />
                <circle cx="305" cy="110" r="88" fill="#22C55E" />
                <circle cx="250" cy="175" r="108" fill="#22C55E" />

                {/* Sunlit Top Leaf Highlights */}
                <circle cx="195" cy="96" r="58" fill="#4ADE80" opacity="0.65" />
                <circle cx="305" cy="98" r="56" fill="#4ADE80" opacity="0.65" />
                <circle cx="252" cy="148" r="74" fill="#4ADE80" opacity="0.45" />
              </svg>

              {/* Interactive Apples Positioned on Canopy */}
              <div className="absolute inset-x-[6%] top-[2%] bottom-[22%]">
                {apples.map((apple) => {
                  if (apple.picked) return null;
                  const isDraggingThis = drag?.appleId === apple.id;
                  const isWrong = wrongAppleId === apple.id;

                  return (
                    <div
                      key={apple.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Quả táo chữ ${apple.letter}`}
                      onPointerDown={(e) => handleApplePointerDown(e, apple)}
                      onPointerMove={handleApplePointerMove}
                      onPointerUp={(e) => handleApplePointerUp(e, apple)}
                      onPointerCancel={(e) => handleApplePointerUp(e, apple)}
                      style={{
                        left: `${apple.xPct}%`,
                        top: `${apple.yPct}%`,
                        transform: isDraggingThis
                          ? `translate(calc(-50% + ${drag.dx}px), calc(-50% + ${drag.dy}px)) scale(1.18)`
                          : isWrong
                            ? 'translate(-50%, -50%) rotate(-10deg) scale(1.06)'
                            : 'translate(-50%, -50%)',
                        touchAction: 'none',
                      }}
                      className={`absolute h-13 w-13 sm:h-16 sm:w-16 md:h-18 md:w-18 lg:h-20 lg:w-20 cursor-grab active:cursor-grabbing select-none ${
                        isDraggingThis
                          ? 'z-50 transition-none'
                          : 'z-20 transition-transform duration-200 hover:scale-110'
                      }`}
                    >
                      <RedAppleSvg letter={apple.letter} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Victory Popup Card Centered Over Tree (Matches video end screen!) */}
            {allCompleted && (
              <div className="absolute inset-0 z-40 flex items-center justify-center p-3">
                <div className="flex max-w-md flex-col items-center rounded-[32px] border-4 border-amber-400 bg-white/98 px-6 py-5 sm:px-9 sm:py-7 text-center shadow-[0_14px_30px_rgba(15,23,42,0.3)]">
                  <div className="flex items-center justify-center gap-3">
                    <Star className="h-9 w-9 sm:h-11 sm:w-11 fill-amber-400 text-amber-500 drop-shadow" />
                    <div className="h-12 w-12 sm:h-14 sm:w-14">
                      <RedAppleSvg letter="" />
                    </div>
                    <Star className="h-9 w-9 sm:h-11 sm:w-11 fill-amber-400 text-amber-500 drop-shadow" />
                  </div>

                  <h2 className="font-heading mt-2 text-3xl sm:text-4xl font-extrabold text-emerald-700">
                    Bé giỏi quá!
                  </h2>
                  <p className="mt-1 text-base sm:text-lg font-bold text-slate-700">
                    Em đã hái đủ táo chữ{' '}
                    <strong className="font-letter text-xl text-rose-600">
                      {formatLettersWithAnd(targetLetters)}
                    </strong>
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleReplay}
                      className="flex cursor-pointer items-center gap-2 rounded-2xl border-4 border-emerald-700 bg-emerald-500 px-6 py-2.5 sm:px-7 sm:py-3 font-heading text-lg sm:text-xl font-extrabold text-white shadow-[0_5px_0_#047857] hover:bg-emerald-400 active:translate-y-0.5"
                    >
                      <RotateCcw className="h-5 w-5" />
                      Chơi lại
                    </button>

                    {onNextStage && (
                      <button
                        type="button"
                        onClick={() => {
                          audioManager.playClick();
                          audioManager.stopSpeaking();
                          onNextStage();
                        }}
                        className="flex cursor-pointer items-center gap-2 rounded-2xl border-4 border-blue-800 bg-blue-600 px-6 py-2.5 sm:px-7 sm:py-3 font-heading text-lg sm:text-xl font-extrabold text-white shadow-[0_5px_0_#1E3A8A] hover:bg-blue-500 active:translate-y-0.5"
                      >
                        <span>Sang Chặng 5</span>
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        audioManager.stopSpeaking();
                        onBackHub();
                      }}
                      className="flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-slate-300 bg-slate-100 px-5 py-2.5 sm:py-3 font-heading text-base sm:text-lg font-bold text-slate-700 hover:bg-slate-200"
                    >
                      Về Sảnh chính
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Woven Baskets Row Beneath the Tree */}
          <div
            className={`relative z-30 flex w-full flex-wrap items-end justify-around gap-2 sm:gap-6 px-2 pb-1 ${
              targetLetters.length === 2 ? 'max-w-2xl justify-between sm:px-8' : 'max-w-4xl'
            }`}
          >
            {targetLetters.map((ch) => (
              <WickerBasketCard
                key={ch}
                letter={ch}
                collectedCount={targetCountsByLetter.picked[ch] ?? 0}
                targetTotal={targetCountsByLetter.total[ch] ?? 0}
                highlighted={drag?.hoveredBasket === ch}
                justCollected={justCollectedBasket === ch}
                basketRef={(el) => {
                  basketElsRef.current[ch] = el;
                }}
                onTapBasket={() => audioManager.speakVi(`Giỏ chữ ${ch}`)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
