import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  Flower2,
  RotateCcw,
  Shuffle,
  Sliders,
  Star,
  Volume2,
} from 'lucide-react';
import { LessonConfig } from '../types/lesson';
import { ORIGINAL_10_VOWELS } from '../data/letterGamesData';
import { audioManager } from '../utils/audio';
import { ConfettiOverlay } from './ConfettiOverlay';

interface Stage9FlowerGardenProps {
  lesson: LessonConfig;
  onBackHub: () => void;
  onNextStage: () => void;
  onOpenVoiceSettings: () => void;
}

type GardenMode = 'lesson' | 'vowels10';

interface FlowerSlot {
  id: number; // 1..10
  char: string;
  isUpper: boolean;
  bloomed: boolean;
  paletteIdx: number;
}

interface FlowerPalette {
  petal: string;
  petalDark: string;
  ring: string;
  text: string;
}

const FLOWER_PALETTES: readonly FlowerPalette[] = [
  { petal: '#EC4899', petalDark: '#BE185D', ring: '#FBCFE8', text: '#9D174D' },
  { petal: '#FACC15', petalDark: '#CA8A04', ring: '#FEF08A', text: '#854D0E' },
  { petal: '#A855F7', petalDark: '#7E22CE', ring: '#E9D5FF', text: '#6B21A8' },
  { petal: '#38BDF8', petalDark: '#0284C7', ring: '#BAE6FD', text: '#0369A1' },
  { petal: '#FB923C', petalDark: '#C2410C', ring: '#FED7AA', text: '#9A3412' },
  { petal: '#EF4444', petalDark: '#B91C1C', ring: '#FECACA', text: '#991B1B' },
  { petal: '#F472B6', petalDark: '#DB2777', ring: '#FCE7F3', text: '#9D174D' },
  { petal: '#8B5CF6', petalDark: '#6D28D9', ring: '#DDD6FE', text: '#5B21B6' },
  { petal: '#0EA5E9', petalDark: '#0369A1', ring: '#BAE6FD', text: '#075985' },
  { petal: '#FDE047', petalDark: '#D97706', ring: '#FEF9C3', text: '#92400E' },
];

function buildGardenDeck(targetLetters: string[], mode: GardenMode): FlowerSlot[] {
  if (mode === 'vowels10') {
    return ORIGINAL_10_VOWELS.map((ch, idx) => ({
      id: idx + 1,
      char: ch,
      isUpper: false,
      bloomed: false,
      paletteIdx: idx % FLOWER_PALETTES.length,
    }));
  }

  const base = (targetLetters.length > 0 ? targetLetters : ['e', 'ê']).map((c) =>
    c.toLocaleLowerCase('vi-VN')
  );
  const pairs: Array<{ char: string; isUpper: boolean }> = [];
  for (const ch of base) {
    pairs.push({ char: ch, isUpper: false });
    pairs.push({ char: ch.toLocaleUpperCase('vi-VN'), isUpper: true });
  }

  return Array.from({ length: 10 }, (_, idx) => {
    const item = pairs[idx % pairs.length];
    return {
      id: idx + 1,
      char: item.char,
      isUpper: item.isUpper,
      bloomed: false,
      paletteIdx: idx % FLOWER_PALETTES.length,
    };
  });
}

function getFlowerSpeechText(flower: FlowerSlot): string {
  const lower = flower.char.toLocaleLowerCase('vi-VN');
  return flower.isUpper ? `Chữ ${lower} in hoa` : `Chữ ${lower}`;
}

const FlowerSvgGraphic: React.FC<{
  palette: FlowerPalette;
  label: string;
  bloomed: boolean;
  large?: boolean;
}> = ({ palette, label, bloomed, large = false }) => {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg
      viewBox="0 0 140 165"
      className={large ? 'h-40 w-36 sm:h-48 sm:w-44 drop-shadow-md' : 'h-full w-full drop-shadow-sm'}
      aria-hidden="true"
    >
      {/* Stem */}
      <path d="M 70 90 L 70 160" stroke="#15803D" strokeWidth="9" strokeLinecap="round" />
      {/* Left & Right Leaves */}
      <path
        d="M 68 134 C 42 122, 34 134, 48 145 C 57 150, 66 144, 68 134 Z"
        fill="#22C55E"
        stroke="#15803D"
        strokeWidth="2.5"
      />
      <path
        d="M 72 126 C 98 114, 106 126, 92 137 C 83 142, 74 136, 72 126 Z"
        fill="#22C55E"
        stroke="#15803D"
        strokeWidth="2.5"
      />

      {/* Petals */}
      <g transform="translate(70, 58)">
        {angles.map((deg) => (
          <ellipse
            key={deg}
            cx="0"
            cy="-31"
            rx="15"
            ry="22"
            transform={`rotate(${deg})`}
            fill={palette.petal}
            stroke={palette.petalDark}
            strokeWidth="2.5"
          />
        ))}
        {/* Center Disk */}
        <circle
          cx="0"
          cy="0"
          r="26"
          fill="#FFFFFF"
          stroke={bloomed ? palette.petalDark : '#CBD5E1'}
          strokeWidth="3.5"
        />
        {bloomed && (
          <circle
            cx="0"
            cy="0"
            r="22"
            fill="none"
            stroke={palette.ring}
            strokeWidth="3"
          />
        )}
        <text
          x="0"
          y="2"
          textAnchor="middle"
          dominantBaseline="central"
          className={bloomed ? 'font-letter' : 'font-heading'}
          fontSize={bloomed ? '30' : '24'}
          fontWeight="800"
          fill={bloomed ? palette.text : '#334155'}
        >
          {label}
        </text>
      </g>
    </svg>
  );
};

export const Stage9FlowerGarden: React.FC<Stage9FlowerGardenProps> = ({
  lesson,
  onBackHub,
  onNextStage,
  onOpenVoiceSettings,
}) => {
  const [gardenMode, setGardenMode] = useState<GardenMode>('lesson');
  const [flowers, setFlowers] = useState<FlowerSlot[]>(() =>
    buildGardenDeck(lesson.targetLetters, 'lesson')
  );
  const [activeFlowerId, setActiveFlowerId] = useState<number | null>(null);
  const [celebratingAll, setCelebratingAll] = useState(false);

  const timerRef = useRef<number | null>(null);
  const allCelebratedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    setGardenMode('lesson');
    setFlowers(buildGardenDeck(lesson.targetLetters, 'lesson'));
    setActiveFlowerId(null);
    setCelebratingAll(false);
    allCelebratedRef.current = false;
  }, [lesson.id, lesson.targetLetters]);

  useEffect(() => {
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      audioManager.speakVi(
        'Vườn hoa chữ cái! Bé hãy chọn một bông hoa mang số để khám phá chữ cái bí mật nhé!'
      );
    }, 240);

    return () => {
      clearTimer();
      audioManager.stopSpeaking();
    };
  }, [clearTimer]);

  const activeFlower = useMemo(
    () => flowers.find((f) => f.id === activeFlowerId) ?? null,
    [flowers, activeFlowerId]
  );

  const bloomedCount = useMemo(
    () => flowers.filter((f) => f.bloomed).length,
    [flowers]
  );

  const handleOpenFlower = useCallback(
    (flowerId: number) => {
      audioManager.unlock();
      audioManager.playPop();

      const target = flowers.find((f) => f.id === flowerId);
      if (!target) return;

      const updated = flowers.map((f) =>
        f.id === flowerId ? { ...f, bloomed: true } : f
      );
      setFlowers(updated);
      setActiveFlowerId(flowerId);

      clearTimer();
      timerRef.current = window.setTimeout(() => {
        audioManager.speakVi(getFlowerSpeechText(target));
      }, 120);
    },
    [flowers, clearTimer]
  );

  const handleClosePopup = useCallback(() => {
    audioManager.playClick();
    setActiveFlowerId(null);

    if (bloomedCount === flowers.length && !allCelebratedRef.current) {
      allCelebratedRef.current = true;
      setCelebratingAll(true);
      audioManager.playCelebration();
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        audioManager.speakVi(
          'Hoan hô! Vườn hoa chữ cái đã nở rộ rực rỡ rồi, cả lớp giỏi quá!',
          undefined,
          undefined,
          'character'
        );
      }, 200);
    }
  }, [bloomedCount, flowers.length, clearTimer]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (activeFlowerId !== null) {
        if (e.key === 'Escape') {
          handleClosePopup();
        }
        return;
      }
      if (e.key >= '1' && e.key <= '9') {
        handleOpenFlower(Number(e.key));
      } else if (e.key === '0') {
        handleOpenFlower(10);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeFlowerId, handleClosePopup, handleOpenFlower]);

  const handleSwitchMode = (nextMode: GardenMode) => {
    clearTimer();
    audioManager.playClick();
    audioManager.stopSpeaking();
    setGardenMode(nextMode);
    setFlowers(buildGardenDeck(lesson.targetLetters, nextMode));
    setActiveFlowerId(null);
    setCelebratingAll(false);
    allCelebratedRef.current = false;
  };

  const handleShuffle = () => {
    clearTimer();
    audioManager.playClick();
    setFlowers((prev) => {
      const chars = prev.map((f) => ({ char: f.char, isUpper: f.isUpper }));
      for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = chars[i];
        chars[i] = chars[j];
        chars[j] = tmp;
      }
      return prev.map((f, idx) => ({
        ...f,
        char: chars[idx].char,
        isUpper: chars[idx].isUpper,
        bloomed: false,
      }));
    });
    setActiveFlowerId(null);
    setCelebratingAll(false);
    allCelebratedRef.current = false;
  };

  const handleToggleAll = () => {
    clearTimer();
    audioManager.playClick();
    const shouldHideAll = bloomedCount === flowers.length;
    setFlowers((prev) => prev.map((f) => ({ ...f, bloomed: !shouldHideAll })));
    setActiveFlowerId(null);
    if (shouldHideAll) {
      setCelebratingAll(false);
      allCelebratedRef.current = false;
    } else {
      allCelebratedRef.current = true;
      setCelebratingAll(true);
      audioManager.playCelebration();
      audioManager.speakVi(
        'Hoan hô! Vườn hoa chữ cái đã nở rộ rực rỡ rồi, cả lớp giỏi quá!',
        undefined,
        undefined,
        'character'
      );
    }
  };

  const activePalette = activeFlower
    ? FLOWER_PALETTES[activeFlower.paletteIdx]
    : FLOWER_PALETTES[0];

  return (
    <div className="safe-pad relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-b from-sky-400 via-sky-200 to-sky-100 px-3 py-2 sm:px-6 sm:py-3 select-none">
      <ConfettiOverlay active={celebratingAll} />

      {/* Sunny Meadow Backdrop (matches Video 1) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-6 top-16 h-12 w-28 rounded-full bg-white/80 blur-[1px]" />
        <div className="absolute left-24 top-20 h-10 w-20 rounded-full bg-white/75" />
        <div className="absolute right-12 top-14 h-14 w-32 rounded-full bg-white/80 blur-[1px]" />
        <div className="absolute right-6 top-8 h-16 w-16 rounded-full bg-amber-300/80 border-4 border-amber-200 shadow-lg" />
        {/* Green Grass Half */}
        <div className="absolute inset-x-0 bottom-0 h-[56%] bg-gradient-to-b from-lime-400 via-green-400 to-emerald-500" />
        <div className="absolute -left-16 bottom-[51%] h-16 w-[65%] rounded-[100%] bg-lime-400" />
        <div className="absolute -right-16 bottom-[50%] h-16 w-[65%] rounded-[100%] bg-lime-400" />
      </div>

      {/* Top Header */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            clearTimer();
            audioManager.playClick();
            audioManager.stopSpeaking();
            onBackHub();
          }}
          className="flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-2xl border-3 border-slate-300 bg-white px-3.5 py-1.5 font-heading text-sm sm:text-base font-extrabold text-slate-700 shadow-[0_4px_0_#CBD5E1] hover:bg-slate-50 active:translate-y-0.5"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Sảnh chính</span>
        </button>

        <div className="flex items-center gap-2 rounded-full border-4 border-pink-400 bg-amber-50 px-4 py-1 sm:px-6 sm:py-1.5 shadow-[0_4px_0_rgba(236,72,153,0.28)]">
          <Flower2 className="h-5 w-5 sm:h-6 sm:w-6 text-pink-500" />
          <h1 className="font-heading text-base sm:text-xl md:text-2xl font-extrabold text-pink-700">
            Chặng 9: Vườn Hoa Chữ Cái
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-2xl border-3 border-amber-400 bg-amber-50 px-3 py-1 font-heading text-xs sm:text-base font-extrabold text-amber-900">
            <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-amber-400 text-amber-500" />
            <span>Đã nở: {bloomedCount} / 10</span>
          </div>

          <button
            type="button"
            onClick={onOpenVoiceSettings}
            aria-label="Cài đặt giọng nói"
            className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-2xl border-3 border-pink-300 bg-pink-500 text-white shadow-[0_4px_0_#BE185D] hover:bg-pink-400"
          >
            <Sliders className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Instruction Pill */}
      <div className="relative z-20 mx-auto mt-1 flex items-center gap-2 rounded-full border-2 border-white/90 bg-white/90 px-4 py-1 shadow-sm">
        <button
          type="button"
          onClick={() => {
            audioManager.playClick();
            audioManager.speakVi(
              'Vườn hoa chữ cái! Bé hãy chọn một bông hoa mang số để khám phá chữ cái bí mật nhé!'
            );
          }}
          aria-label="Đọc lại hướng dẫn"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-400"
        >
          <Volume2 className="h-4 w-4" />
        </button>
        <p className="font-heading text-xs sm:text-sm md:text-base font-bold text-sky-950">
          Bé hãy chọn một bông hoa mang số để khám phá chữ cái bí mật nhé!
        </p>
      </div>

      {/* 2x5 Flower Garden Grid */}
      <main className="relative z-10 mx-auto my-1 grid w-full max-w-5xl flex-1 min-h-0 grid-cols-5 grid-rows-2 gap-2 sm:gap-3.5 py-1">
        {flowers.map((flower) => {
          const pal = FLOWER_PALETTES[flower.paletteIdx];
          return (
            <button
              key={flower.id}
              type="button"
              onClick={() => handleOpenFlower(flower.id)}
              aria-label={
                flower.bloomed
                  ? `Bông hoa số ${flower.id}, chữ ${flower.char}`
                  : `Bông hoa số ${flower.id}`
              }
              className={`group relative flex min-h-[64px] min-w-[64px] touch-manipulation cursor-pointer flex-col items-center justify-center rounded-3xl p-1 transition duration-150 hover:-translate-y-1 active:translate-y-0.5 ${
                flower.bloomed
                  ? 'bg-white/35 ring-2 ring-white/75'
                  : 'hover:bg-white/25'
              }`}
            >
              <div className="h-full max-h-[175px] w-full flex items-center justify-center">
                <FlowerSvgGraphic
                  palette={pal}
                  label={flower.bloomed ? flower.char : String(flower.id)}
                  bloomed={flower.bloomed}
                />
              </div>
              {flower.bloomed && (
                <span className="absolute right-1.5 top-1.5 rounded-full bg-white/90 px-2 py-0.5 font-heading text-[10px] sm:text-xs font-extrabold text-slate-600 shadow-xs">
                  #{flower.id}
                </span>
              )}
            </button>
          );
        })}
      </main>

      {/* Bottom Mode & Teacher Dock */}
      <footer className="relative z-20 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-white/90 bg-white/92 px-3 py-1.5 sm:px-4 shadow-md backdrop-blur">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleSwitchMode('lesson')}
            className={`min-h-[44px] cursor-pointer rounded-xl border-2 px-3 py-1 font-heading text-xs sm:text-sm font-extrabold transition ${
              gardenMode === 'lesson'
                ? 'border-blue-700 bg-blue-600 text-white shadow-[0_3px_0_#1E3A8A]'
                : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Theo bài học ({lesson.targetLetters.join(', ')})
          </button>

          <button
            type="button"
            onClick={() => handleSwitchMode('vowels10')}
            className={`min-h-[44px] cursor-pointer rounded-xl border-2 px-3 py-1 font-heading text-xs sm:text-sm font-extrabold transition ${
              gardenMode === 'vowels10'
                ? 'border-pink-700 bg-pink-600 text-white shadow-[0_3px_0_#9D174D]'
                : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            10 nguyên âm gốc
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleShuffle}
            className="flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl border-2 border-amber-500 bg-amber-400 px-3 py-1 font-heading text-xs sm:text-sm font-extrabold text-amber-950 shadow-[0_3px_0_#B45309] hover:bg-amber-300"
          >
            <Shuffle className="h-4 w-4" />
            <span>Trộn hoa</span>
          </button>

          <button
            type="button"
            onClick={handleToggleAll}
            className="flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl border-2 border-violet-600 bg-violet-500 px-3 py-1 font-heading text-xs sm:text-sm font-extrabold text-white shadow-[0_3px_0_#5B21B6] hover:bg-violet-400"
          >
            {bloomedCount === flowers.length ? (
              <>
                <RotateCcw className="h-4 w-4" />
                <span>Úp lại</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span>Mở tất cả</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              clearTimer();
              audioManager.playClick();
              audioManager.stopSpeaking();
              onNextStage();
            }}
            className="flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl border-2 border-emerald-700 bg-emerald-500 px-4 py-1 font-heading text-xs sm:text-sm font-extrabold text-white shadow-[0_3px_0_#047857] hover:bg-emerald-400"
          >
            <span>Sang Chặng 10</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </footer>

      {/* Center Flower Reveal Modal (Matches Video 1 Popup) */}
      {activeFlower && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="flex w-full max-w-lg flex-col items-center rounded-[32px] border-4 border-amber-400 bg-white p-5 sm:p-6 text-center shadow-2xl">
            <div className="flex items-center gap-2 rounded-full border-2 border-sky-200 bg-sky-50 px-4 py-1">
              <Volume2 className="h-5 w-5 text-sky-600" />
              <h2 className="font-heading text-lg sm:text-2xl font-extrabold text-blue-900">
                Bông hoa số {activeFlower.id} — Chữ{' '}
                <span className="font-letter text-pink-600">{activeFlower.char}</span>
              </h2>
            </div>

            {/* Sunny Garden Card */}
            <div className="relative mt-4 flex h-56 sm:h-64 w-full flex-col items-center justify-center overflow-hidden rounded-[24px] border-4 border-emerald-300 bg-gradient-to-b from-sky-300 via-sky-100 to-lime-300 shadow-inner">
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-lime-400 to-emerald-500" />
              <div className="pointer-events-none absolute left-6 top-5 h-10 w-20 rounded-full bg-white/80" />
              <div className="pointer-events-none absolute right-6 top-4 h-12 w-12 rounded-full bg-amber-300 border-2 border-amber-200" />

              <div className="relative z-10 animate-gentle-sway">
                <FlowerSvgGraphic
                  palette={activePalette}
                  label={activeFlower.char}
                  bloomed
                  large
                />
              </div>

              <span className="relative z-10 -mt-2 rounded-full border-2 border-white bg-white/90 px-3.5 py-0.5 font-heading text-xs sm:text-sm font-extrabold text-slate-700 shadow-xs">
                {activeFlower.isUpper ? 'Chữ in hoa' : 'Chữ in thường'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex w-full flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  audioManager.playClick();
                  audioManager.speakVi(getFlowerSpeechText(activeFlower));
                }}
                className="flex min-h-[64px] min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-2xl border-4 border-sky-700 bg-sky-500 px-6 py-2 font-heading text-lg sm:text-xl font-extrabold text-white shadow-[0_5px_0_#0369A1] hover:bg-sky-400 active:translate-y-0.5"
              >
                <Volume2 className="h-6 w-6" />
                <span>Đọc lại</span>
              </button>

              <button
                type="button"
                onClick={handleClosePopup}
                className="flex min-h-[64px] min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-2xl border-4 border-emerald-700 bg-emerald-500 px-7 py-2 font-heading text-lg sm:text-xl font-extrabold text-white shadow-[0_5px_0_#047857] hover:bg-emerald-400 active:translate-y-0.5"
              >
                <Check className="h-6 w-6" />
                <span>Đóng</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
