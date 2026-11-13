import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eraser,
  Eye,
  EyeOff,
  HelpCircle,
  Palette,
  RotateCcw,
  Sliders,
  Sparkles,
  Star,
  Undo2,
  Volume2,
} from 'lucide-react';
import { LessonConfig, Point2D } from '../types/lesson';
import { LETTER_STROKES } from '../data/strokes';
import { audioManager } from '../utils/audio';
import { ConfettiOverlay } from './ConfettiOverlay';

interface Stage8MemoryWriteProps {
  lesson: LessonConfig;
  onBackHub: () => void;
  onNextStage?: () => void;
  onOpenVoiceSettings: () => void;
}

interface MysteryCard {
  id: number;
  char: string;
  isUpper: boolean;
  revealed: boolean;
  completedPaths?: Array<{ d: string; color: string; width: number }>;
}

interface DrawnStroke {
  points: Point2D[];
  color: string;
  width: number;
}

const PEN_COLORS = [
  { hex: '#EF4444', name: 'Đỏ tươi' },
  { hex: '#2563EB', name: 'Xanh dương' },
  { hex: '#10B981', name: 'Xanh lá' },
  { hex: '#9333EA', name: 'Tím' },
  { hex: '#EA580C', name: 'Cam' },
];

function strokePointsToPath(pts: Point2D[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) {
    return `M ${pts[0].x} ${pts[0].y} L ${pts[0].x + 0.5} ${pts[0].y + 0.5}`;
  }
  return pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
}

function getStartRedDotForChar(char: string, isUpper: boolean): Point2D {
  const lower = char.toLocaleLowerCase('vi-VN');
  if (!isUpper && LETTER_STROKES[lower]?.strokes[0]?.waypoints[0]) {
    return LETTER_STROKES[lower].strokes[0].waypoints[0];
  }
  // Điểm đặt bút chuẩn cho các chữ IN HOA (giống chấm đỏ chữ E lúc 2:25 & 2:30 trong video!)
  if (['E', 'B', 'D', 'Đ', 'U', 'Ư'].includes(char)) {
    return { x: 145, y: 105 };
  }
  if (['Ê'].includes(char)) {
    return { x: 145, y: 125 };
  }
  if (['O', 'Ô', 'Ơ'].includes(char)) {
    return { x: 200, y: 110 };
  }
  if (['A', 'Ă', 'Â'].includes(char)) {
    return { x: 200, y: 108 };
  }
  return { x: 160, y: 115 };
}

function buildMysteryDeck(targetLetters: string[]): MysteryCard[] {
  const base = targetLetters.length > 0 ? targetLetters : ['e', 'ê'];
  const chars: Array<{ char: string; isUpper: boolean }> = [];
  base.forEach((c) => {
    const low = c.toLocaleLowerCase('vi-VN');
    chars.push({ char: low, isUpper: false });
    chars.push({ char: low.toLocaleUpperCase('vi-VN'), isUpper: true });
  });
  return chars.slice(0, 6).map((item, idx) => ({
    id: idx + 1,
    char: item.char,
    isUpper: item.isUpper,
    revealed: false,
  }));
}

export const Stage8MemoryWrite: React.FC<Stage8MemoryWriteProps> = ({
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

  const [cards, setCards] = useState<MysteryCard[]>(() => buildMysteryDeck(targetLetters));
  const [activeCardId, setActiveCardId] = useState<number>(1);
  const [memoryCurtain, setMemoryCurtain] = useState<boolean>(false);
  const [showGhostGuide, setShowGhostGuide] = useState<boolean>(false);
  const [penColor, setPenColor] = useState<string>(PEN_COLORS[0].hex);
  const [penWidth, setPenWidth] = useState<number>(18);
  const [strokes, setStrokes] = useState<DrawnStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point2D[] | null>(null);
  const [showShowcaseModal, setShowShowcaseModal] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const activePointerRef = useRef<number | null>(null);

  useEffect(() => {
    const fresh = buildMysteryDeck(targetLetters);
    setCards(fresh);
    setActiveCardId(1);
    setStrokes([]);
    setCurrentStroke(null);
    setShowGhostGuide(false);
    setMemoryCurtain(false);
    setShowShowcaseModal(false);

    const t = window.setTimeout(() => {
      audioManager.speakVi(
        `Đôi bàn tay vàng! Bé hãy bấm lật một thẻ bí ẩn để ghi nhớ chữ cái, rồi đặt bút từ chấm đỏ để viết lại nhé!`
      );
    }, 240);
    return () => {
      window.clearTimeout(t);
      audioManager.stopSpeaking();
    };
  }, [targetLetters]);

  const activeCard = useMemo(
    () => cards.find((c) => c.id === activeCardId) ?? cards[0],
    [cards, activeCardId]
  );

  const completedCount = useMemo(
    () => cards.filter((c) => Boolean(c.completedPaths && c.completedPaths.length > 0)).length,
    [cards]
  );
  const allCardsDone = cards.length > 0 && completedCount === cards.length;

  const startDot = useMemo(
    () => (activeCard ? getStartRedDotForChar(activeCard.char, activeCard.isUpper) : { x: 160, y: 120 }),
    [activeCard]
  );

  const handleFlipCard = (card: MysteryCard) => {
    audioManager.playClick();
    setActiveCardId(card.id);
    setStrokes([]);
    setCurrentStroke(null);
    setShowGhostGuide(false);
    setMemoryCurtain(false);

    setCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, revealed: true } : c))
    );

    const label = card.isUpper
      ? `Chữ ${card.char.toLocaleLowerCase('vi-VN')} in hoa`
      : `Chữ ${card.char} in thường`;
    audioManager.speakVi(
      `Thẻ số ${card.id}: ${label}! Bé hãy ghi nhớ rồi viết từ chấm đỏ trên bảng nhé!`
    );
  };

  const toBoardPoint = (clientX: number, clientY: number): Point2D | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    return {
      x: Math.max(8, Math.min(392, ((clientX - rect.left) / rect.width) * 400)),
      y: Math.max(8, Math.min(392, ((clientY - rect.top) / rect.height) * 400)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!activeCard?.revealed) {
      handleFlipCard(activeCard);
      return;
    }
    const pt = toBoardPoint(e.clientX, e.clientY);
    if (!pt) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointerRef.current = e.pointerId;
    setCurrentStroke([pt]);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (activePointerRef.current !== e.pointerId || !currentStroke) return;
    const pt = toBoardPoint(e.clientX, e.clientY);
    if (!pt) return;
    const last = currentStroke[currentStroke.length - 1];
    if (Math.hypot(pt.x - last.x, pt.y - last.y) < 3) return;
    setCurrentStroke([...currentStroke, pt]);
  };

  const finishStroke = (e: React.PointerEvent<SVGSVGElement>) => {
    if (activePointerRef.current !== e.pointerId) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    activePointerRef.current = null;
    if (currentStroke && currentStroke.length > 0) {
      setStrokes((prev) => [
        ...prev,
        { points: currentStroke, color: penColor, width: penWidth },
      ]);
      audioManager.playClick();
    }
    setCurrentStroke(null);
  };

  const handleUndo = () => {
    audioManager.playClick();
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    audioManager.playClick();
    setStrokes([]);
    setCurrentStroke(null);
  };

  const handleCompleteArtwork = () => {
    if (!activeCard || strokes.length === 0) {
      audioManager.playRetry();
      audioManager.speakVi('Bé hãy viết chữ lên bảng trắng trước khi khoe bài nhé!');
      return;
    }

    const savedPaths = strokes.map((s) => ({
      d: strokePointsToPath(s.points),
      color: s.color,
      width: s.width,
    }));

    const nextCards = cards.map((c) =>
      c.id === activeCard.id ? { ...c, revealed: true, completedPaths: savedPaths } : c
    );
    setCards(nextCards);
    setShowGhostGuide(true);
    setShowShowcaseModal(true);

    const allDoneNow = nextCards.every(
      (c) => Boolean(c.completedPaths && c.completedPaths.length > 0)
    );
    if (allDoneNow) {
      audioManager.playCelebration();
      audioManager.speakVi(
        `Đôi bàn tay vàng xuất sắc! Bé đã ghi nhớ và viết đẹp tất cả các thẻ chữ ${targetLetters.join(' và ')}!`,
        undefined,
        undefined,
        'character'
      );
    } else {
      audioManager.playCorrect();
      audioManager.speakVi(
        `Hoan hô đôi bàn tay vàng! Chữ ${activeCard.char.toLocaleLowerCase('vi-VN')} của bé đẹp lắm!`,
        undefined,
        undefined,
        'character'
      );
    }
  };

  const handleSelectNextUnfinished = () => {
    setShowShowcaseModal(false);
    const next = cards.find((c) => !c.completedPaths && c.id !== activeCard?.id);
    if (next) {
      handleFlipCard(next);
    }
  };

  const lowerStrokeGuide = activeCard
    ? LETTER_STROKES[activeCard.char.toLocaleLowerCase('vi-VN')]
    : undefined;

  return (
    <div className="safe-pad relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-b from-purple-200 via-pink-50 to-amber-100 px-3 py-2.5 sm:px-6 sm:py-3.5 select-none">
      <ConfettiOverlay active={showShowcaseModal || allCardsDone} />

      {/* Top Bar */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            audioManager.playClick();
            audioManager.stopSpeaking();
            onBackHub();
          }}
          className="flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-2xl border-3 border-slate-300 bg-white px-3.5 py-1.5 font-heading text-sm sm:text-base font-extrabold text-slate-700 shadow-[0_4px_0_#CBD5E1] hover:bg-slate-50 active:translate-y-0.5"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Sảnh chính</span>
        </button>

        <div className="flex items-center gap-2 rounded-full border-4 border-purple-500 bg-white px-4 py-1 sm:px-6 sm:py-1.5 shadow-[0_4px_0_rgba(147,51,234,0.28)]">
          <Palette className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
          <h1 className="font-heading text-base sm:text-xl md:text-2xl font-extrabold text-purple-950">
            Chặng 8: Đôi Bàn Tay Vàng
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-2xl border-3 border-amber-400 bg-amber-50 px-3 py-1 font-heading text-xs sm:text-base font-extrabold text-amber-900">
            <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-amber-400 text-amber-500" />
            <span>
              {completedCount} / {cards.length} thẻ
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              setCards(buildMysteryDeck(targetLetters));
              setActiveCardId(1);
              setStrokes([]);
              setShowShowcaseModal(false);
            }}
            className="flex min-h-[44px] cursor-pointer items-center gap-1 rounded-2xl border-3 border-purple-600 bg-purple-500 px-3 py-1.5 font-heading text-xs sm:text-sm font-extrabold text-white shadow-[0_4px_0_#6B21A8] hover:bg-purple-400"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Đặt lại thẻ</span>
          </button>

          <button
            type="button"
            onClick={onOpenVoiceSettings}
            aria-label="Cài đặt giọng nói"
            className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-2xl border-3 border-pink-300 bg-pink-500 text-white shadow-[0_4px_0_#BE185D] hover:bg-pink-400"
          >
            <Sliders className="h-5 w-5" />
          </button>

          {onNextStage && (
            <button
              type="button"
              onClick={() => {
                audioManager.playClick();
                audioManager.stopSpeaking();
                onNextStage();
              }}
              className="flex min-h-[44px] cursor-pointer items-center gap-1 rounded-2xl border-3 border-emerald-700 bg-emerald-500 px-3 py-1.5 font-heading text-xs sm:text-sm font-extrabold text-white shadow-[0_4px_0_#047857] hover:bg-emerald-400"
            >
              <span className="hidden sm:inline">Chặng 9</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Split Workspace: Left Mystery Cards + Right Freehand Red-Dot Whiteboard */}
      <main className="relative z-10 mx-auto my-2 grid w-full max-w-6xl flex-1 min-h-0 grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-5">
        {/* LEFT COLUMN (5 cols): Golden Mystery Cards (Matches TV 2:18 in video!) */}
        <section className="flex flex-col justify-between rounded-[28px] border-4 border-amber-400 bg-white/95 p-3.5 sm:p-4 shadow-[0_8px_0_rgba(217,119,6,0.22)] lg:col-span-5">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-heading text-base sm:text-xl font-extrabold text-amber-950">
                1. Bấm Lật Thẻ Bí Ẩn
              </h2>
              {activeCard?.revealed && (
                <button
                  type="button"
                  onClick={() => {
                    audioManager.playClick();
                    setMemoryCurtain((v) => !v);
                  }}
                  className="flex min-h-[38px] cursor-pointer items-center gap-1 rounded-xl border-2 border-amber-400 bg-amber-100 px-2.5 py-1 text-xs font-extrabold text-amber-950 hover:bg-amber-200"
                >
                  {memoryCurtain ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  <span>{memoryCurtain ? 'Hiện thẻ' : 'Che thẻ thử nhớ'}</span>
                </button>
              )}
            </div>
            <p className="mt-1 text-xs sm:text-sm font-bold text-slate-600">
              Chọn 1 hộp thẻ vàng để mở chữ cái bí mật, ghi nhớ rồi tự viết bên bảng trắng!
            </p>

            {/* Mystery Cards Grid */}
            <div className="mt-3 grid grid-cols-3 gap-2.5">
              {cards.map((card) => {
                const isSelected = card.id === activeCardId;
                const isDone = Boolean(card.completedPaths && card.completedPaths.length > 0);
                const showFace = card.revealed && !(isSelected && memoryCurtain);

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleFlipCard(card)}
                    className={`relative flex min-h-[88px] sm:min-h-[108px] cursor-pointer flex-col items-center justify-center rounded-2xl border-4 p-2 transition ${
                      isSelected
                        ? 'border-purple-600 ring-4 ring-purple-300 -translate-y-0.5'
                        : 'border-amber-500 hover:-translate-y-0.5'
                    } ${
                      showFace
                        ? 'bg-gradient-to-b from-sky-50 to-indigo-50 text-indigo-950 shadow-[0_5px_0_#6366F1]'
                        : 'bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 shadow-[0_5px_0_#B45309]'
                    }`}
                  >
                    {isDone && (
                      <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}

                    {showFace ? (
                      <>
                        <span className="font-letter text-3xl sm:text-5xl font-extrabold leading-none text-blue-700">
                          {card.char}
                        </span>
                        <span className="mt-1 text-[11px] sm:text-xs font-bold text-slate-600">
                          {card.isUpper ? 'In hoa' : 'In thường'}
                        </span>
                      </>
                    ) : (
                      <>
                        <HelpCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white drop-shadow-xs" />
                        <span className="font-heading mt-1 text-base sm:text-lg font-extrabold text-white drop-shadow-xs">
                          Thẻ {card.id}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mini Gallery of Kid's Completed Handwritten Letters */}
          <div className="mt-3 rounded-2xl border-2 border-purple-200 bg-purple-50/70 p-2.5">
            <div className="flex items-center justify-between">
              <span className="font-heading text-xs sm:text-sm font-extrabold text-purple-900">
                Góc Khoe Chữ Đẹp Của Bé:
              </span>
              {activeCard?.revealed && (
                <button
                  type="button"
                  onClick={() =>
                    audioManager.speakVi(
                      activeCard.isUpper
                        ? `Chữ ${activeCard.char.toLocaleLowerCase('vi-VN')} in hoa`
                        : `Chữ ${activeCard.char} in thường`
                    )
                  }
                  className="flex cursor-pointer items-center gap-1 rounded-lg bg-purple-600 px-2 py-1 text-xs font-bold text-white hover:bg-purple-500"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Nghe tên chữ</span>
                </button>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {completedCount === 0 ? (
                <span className="text-xs font-semibold text-slate-500">
                  Các chữ bé viết xong sẽ được đóng khung sao vàng tại đây!
                </span>
              ) : (
                cards
                  .filter((c) => c.completedPaths && c.completedPaths.length > 0)
                  .map((c) => (
                    <div
                      key={`art-${c.id}`}
                      className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-amber-400 bg-white p-1 shadow-xs"
                    >
                      <svg viewBox="0 0 400 400" className="h-full w-full">
                        {c.completedPaths?.map((p, idx) => (
                          <path
                            key={idx}
                            d={p.d}
                            fill="none"
                            stroke={p.color}
                            strokeWidth={p.width}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        ))}
                      </svg>
                    </div>
                  ))
              )}
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN (7 cols): Freehand Whiteboard with Red Starting Dot (Matches iPad 2:25 & 2:32!) */}
        <section className="relative flex flex-col justify-between rounded-[28px] border-4 border-purple-500 bg-white p-3 sm:p-4 shadow-[0_8px_0_rgba(107,33,168,0.22)] lg:col-span-7">
          {/* Board Top Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {PEN_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  aria-label={`Bút màu ${c.name}`}
                  onClick={() => {
                    audioManager.playClick();
                    setPenColor(c.hex);
                  }}
                  style={{ backgroundColor: c.hex }}
                  className={`h-9 w-9 sm:h-10 sm:w-10 cursor-pointer rounded-full border-3 transition ${
                    penColor === c.hex
                      ? 'scale-115 border-slate-900 ring-3 ring-amber-300'
                      : 'border-white shadow-sm opacity-85 hover:opacity-100'
                  }`}
                />
              ))}

              <button
                type="button"
                onClick={() => {
                  audioManager.playClick();
                  setPenWidth((w) => (w === 18 ? 26 : 18));
                }}
                className="ml-1 rounded-xl border-2 border-slate-300 bg-slate-100 px-2.5 py-1.5 text-xs font-extrabold text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                {penWidth === 18 ? 'Nét vừa' : 'Nét to'}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  audioManager.playClick();
                  setShowGhostGuide((v) => !v);
                }}
                className={`flex min-h-[40px] cursor-pointer items-center gap-1 rounded-xl border-2 px-3 py-1 text-xs sm:text-sm font-extrabold transition ${
                  showGhostGuide
                    ? 'border-blue-600 bg-blue-100 text-blue-900'
                    : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {showGhostGuide ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showGhostGuide ? 'Ẩn mẫu' : 'Soi chữ mẫu'}</span>
              </button>

              <button
                type="button"
                onClick={handleUndo}
                disabled={strokes.length === 0}
                aria-label="Hoàn tác"
                className="flex min-h-[40px] cursor-pointer items-center gap-1 rounded-xl border-2 border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-40"
              >
                <Undo2 className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={strokes.length === 0}
                aria-label="Xóa bảng"
                className="flex min-h-[40px] cursor-pointer items-center gap-1 rounded-xl border-2 border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-40"
              >
                <Eraser className="h-4 w-4" />
                <span>Xóa</span>
              </button>
            </div>
          </div>

          {/* Drawing Canvas Area (touch-action: none mandatory per AGENTS.md) */}
          <div className="relative my-2 flex flex-1 min-h-[210px] items-center justify-center overflow-hidden rounded-3xl border-4 border-sky-200 bg-[#FFFEFA] shadow-inner">
            {!activeCard?.revealed ? (
              <button
                type="button"
                onClick={() => activeCard && handleFlipCard(activeCard)}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-3xl border-4 border-dashed border-amber-400 bg-amber-50 px-8 py-6 text-center hover:bg-amber-100"
              >
                <Sparkles className="h-10 w-10 text-amber-500" />
                <span className="font-heading text-xl sm:text-2xl font-extrabold text-amber-900">
                  Bấm mở Thẻ {activeCard?.id} để bắt đầu viết nhé!
                </span>
              </button>
            ) : (
              <svg
                ref={svgRef}
                viewBox="0 0 400 400"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={finishStroke}
                onPointerCancel={finishStroke}
                style={{ touchAction: 'none' }}
                className="h-full max-h-[340px] w-full max-w-[360px] cursor-crosshair select-none"
              >
                {/* Notebook Grid Lines */}
                {[100, 200, 300].map((pos) => (
                  <g key={pos}>
                    <line
                      x1="24"
                      y1={pos}
                      x2="376"
                      y2={pos}
                      stroke="#E0F2FE"
                      strokeWidth="2"
                      strokeDasharray={pos === 300 ? undefined : '6 6'}
                    />
                    <line
                      x1={pos}
                      y1="24"
                      x2={pos}
                      y2="376"
                      stroke="#F1F5F9"
                      strokeWidth="2"
                      strokeDasharray="6 6"
                    />
                  </g>
                ))}

                {/* Optional Ghost Reference Letter for Comparison */}
                {showGhostGuide &&
                  (lowerStrokeGuide && !activeCard.isUpper ? (
                    lowerStrokeGuide.strokes.map((st, idx) => (
                      <path
                        key={idx}
                        d={st.svgPath}
                        fill="none"
                        stroke="#CBD5E1"
                        strokeWidth="26"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="14 14"
                      />
                    ))
                  ) : (
                    <text
                      x="200"
                      y="292"
                      textAnchor="middle"
                      fill="#E2E8F0"
                      fontSize="240"
                      fontWeight="800"
                      fontFamily="Lexend, Quicksand, sans-serif"
                    >
                      {activeCard.char}
                    </text>
                  ))}

                {/* Bright Red Starting Dot (Just like iPad screen at 2:25 in video!) */}
                <circle
                  cx={startDot.x}
                  cy={startDot.y}
                  r="15"
                  fill="#FEE2E2"
                  stroke="#EF4444"
                  strokeWidth="3"
                />
                <circle cx={startDot.x} cy={startDot.y} r="8.5" fill="#EF4444" />

                {/* Completed Freehand Strokes */}
                {strokes.map((s, idx) => (
                  <path
                    key={idx}
                    d={strokePointsToPath(s.points)}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={s.width}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}

                {/* Active Drawing Stroke */}
                {currentStroke && currentStroke.length > 0 && (
                  <path
                    d={strokePointsToPath(currentStroke)}
                    fill="none"
                    stroke={penColor}
                    strokeWidth={penWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            )}

            {/* Showcase Celebration Popup (Like holding up the iPad at 2:30 in video!) */}
            {showShowcaseModal && activeCard && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-3 backdrop-blur-xs">
                <div className="flex max-w-sm flex-col items-center rounded-[28px] border-4 border-amber-400 bg-white px-6 py-5 text-center shadow-2xl">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className="h-7 w-7 fill-amber-400 text-amber-500" />
                    ))}
                  </div>
                  <h3 className="font-heading mt-2 text-2xl sm:text-3xl font-extrabold text-purple-950">
                    Chữ Đẹp Quá!
                  </h3>
                  <p className="mt-1 text-sm font-bold text-slate-600">
                    Tác phẩm chữ{' '}
                    <strong className="font-letter text-lg text-pink-600">{activeCard.char}</strong>{' '}
                    đã được lưu vào Góc Khoe Chữ Đẹp!
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowShowcaseModal(false)}
                      className="cursor-pointer rounded-xl border-2 border-slate-300 bg-slate-100 px-4 py-2 font-heading text-sm font-bold text-slate-700 hover:bg-slate-200"
                    >
                      Viết thêm
                    </button>
                    {!allCardsDone ? (
                      <button
                        type="button"
                        onClick={handleSelectNextUnfinished}
                        className="cursor-pointer rounded-xl border-2 border-emerald-700 bg-emerald-500 px-5 py-2 font-heading text-sm sm:text-base font-extrabold text-white shadow-[0_3px_0_#047857] hover:bg-emerald-400"
                      >
                        Mở thẻ tiếp theo!
                      </button>
                    ) : (
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            audioManager.playClick();
                            audioManager.stopSpeaking();
                            onBackHub();
                          }}
                          className="cursor-pointer rounded-xl border-2 border-blue-800 bg-blue-600 px-5 py-2 font-heading text-sm sm:text-base font-extrabold text-white shadow-[0_3px_0_#1E3A8A] hover:bg-blue-500"
                        >
                          Hoàn thành toàn bộ!
                        </button>
                        {onNextStage && (
                          <button
                            type="button"
                            onClick={() => {
                              audioManager.playClick();
                              audioManager.stopSpeaking();
                              onNextStage();
                            }}
                            className="flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-emerald-700 bg-emerald-500 px-5 py-2 font-heading text-sm sm:text-base font-extrabold text-white shadow-[0_3px_0_#047857] hover:bg-emerald-400"
                          >
                            <span>Sang Chặng 9</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Submit / Praise Button */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-bold text-slate-600">
              Chấm đỏ <span className="inline-block h-3 w-3 rounded-full bg-red-500 align-middle" />{' '}
              là điểm bắt đầu đặt bút viết!
            </span>
            <button
              type="button"
              onClick={handleCompleteArtwork}
              className="flex min-h-[54px] cursor-pointer items-center gap-2 rounded-2xl border-4 border-emerald-700 bg-emerald-500 px-5 py-2 font-heading text-base sm:text-xl font-extrabold text-white shadow-[0_5px_0_#047857] hover:bg-emerald-400 active:translate-y-0.5"
            >
              <Sparkles className="h-5 w-5" />
              <span>Khoe Chữ Đẹp – Tặng Sao!</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
