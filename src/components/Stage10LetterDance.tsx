import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Hand,
  Music,
  Play,
  Sliders,
  Sparkles,
  Square,
  ThumbsUp,
  UserCheck,
  Volume2,
} from 'lucide-react';
import { LessonConfig } from '../types/lesson';
import { audioManager } from '../utils/audio';
import { ConfettiOverlay } from './ConfettiOverlay';

interface Stage10LetterDanceProps {
  lesson: LessonConfig;
  onBackHub: () => void;
  onNextStage: () => void;
  onOpenVoiceSettings: () => void;
}

type DancePose = 'idle' | 'point' | 'hooray' | 'thumbsup' | 'wave';

interface LetterColorTheme {
  fillTop: string;
  fillBot: string;
  extrude: string;
  stroke: string;
  shoe: string;
}

const LETTER_THEMES: readonly LetterColorTheme[] = [
  { fillTop: '#38BDF8', fillBot: '#0284C7', extrude: '#0369A1', stroke: '#075985', shoe: '#0284C7' },
  { fillTop: '#F472B6', fillBot: '#DB2777', extrude: '#9D174D', stroke: '#831843', shoe: '#DB2777' },
  { fillTop: '#34D399', fillBot: '#059669', extrude: '#047857', stroke: '#065F46', shoe: '#059669' },
  { fillTop: '#A78BFA', fillBot: '#7C3AED', extrude: '#5B21B6', stroke: '#4C1D95', shoe: '#7C3AED' },
];

const DANCE_MOVES: ReadonlyArray<{
  pose: Exclude<DancePose, 'idle'>;
  label: string;
  subLabel: string;
  btnCls: string;
}> = [
  {
    pose: 'point',
    label: '1. Làm quen',
    subLabel: 'Tớ là chữ cái',
    btnCls: 'border-sky-700 bg-sky-500 shadow-[0_5px_0_#0369A1] hover:bg-sky-400',
  },
  {
    pose: 'hooray',
    label: '2. Tỏa sáng',
    subLabel: 'Đọc vang cùng tớ',
    btnCls: 'border-amber-600 bg-amber-500 shadow-[0_5px_0_#B45309] hover:bg-amber-400',
  },
  {
    pose: 'thumbsup',
    label: '3. Khen bé giỏi',
    subLabel: 'Giơ ngón cái Like',
    btnCls: 'border-emerald-700 bg-emerald-500 shadow-[0_5px_0_#047857] hover:bg-emerald-400',
  },
  {
    pose: 'wave',
    label: '4. Vẫy chào',
    subLabel: 'Hẹn gặp lại nhé',
    btnCls: 'border-pink-700 bg-pink-500 shadow-[0_5px_0_#9D174D] hover:bg-pink-400',
  },
];

function getMoveSpeech(pose: Exclude<DancePose, 'idle'>, rawLetter: string): string {
  const low = rawLetter.toLocaleLowerCase('vi-VN');
  switch (pose) {
    case 'point':
      return `Xin chào các bạn nhỏ! Tớ là chữ ${low} đây!`;
    case 'hooray':
      return `Cùng dang hai tay và đọc vang chữ ${low} với tớ nào!`;
    case 'thumbsup':
      return 'Tuyệt vời! Cả lớp đọc to và rõ quá, tớ khen cả lớp mình nhé!';
    case 'wave':
      return 'Tạm biệt các bạn nhỏ đáng yêu! Nhớ gọi đúng tên tớ nhé!';
  }
}

const CartoonGlove: React.FC<{ cx: number; cy: number; flip?: boolean; thumbsUp?: boolean }> = ({
  cx,
  cy,
  flip = false,
  thumbsUp = false,
}) => (
  <g transform={`translate(${cx}, ${cy}) scale(${flip ? -1 : 1}, 1)`}>
    {thumbsUp ? (
      <>
        <ellipse cx="0" cy="4" rx="14" ry="13" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3.5" />
        <path
          d="M -4 -5 C -5 -22, 6 -24, 7 -6"
          fill="#FFFFFF"
          stroke="#1E293B"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <line x1="-5" y1="0" x2="4" y2="0" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="-5" y1="6" x2="4" y2="6" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
      </>
    ) : (
      <>
        <ellipse cx="0" cy="0" rx="15" ry="13" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3.5" />
        <circle cx="-11" cy="-9" r="5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
        <circle cx="-2" cy="-12" r="5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
        <circle cx="8" cy="-10" r="5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
        <circle cx="13" cy="-2" r="4.5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
      </>
    )}
  </g>
);

const DancingLetterMascot: React.FC<{
  displayChar: string;
  pose: DancePose;
  speaking: boolean;
  theme: LetterColorTheme;
}> = ({ displayChar, pose, speaking, theme }) => {
  const showRays = pose === 'hooray' || pose === 'wave';
  const happyClosedEyes = pose === 'hooray';
  const bodyAnimClass =
    pose === 'hooray'
      ? 'animate-bounce'
      : speaking || pose !== 'idle'
        ? 'animate-gentle-sway'
        : 'animate-float-slow';

  const gradId = `mascotGrad-${displayChar.charCodeAt(0)}`;

  return (
    <svg viewBox="0 0 440 380" className="h-full w-full max-h-[380px] select-none" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.fillTop} />
          <stop offset="100%" stopColor={theme.fillBot} />
        </linearGradient>
      </defs>

      {/* Sunny Meadow Stage Backdrop (matches Video 2) */}
      <rect x="0" y="0" width="440" height="380" rx="26" fill="#38BDF8" />
      <rect x="0" y="0" width="440" height="230" rx="26" fill="#7DD3FC" opacity="0.45" />
      {/* Clouds */}
      <g fill="#FFFFFF" opacity="0.92">
        <ellipse cx="75" cy="54" rx="34" ry="16" />
        <ellipse cx="95" cy="46" rx="22" ry="15" />
        <ellipse cx="360" cy="52" rx="36" ry="17" />
        <ellipse cx="340" cy="44" rx="20" ry="14" />
      </g>
      {/* Rolling Hills */}
      <path d="M 0 245 Q 110 212 220 240 T 440 232 L 440 380 L 0 380 Z" fill="#A3E635" />
      <path d="M 0 272 Q 130 248 250 272 T 440 264 L 440 380 L 0 380 Z" fill="#4ADE80" />
      {/* Left & Right Trees */}
      <g>
        <rect x="28" y="198" width="18" height="72" rx="6" fill="#92400E" />
        <circle cx="37" cy="180" r="34" fill="#22C55E" />
        <circle cx="20" cy="192" r="24" fill="#16A34A" />
        <circle cx="56" cy="192" r="24" fill="#4ADE80" />
      </g>
      <g>
        <rect x="392" y="196" width="18" height="72" rx="6" fill="#92400E" />
        <circle cx="401" cy="178" r="34" fill="#22C55E" />
        <circle cx="383" cy="190" r="24" fill="#4ADE80" />
        <circle cx="418" cy="190" r="24" fill="#16A34A" />
      </g>
      {/* Meadow Daisies */}
      {[
        { x: 54, y: 330 },
        { x: 88, y: 346 },
        { x: 356, y: 342 },
        { x: 392, y: 326 },
      ].map((fl, i) => (
        <g key={i} transform={`translate(${fl.x}, ${fl.y})`}>
          <circle cx="0" cy="-6" r="5" fill="#FFFFFF" />
          <circle cx="6" cy="0" r="5" fill="#FFFFFF" />
          <circle cx="0" cy="6" r="5" fill="#FFFFFF" />
          <circle cx="-6" cy="0" r="5" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="4" fill="#FACC15" />
        </g>
      ))}

      {/* Ground Shadow */}
      <ellipse cx="220" cy="342" rx="76" ry="14" fill="#15803D" opacity="0.35" />

      {/* Animated Character */}
      <g className={bodyAnimClass} style={{ transformOrigin: '220px 260px' }}>
        {/* Yellow Excitement Rays */}
        {showRays && (
          <g fill="#FACC15" stroke="#CA8A04" strokeWidth="2.5">
            <path d="M 155 44 L 138 18 L 154 14 Z" />
            <path d="M 220 34 L 214 6 L 228 6 Z" />
            <path d="M 285 44 L 302 18 L 286 14 Z" />
          </g>
        )}

        {/* Legs & Sneakers */}
        <g>
          <path d="M 188 286 L 182 326" stroke="#0F172A" strokeWidth="9" strokeLinecap="round" />
          <path d="M 252 286 L 258 326" stroke="#0F172A" strokeWidth="9" strokeLinecap="round" />
          {/* Left Sneaker */}
          <path
            d="M 156 328 C 156 314, 194 314, 196 328 L 196 336 L 156 336 Z"
            fill={theme.shoe}
            stroke="#0F172A"
            strokeWidth="3.5"
          />
          <rect x="155" y="333" width="42" height="7" rx="3" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
          {/* Right Sneaker */}
          <path
            d="M 244 328 C 246 314, 284 314, 284 328 L 284 336 L 244 336 Z"
            fill={theme.shoe}
            stroke="#0F172A"
            strokeWidth="3.5"
          />
          <rect x="243" y="333" width="42" height="7" rx="3" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
        </g>

        {/* Left & Right Arms depending on Pose */}
        {pose === 'idle' && (
          <>
            <path d="M 152 220 Q 124 236 122 260" fill="none" stroke="#0F172A" strokeWidth="8.5" strokeLinecap="round" />
            <CartoonGlove cx={121} cy={264} />
            <path d="M 288 220 Q 316 236 318 260" fill="none" stroke="#0F172A" strokeWidth="8.5" strokeLinecap="round" />
            <CartoonGlove cx={319} cy={264} flip />
          </>
        )}

        {pose === 'point' && (
          <>
            <path d="M 152 218 Q 120 232 124 258" fill="none" stroke="#0F172A" strokeWidth="8.5" strokeLinecap="round" />
            <CartoonGlove cx={125} cy={262} />
            <path d="M 288 214 Q 314 206 276 226" fill="none" stroke="#0F172A" strokeWidth="8.5" strokeLinecap="round" />
            <CartoonGlove cx={270} cy={226} flip />
          </>
        )}

        {pose === 'hooray' && (
          <>
            <path d="M 152 208 Q 112 184 102 152" fill="none" stroke="#0F172A" strokeWidth="8.5" strokeLinecap="round" />
            <CartoonGlove cx={100} cy={146} />
            <path d="M 288 208 Q 328 184 338 152" fill="none" stroke="#0F172A" strokeWidth="8.5" strokeLinecap="round" />
            <CartoonGlove cx={340} cy={146} flip />
          </>
        )}

        {pose === 'thumbsup' && (
          <>
            <path d="M 152 218 Q 134 232 164 234" fill="none" stroke="#0F172A" strokeWidth="8.5" strokeLinecap="round" />
            <CartoonGlove cx={168} cy={230} thumbsUp />
            <path d="M 288 218 Q 306 232 276 234" fill="none" stroke="#0F172A" strokeWidth="8.5" strokeLinecap="round" />
            <CartoonGlove cx={272} cy={230} flip thumbsUp />
          </>
        )}

        {pose === 'wave' && (
          <>
            <g className="animate-wave-hand">
              <path d="M 152 204 Q 114 166 112 126" fill="none" stroke="#0F172A" strokeWidth="8.5" strokeLinecap="round" />
              <CartoonGlove cx={112} cy={118} />
            </g>
            <path d="M 288 220 Q 322 234 326 258" fill="none" stroke="#0F172A" strokeWidth="8.5" strokeLinecap="round" />
            <CartoonGlove cx={326} cy={262} flip />
          </>
        )}

        {/* 3D Extruded Letter Body */}
        <text
          x="220"
          y="234"
          textAnchor="middle"
          dominantBaseline="central"
          className="font-letter"
          fontSize="195"
          fontWeight="800"
          fill={theme.extrude}
          stroke={theme.stroke}
          strokeWidth="12"
          strokeLinejoin="round"
        >
          {displayChar}
        </text>
        <text
          x="220"
          y="224"
          textAnchor="middle"
          dominantBaseline="central"
          className="font-letter"
          fontSize="195"
          fontWeight="800"
          fill={`url(#${gradId})`}
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinejoin="round"
        >
          {displayChar}
        </text>

        {/* Cute Expressive Face Overlay */}
        <g transform="translate(220, 224)">
          {/* Eyes */}
          {happyClosedEyes ? (
            <>
              <path d="M -38 -8 Q -28 -22 -18 -8" fill="none" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M 18 -8 Q 28 -22 38 -8" fill="none" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="-28" cy="-10" r="13" fill="#0F172A" stroke="#FFFFFF" strokeWidth="2.5" />
              <circle cx="-24" cy="-14" r="4.5" fill="#FFFFFF" />
              <circle cx="-32" cy="-6" r="2" fill="#FFFFFF" />

              <circle cx="28" cy="-10" r="13" fill="#0F172A" stroke="#FFFFFF" strokeWidth="2.5" />
              <circle cx="32" cy="-14" r="4.5" fill="#FFFFFF" />
              <circle cx="24" cy="-6" r="2" fill="#FFFFFF" />
            </>
          )}

          {/* Rosy Cheeks */}
          <ellipse cx="-44" cy="10" rx="11" ry="6.5" fill="#FDA4AF" opacity="0.9" />
          <ellipse cx="44" cy="10" rx="11" ry="6.5" fill="#FDA4AF" opacity="0.9" />

          {/* Happy Mouth + Tongue */}
          <path
            d="M -18 10 Q 0 32 18 10 Z"
            fill="#9F1239"
            stroke="#0F172A"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <ellipse cx="0" cy="20" rx="9" ry="5" fill="#FB7185" />
        </g>
      </g>
    </svg>
  );
};

export const Stage10LetterDance: React.FC<Stage10LetterDanceProps> = ({
  lesson,
  onBackHub,
  onNextStage,
  onOpenVoiceSettings,
}) => {
  const targetLetters = useMemo(() => {
    return lesson.targetLetters.length > 0
      ? lesson.targetLetters.map((c) => c.toLocaleLowerCase('vi-VN'))
      : ['u', 'ư'];
  }, [lesson.targetLetters]);

  const [letterIdx, setLetterIdx] = useState(0);
  const [isUpper, setIsUpper] = useState(false);
  const [pose, setPose] = useState<DancePose>('idle');
  const [autoDancing, setAutoDancing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [speechBubble, setSpeechBubble] = useState<string>(
    'Bé hãy bấm các điệu nhảy để cùng bạn chữ cái vui múa nhé!'
  );

  const timerRef = useRef<number | null>(null);
  const autoSeqRef = useRef<boolean>(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopAutoDance = useCallback(() => {
    autoSeqRef.current = false;
    setAutoDancing(false);
    clearTimer();
  }, [clearTimer]);

  const activeLower = targetLetters[letterIdx] ?? targetLetters[0];
  const displayChar = isUpper ? activeLower.toLocaleUpperCase('vi-VN') : activeLower;
  const activeTheme = LETTER_THEMES[letterIdx % LETTER_THEMES.length];

  useEffect(() => {
    setLetterIdx(0);
    setIsUpper(false);
    setPose('idle');
    stopAutoDance();
  }, [lesson.id, targetLetters, stopAutoDance]);

  useEffect(() => {
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      setSpeaking(true);
      audioManager.speakVi(
        'Vũ điệu bạn chữ! Bé hãy chọn các điệu nhảy vui nhộn và đọc vang cùng bạn chữ cái nhé!',
        undefined,
        () => setSpeaking(false),
        'teacher'
      );
    }, 250);

    return () => {
      stopAutoDance();
      audioManager.stopSpeaking();
    };
  }, [clearTimer, stopAutoDance]);

  const triggerMove = useCallback(
    (moveIdx: number, continueChain = false) => {
      const move = DANCE_MOVES[moveIdx];
      if (!move) return;
      if (!continueChain) {
        stopAutoDance();
      }
      const line = getMoveSpeech(move.pose, activeLower);
      setPose(move.pose);
      setSpeechBubble(line);
      setSpeaking(true);
      audioManager.unlock();
      audioManager.playDanceBeat(moveIdx);

      clearTimer();
      timerRef.current = window.setTimeout(() => {
        audioManager.speakVi(
          line,
          undefined,
          () => {
            setSpeaking(false);
            if (continueChain && autoSeqRef.current) {
              const nextIdx = moveIdx + 1;
              if (nextIdx < DANCE_MOVES.length) {
                clearTimer();
                timerRef.current = window.setTimeout(() => {
                  if (autoSeqRef.current) {
                    triggerMove(nextIdx, true);
                  }
                }, 360);
              } else {
                autoSeqRef.current = false;
                setAutoDancing(false);
              }
            }
          },
          'character'
        );
      }, 160);
    },
    [activeLower, clearTimer, stopAutoDance]
  );

  const handleToggleAutoDance = () => {
    if (autoDancing) {
      audioManager.playClick();
      audioManager.stopSpeaking();
      setSpeaking(false);
      stopAutoDance();
      return;
    }
    audioManager.unlock();
    audioManager.playClick();
    autoSeqRef.current = true;
    setAutoDancing(true);
    triggerMove(0, true);
  };

  return (
    <div className="safe-pad relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-b from-sky-300 via-emerald-50 to-lime-100 px-3 py-2 sm:px-6 sm:py-3 select-none">
      <ConfettiOverlay active={pose === 'hooray' && autoDancing} />

      {/* Header */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            stopAutoDance();
            audioManager.playClick();
            audioManager.stopSpeaking();
            onBackHub();
          }}
          className="flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-2xl border-3 border-slate-300 bg-white px-3.5 py-1.5 font-heading text-sm sm:text-base font-extrabold text-slate-700 shadow-[0_4px_0_#CBD5E1] hover:bg-slate-50 active:translate-y-0.5"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Sảnh chính</span>
        </button>

        <div className="flex items-center gap-2 rounded-full border-4 border-sky-500 bg-white px-4 py-1 sm:px-6 sm:py-1.5 shadow-[0_4px_0_rgba(2,132,199,0.28)]">
          <Music className="h-5 w-5 sm:h-6 sm:w-6 text-sky-600" />
          <h1 className="font-heading text-base sm:text-xl md:text-2xl font-extrabold text-sky-900">
            Chặng 10: Vũ Điệu Bạn Chữ
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              stopAutoDance();
              audioManager.playClick();
              setIsUpper((prev) => !prev);
            }}
            className="min-h-[44px] cursor-pointer rounded-2xl border-3 border-amber-500 bg-amber-100 px-3.5 py-1 font-heading text-xs sm:text-sm font-extrabold text-amber-950 hover:bg-amber-200"
          >
            {isUpper ? 'Đang xem: IN HOA' : 'Đang xem: in thường'}
          </button>

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

      {/* Letter Selector Bar */}
      <div className="relative z-20 mx-auto mt-1 flex flex-wrap items-center justify-center gap-2">
        {targetLetters.map((ch, idx) => {
          const active = idx === letterIdx;
          return (
            <button
              key={ch}
              type="button"
              onClick={() => {
                stopAutoDance();
                audioManager.playClick();
                audioManager.stopSpeaking();
                setSpeaking(false);
                setLetterIdx(idx);
                setPose('idle');
                setSpeechBubble(`Xin chào các bạn nhỏ! Tớ là chữ ${ch} đây!`);
              }}
              className={`font-letter min-h-[44px] min-w-[54px] cursor-pointer rounded-2xl border-3 px-4 py-1 text-xl font-extrabold transition ${
                active
                  ? 'border-blue-800 bg-blue-600 text-white shadow-[0_4px_0_#1E3A8A]'
                  : 'border-white bg-white/90 text-blue-900 hover:bg-white'
              }`}
            >
              {isUpper ? ch.toLocaleUpperCase('vi-VN') : ch}
            </button>
          );
        })}
      </div>

      {/* Main Split Stage */}
      <main className="relative z-10 mx-auto my-1.5 grid w-full max-w-6xl flex-1 min-h-0 grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-5">
        {/* Left: Animated Meadow Stage */}
        <section className="flex flex-col items-center justify-between rounded-[28px] border-4 border-white bg-white/90 p-3 shadow-[0_8px_0_rgba(14,165,233,0.18)] lg:col-span-7 min-h-0">
          <div className="flex w-full flex-1 min-h-0 items-center justify-center overflow-hidden rounded-[22px] border-3 border-sky-200 bg-sky-100">
            <DancingLetterMascot
              displayChar={displayChar}
              pose={pose}
              speaking={speaking}
              theme={activeTheme}
            />
          </div>

          <div className="mt-2 flex w-full items-center gap-2.5 rounded-2xl border-2 border-amber-300 bg-amber-50 px-3.5 py-2">
            <button
              type="button"
              onClick={() => {
                if (pose === 'idle') {
                  triggerMove(0, false);
                } else {
                  audioManager.playClick();
                  setSpeaking(true);
                  audioManager.speakVi(
                    speechBubble,
                    undefined,
                    () => setSpeaking(false),
                    'character'
                  );
                }
              }}
              aria-label="Nghe lại lời bạn chữ"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-amber-400 text-amber-950 hover:bg-amber-300"
            >
              <Volume2 className="h-5 w-5" />
            </button>
            <p className="font-heading text-sm sm:text-base font-extrabold text-amber-950 leading-snug">
              {speechBubble}
            </p>
          </div>
        </section>

        {/* Right: 4 Big Dance Controls + Auto Dance */}
        <section className="flex flex-col justify-between gap-2.5 rounded-[28px] border-4 border-amber-400 bg-white/95 p-3.5 sm:p-4 shadow-[0_8px_0_rgba(217,119,6,0.2)] lg:col-span-5">
          <div>
            <h2 className="font-heading text-lg sm:text-xl font-extrabold text-blue-950">
              Bảng Điều Khiển Nhảy Múa
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-600">
              Bé bấm chọn từng động tác để nhảy và đọc theo bạn chữ cái!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 my-auto">
            {DANCE_MOVES.map((mv, idx) => {
              const isSelected = pose === mv.pose;
              const MoveIcon =
                mv.pose === 'point'
                  ? UserCheck
                  : mv.pose === 'hooray'
                    ? Sparkles
                    : mv.pose === 'thumbsup'
                      ? ThumbsUp
                      : Hand;
              return (
                <button
                  key={mv.pose}
                  type="button"
                  onClick={() => triggerMove(idx, false)}
                  className={`flex min-h-[64px] cursor-pointer items-center justify-between gap-3 rounded-2xl border-3 px-4 py-2 text-left text-white transition active:translate-y-0.5 ${
                    mv.btnCls
                  } ${isSelected ? 'ring-4 ring-amber-300 scale-[1.01]' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/25">
                      <MoveIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-heading text-base sm:text-lg font-extrabold leading-tight">
                        {mv.label}
                      </div>
                      <div className="text-xs font-bold text-white/90">{mv.subLabel}</div>
                    </div>
                  </div>
                  <Volume2 className="h-5 w-5 shrink-0 opacity-90" />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleToggleAutoDance}
            className={`flex min-h-[64px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl border-4 px-5 py-2 font-heading text-lg sm:text-xl font-extrabold text-white transition active:translate-y-0.5 ${
              autoDancing
                ? 'border-rose-800 bg-rose-500 shadow-[0_5px_0_#9F1239] hover:bg-rose-400'
                : 'border-violet-800 bg-violet-600 shadow-[0_5px_0_#4C1D95] hover:bg-violet-500'
            }`}
          >
            {autoDancing ? (
              <>
                <Square className="h-5 w-5 fill-current" />
                <span>Dừng Nhảy Liên Hoàn</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5 fill-current" />
                <span>Nhảy Liên Hoàn 4 Điệu!</span>
              </>
            )}
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-20 flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-950">
        <span>Mẹo: Cô cho cả lớp đứng dậy làm động tác giống bạn chữ cái trên Tivi!</span>
        <button
          type="button"
          onClick={() => {
            stopAutoDance();
            audioManager.playClick();
            audioManager.stopSpeaking();
            onNextStage();
          }}
          className="flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-2xl border-2 border-emerald-700 bg-emerald-500 px-4 py-1.5 font-heading text-xs sm:text-sm font-extrabold text-white shadow-[0_3px_0_#047857] hover:bg-emerald-400"
        >
          <span>Sang Chặng 11</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </footer>
    </div>
  );
};
