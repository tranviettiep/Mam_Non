import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Sliders,
  Sparkles,
  Star,
  Sun,
  Users,
  Volume2,
} from 'lucide-react';
import { LessonConfig } from '../types/lesson';
import {
  getPronunciationTip,
  stripVietnameseToneKeepBase,
  VOCAB_CARDS_BY_LETTER,
  VocabCardItem,
} from '../data/letterGamesData';
import { audioManager } from '../utils/audio';
import { ConfettiOverlay } from './ConfettiOverlay';
import { VocabIllustration } from './VocabIllustration';

interface Stage11PronunciationBoardProps {
  lesson: LessonConfig;
  onBackHub: () => void;
  onOpenVoiceSettings: () => void;
}

type BoardTab = 'lower' | 'upper' | 'vocab';

const GROUP_BADGES = [
  'Cả lớp đồng thanh',
  'Tổ Hoa Hồng',
  'Tổ Nắng Mai',
  'Tổ Mây Xanh',
  'Bạn nhỏ xung phong',
] as const;

const HighlightWord: React.FC<{ word: string; targetLower: string }> = ({ word, targetLower }) => (
  <span className="font-letter">
    {Array.from(word).map((ch, idx) =>
      stripVietnameseToneKeepBase(ch) === targetLower ? (
        <span key={idx} className="text-red-600 underline decoration-amber-400 decoration-4">
          {ch}
        </span>
      ) : (
        <span key={idx}>{ch}</span>
      )
    )}
  </span>
);

const Glossy3DRedLetterSvg: React.FC<{ char: string; pulsing: boolean }> = ({ char, pulsing }) => (
  <svg viewBox="0 0 260 250" className="h-40 w-40 sm:h-52 sm:w-52 select-none" aria-hidden="true">
    <defs>
      <linearGradient id="red3dBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F87171" />
        <stop offset="45%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#DC2626" />
      </linearGradient>
    </defs>

    {pulsing && (
      <g>
        <circle
          cx="130"
          cy="132"
          r="92"
          fill="none"
          stroke="#F87171"
          strokeWidth="6"
          className="animate-pulse-ring"
          style={{ transformOrigin: '130px 132px' }}
        />
        <circle
          cx="130"
          cy="132"
          r="76"
          fill="none"
          stroke="#FBBF24"
          strokeWidth="5"
          className="animate-pulse-ring"
          style={{ transformOrigin: '130px 132px', animationDelay: '0.28s' }}
        />
      </g>
    )}

    {/* Soft Ground Shadow */}
    <ellipse cx="130" cy="222" rx="64" ry="12" fill="#CBD5E1" opacity="0.7" />

    {/* 3D Extrude Depth Layer */}
    <text
      x="133"
      y="144"
      textAnchor="middle"
      dominantBaseline="central"
      className="font-letter"
      fontSize="162"
      fontWeight="800"
      fill="#991B1B"
      stroke="#7F1D1D"
      strokeWidth="9"
      strokeLinejoin="round"
    >
      {char}
    </text>

    {/* Front Glossy Bright Red Layer */}
    <text
      x="128"
      y="136"
      textAnchor="middle"
      dominantBaseline="central"
      className="font-letter"
      fontSize="162"
      fontWeight="800"
      fill="url(#red3dBody)"
      stroke="#FFFFFF"
      strokeWidth="3"
      strokeLinejoin="round"
    >
      {char}
    </text>
  </svg>
);

const SmilingSunMascot: React.FC = () => (
  <svg viewBox="0 0 110 110" className="h-16 w-16 sm:h-20 sm:w-20 drop-shadow-sm" aria-hidden="true">
    <g stroke="#FACC15" strokeWidth="6" strokeLinecap="round">
      <line x1="55" y1="8" x2="55" y2="20" />
      <line x1="55" y1="90" x2="55" y2="102" />
      <line x1="8" y1="55" x2="20" y2="55" />
      <line x1="90" y1="55" x2="102" y2="55" />
      <line x1="21" y1="21" x2="30" y2="30" />
      <line x1="80" y1="80" x2="89" y2="89" />
      <line x1="89" y1="21" x2="80" y2="30" />
      <line x1="30" y1="80" x2="21" y2="89" />
    </g>
    <circle cx="55" cy="55" r="28" fill="#FDE047" stroke="#F59E0B" strokeWidth="3.5" />
    <circle cx="46" cy="50" r="3.5" fill="#1E293B" />
    <circle cx="64" cy="50" r="3.5" fill="#1E293B" />
    <ellipse cx="40" cy="58" rx="4.5" ry="2.5" fill="#FB7185" opacity="0.85" />
    <ellipse cx="70" cy="58" rx="4.5" ry="2.5" fill="#FB7185" opacity="0.85" />
    <path d="M 46 60 Q 55 68 64 60" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const Stage11PronunciationBoard: React.FC<Stage11PronunciationBoardProps> = ({
  lesson,
  onBackHub,
  onOpenVoiceSettings,
}) => {
  const targetLetters = useMemo(() => {
    return lesson.targetLetters.length > 0
      ? lesson.targetLetters.map((c) => c.toLocaleLowerCase('vi-VN'))
      : ['u', 'ư'];
  }, [lesson.targetLetters]);

  const [letterIdx, setLetterIdx] = useState(0);
  const [boardTab, setBoardTab] = useState<BoardTab>('lower');
  const [pulsing, setPulsing] = useState(false);
  const [countdownBeat, setCountdownBeat] = useState<number | null>(null);
  const [groupIdx, setGroupIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [confettiBurst, setConfettiBurst] = useState(false);

  const timersRef = useRef<number[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const scheduleTimer = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const activeLower = targetLetters[letterIdx] ?? targetLetters[0];
  const displayChar =
    boardTab === 'upper' ? activeLower.toLocaleUpperCase('vi-VN') : activeLower;
  const vocabCards: VocabCardItem[] = useMemo(
    () => (VOCAB_CARDS_BY_LETTER[activeLower] ?? []).slice(0, 4),
    [activeLower]
  );
  const tipText = useMemo(() => getPronunciationTip(activeLower), [activeLower]);

  useEffect(() => {
    setLetterIdx(0);
    setBoardTab('lower');
    setCountdownBeat(null);
    setPulsing(false);
  }, [lesson.id, targetLetters]);

  useEffect(() => {
    clearAllTimers();
    scheduleTimer(() => {
      audioManager.speakVi(
        'Bảng vàng phát âm! Các bé nhìn lên bảng và phát âm thật to, tròn vành rõ chữ cùng cô nhé!'
      );
    }, 240);

    return () => {
      clearAllTimers();
      audioManager.stopSpeaking();
    };
  }, [clearAllTimers, scheduleTimer]);

  const handleModelPronounce = () => {
    clearAllTimers();
    setCountdownBeat(null);
    audioManager.unlock();
    audioManager.playClick();
    setPulsing(true);
    audioManager.speakVi(`Phát âm chữ ${activeLower}: ${activeLower}!`, undefined, () => {
      setPulsing(false);
    });
  };

  const handleChoralCountdown = () => {
    clearAllTimers();
    audioManager.unlock();
    audioManager.stopSpeaking();
    setPulsing(false);

    setCountdownBeat(1);
    audioManager.playCountdownBeep(false);

    scheduleTimer(() => {
      setCountdownBeat(2);
      audioManager.playCountdownBeep(false);
    }, 650);

    scheduleTimer(() => {
      setCountdownBeat(3);
      audioManager.playCountdownBeep(true);
    }, 1300);

    scheduleTimer(() => {
      setCountdownBeat(null);
      setPulsing(true);
      audioManager.speakVi(
        `Cả lớp đọc to: Chữ ${activeLower}!`,
        undefined,
        () => setPulsing(false),
        'character'
      );
    }, 1900);
  };

  const handlePraiseGroup = () => {
    clearAllTimers();
    setCountdownBeat(null);
    audioManager.unlock();
    audioManager.playCelebration();
    setStars((prev) => prev + 1);
    setConfettiBurst(true);
    scheduleTimer(() => setConfettiBurst(false), 2400);
    audioManager.speakVi(
      'Giỏi quá! Cả lớp phát âm chuẩn và to rõ lắm!',
      undefined,
      undefined,
      'character'
    );
  };

  return (
    <div className="safe-pad relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-b from-sky-100 via-amber-50 to-orange-100 px-3 py-2 sm:px-6 sm:py-3 select-none">
      <ConfettiOverlay active={confettiBurst} />

      {/* Montessori Classroom Wooden Shelves & Blocks Backdrop (Matches Video 3) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {/* Floor */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-amber-200/70 to-amber-300/80 border-t-4 border-amber-300" />
        {/* Left Toy Blocks A & C */}
        <div className="hidden lg:flex absolute bottom-6 left-6 gap-2 opacity-80">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border-3 border-amber-700 bg-amber-100 font-heading text-2xl font-extrabold text-amber-900 shadow-sm">
            A
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border-3 border-amber-700 bg-amber-100 font-heading text-2xl font-extrabold text-amber-900 shadow-sm">
            C
          </div>
        </div>
        {/* Right Potted Shelf Accent */}
        <div className="hidden lg:block absolute bottom-6 right-6 h-16 w-24 rounded-t-xl border-3 border-amber-700/60 bg-amber-200/75" />
      </div>

      {/* Header */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            clearAllTimers();
            audioManager.playClick();
            audioManager.stopSpeaking();
            onBackHub();
          }}
          className="flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-2xl border-3 border-slate-300 bg-white px-3.5 py-1.5 font-heading text-sm sm:text-base font-extrabold text-slate-700 shadow-[0_4px_0_#CBD5E1] hover:bg-slate-50 active:translate-y-0.5"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Sảnh chính</span>
        </button>

        <div className="flex items-center gap-2 rounded-full border-4 border-amber-500 bg-white px-4 py-1 sm:px-6 sm:py-1.5 shadow-[0_4px_0_rgba(217,119,6,0.28)]">
          <Sun className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
          <h1 className="font-heading text-base sm:text-xl md:text-2xl font-extrabold text-amber-900">
            Chặng 11: Bảng Vàng Phát Âm
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-2xl border-3 border-amber-400 bg-amber-50 px-3 py-1 font-heading text-xs sm:text-base font-extrabold text-amber-900">
            <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-amber-400 text-amber-500" />
            <span>{stars} sao</span>
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

      {/* Letter & Mode Tabs */}
      <div className="relative z-20 mx-auto mt-1 flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-1.5">
          {targetLetters.map((ch, idx) => (
            <button
              key={ch}
              type="button"
              onClick={() => {
                clearAllTimers();
                setCountdownBeat(null);
                setPulsing(false);
                audioManager.playClick();
                setLetterIdx(idx);
              }}
              className={`font-letter min-h-[44px] min-w-[50px] cursor-pointer rounded-2xl border-3 px-3.5 py-1 text-lg sm:text-xl font-extrabold transition ${
                idx === letterIdx
                  ? 'border-red-700 bg-red-500 text-white shadow-[0_4px_0_#991B1B]'
                  : 'border-white bg-white/95 text-slate-800 hover:bg-white'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-2xl border-2 border-sky-300 bg-white/90 p-1">
          {[
            { id: 'lower' as const, label: 'In thường' },
            { id: 'upper' as const, label: 'In hoa' },
            { id: 'vocab' as const, label: 'Từ vựng mẫu' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                audioManager.playClick();
                setBoardTab(tab.id);
              }}
              className={`min-h-[38px] cursor-pointer rounded-xl px-3 py-1 font-heading text-xs sm:text-sm font-extrabold transition ${
                boardTab === tab.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-sky-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Classroom Whiteboard + Control Panel */}
      <main className="relative z-10 mx-auto my-1.5 grid w-full max-w-6xl flex-1 min-h-0 grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-5">
        {/* Left: Classroom Whiteboard with Sun Mascot & Yellow Cloud Header (Matches Video 3) */}
        <section className="relative flex flex-col justify-between rounded-[32px] border-[6px] border-sky-500 bg-white p-3.5 sm:p-5 shadow-[0_10px_0_rgba(2,132,199,0.28)] lg:col-span-7 min-h-0">
          {/* Smiling Sun in Top-Left */}
          <div className="pointer-events-none absolute -left-3 -top-3 sm:left-2 sm:top-2 z-20 animate-gentle-sway">
            <SmilingSunMascot />
          </div>

          {/* Yellow Cloud Banner */}
          <div className="relative z-10 mx-auto flex items-center gap-2 rounded-full border-4 border-amber-400 bg-amber-200 px-6 py-1.5 shadow-sm">
            <Sparkles className="h-5 w-5 text-pink-500" />
            <h2 className="font-heading text-xl sm:text-3xl font-extrabold text-slate-800">
              Chữ <span className="font-letter text-red-600">{displayChar}</span>
            </h2>
            <Sparkles className="h-5 w-5 text-violet-500" />
          </div>

          {/* Board Center Stage */}
          <div className="relative my-2 flex flex-1 min-h-0 items-center justify-center rounded-[24px] border-3 border-sky-200 bg-gradient-to-b from-slate-50 to-sky-50/60 p-3">
            {countdownBeat !== null ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="font-heading text-lg sm:text-xl font-extrabold text-sky-800">
                  Chuẩn bị đồng thanh...
                </span>
                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-amber-400 bg-amber-100 font-heading text-7xl font-extrabold text-red-600 shadow-lg animate-bounce">
                  {countdownBeat}
                </div>
              </div>
            ) : boardTab !== 'vocab' ? (
              <button
                type="button"
                onClick={handleModelPronounce}
                aria-label={`Phát âm chữ ${displayChar}`}
                className="flex cursor-pointer flex-col items-center justify-center rounded-3xl p-2 transition hover:scale-105 active:scale-95"
              >
                <Glossy3DRedLetterSvg char={displayChar} pulsing={pulsing} />
                <span className="mt-1 rounded-full border-2 border-sky-200 bg-white px-4 py-0.5 font-heading text-xs sm:text-sm font-extrabold text-sky-800">
                  Bấm vào chữ để nghe phát âm
                </span>
              </button>
            ) : (
              <div className="grid w-full grid-cols-2 gap-2.5 sm:gap-3">
                {vocabCards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      audioManager.playClick();
                      audioManager.speakVi(card.word);
                    }}
                    className="flex min-h-[96px] cursor-pointer items-center gap-3 rounded-2xl border-3 border-sky-200 bg-white p-2.5 text-left shadow-sm transition hover:border-sky-400 hover:-translate-y-0.5"
                  >
                    <div className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-xl bg-sky-50 p-1">
                      <VocabIllustration id={card.illustration} className="h-full w-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base sm:text-xl font-extrabold text-slate-800 leading-normal">
                        <HighlightWord word={card.word} targetLower={activeLower} />
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-600">
                        <Volume2 className="h-3.5 w-3.5" /> Nghe đọc
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pronunciation Tip Strip */}
          <div className="flex items-center gap-2.5 rounded-2xl border-2 border-amber-300 bg-amber-50 px-3.5 py-2">
            <button
              type="button"
              onClick={() => {
                audioManager.playClick();
                audioManager.speakVi(tipText);
              }}
              aria-label="Nghe hướng dẫn khẩu hình"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-amber-400 text-amber-950 hover:bg-amber-300"
            >
              <Volume2 className="h-5 w-5" />
            </button>
            <p className="text-xs sm:text-sm font-bold text-amber-950 leading-snug">
              <strong className="font-heading">Khẩu hình: </strong>
              {tipText}
            </p>
          </div>
        </section>

        {/* Right: 3 Classroom Pronunciation Controls + Group Selector */}
        <section className="flex flex-col justify-between gap-2.5 rounded-[28px] border-4 border-amber-400 bg-white/95 p-3.5 sm:p-4 shadow-[0_8px_0_rgba(217,119,6,0.2)] lg:col-span-5">
          <div>
            <h2 className="font-heading text-lg sm:text-xl font-extrabold text-blue-950">
              Hoạt Động Luyện Phát Âm
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-600">
              Cô điều khiển cho cả lớp nghe mẫu, đồng thanh theo nhịp và tặng sao thi đua!
            </p>
          </div>

          <div className="flex flex-col gap-2.5 my-auto">
            <button
              type="button"
              onClick={handleModelPronounce}
              className="flex min-h-[68px] w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border-3 border-sky-700 bg-sky-500 px-4 py-2 text-left text-white shadow-[0_5px_0_#0369A1] hover:bg-sky-400 active:translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/25">
                  <Volume2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-heading text-base sm:text-lg font-extrabold">
                    1. Cô đọc mẫu
                  </div>
                  <div className="text-xs font-bold text-white/90">
                    Nghe phát âm chuẩn chữ {activeLower}
                  </div>
                </div>
              </div>
              <Sparkles className="h-5 w-5 shrink-0" />
            </button>

            <button
              type="button"
              onClick={handleChoralCountdown}
              className="flex min-h-[68px] w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border-3 border-rose-700 bg-rose-500 px-4 py-2 text-left text-white shadow-[0_5px_0_#9F1239] hover:bg-rose-400 active:translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/25">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-heading text-base sm:text-lg font-extrabold">
                    2. Đọc đồng thanh (1 – 2 – 3)
                  </div>
                  <div className="text-xs font-bold text-white/90">
                    Đếm nhịp cho cả lớp hô vang cùng lúc
                  </div>
                </div>
              </div>
              <span className="rounded-xl bg-white/25 px-2.5 py-1 font-heading text-sm font-extrabold">
                1-2-3
              </span>
            </button>

            <div className="rounded-2xl border-3 border-amber-300 bg-amber-50/90 p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-heading text-xs font-extrabold uppercase tracking-wide text-amber-900">
                  Đối tượng thi đua:
                </span>
                <span className="font-heading text-xs font-extrabold text-pink-600">
                  {GROUP_BADGES[groupIdx]}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {GROUP_BADGES.map((label, idx) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      audioManager.playClick();
                      setGroupIdx(idx);
                    }}
                    className={`cursor-pointer rounded-xl border-2 px-2.5 py-1 font-heading text-xs font-extrabold transition ${
                      idx === groupIdx
                        ? 'border-amber-600 bg-amber-400 text-amber-950'
                        : 'border-white bg-white text-slate-700 hover:bg-amber-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handlePraiseGroup}
                className="flex min-h-[64px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-3 border-emerald-700 bg-emerald-500 px-4 py-2 font-heading text-base sm:text-lg font-extrabold text-white shadow-[0_5px_0_#047857] hover:bg-emerald-400 active:translate-y-0.5"
              >
                <Award className="h-6 w-6" />
                <span>3. Tặng Sao Khen {GROUP_BADGES[groupIdx]}!</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              clearAllTimers();
              audioManager.playClick();
              audioManager.stopSpeaking();
              onBackHub();
            }}
            className="flex min-h-[50px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-3 border-blue-800 bg-blue-600 px-4 py-2 font-heading text-base font-extrabold text-white shadow-[0_4px_0_#1E3A8A] hover:bg-blue-500"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>Hoàn thành &amp; Về Sảnh chính</span>
          </button>
        </section>
      </main>
    </div>
  );
};
