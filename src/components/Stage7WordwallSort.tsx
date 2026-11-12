import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LayoutGrid,
  RotateCcw,
  Sliders,
  Star,
  Volume2,
} from 'lucide-react';
import { LessonConfig } from '../types/lesson';
import {
  getVocabCardsForLetters,
  stripVietnameseToneKeepBase,
  VocabCardItem,
} from '../data/letterGamesData';
import { audioManager } from '../utils/audio';
import { ConfettiOverlay } from './ConfettiOverlay';
import { VocabIllustration } from './VocabIllustration';

interface Stage7WordwallSortProps {
  lesson: LessonConfig;
  onBackHub: () => void;
  onNextStage: () => void;
  onOpenVoiceSettings: () => void;
}

interface CardDragState {
  cardId: string;
  pointerId: number;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  hoveredCol: string | null;
}

const COLUMN_THEMES = [
  {
    headerBg: 'bg-pink-600',
    headerBorder: 'border-pink-800',
    boxBg: 'bg-pink-50/95',
    boxBorder: 'border-pink-400',
    ringHover: 'ring-4 ring-pink-400 bg-pink-100/95',
  },
  {
    headerBg: 'bg-blue-600',
    headerBorder: 'border-blue-800',
    boxBg: 'bg-blue-50/95',
    boxBorder: 'border-blue-400',
    ringHover: 'ring-4 ring-blue-400 bg-blue-100/95',
  },
  {
    headerBg: 'bg-amber-500',
    headerBorder: 'border-amber-700',
    boxBg: 'bg-amber-50/95',
    boxBorder: 'border-amber-400',
    ringHover: 'ring-4 ring-amber-400 bg-amber-100/95',
  },
];

function shuffleCards(items: VocabCardItem[]): VocabCardItem[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

const HighlightedWord: React.FC<{
  word: string;
  targetLetters: string[];
  highlight: boolean;
  className?: string;
}> = ({ word, targetLetters, highlight, className = '' }) => {
  if (!highlight) {
    return <span className={`font-letter ${className}`}>{word}</span>;
  }
  const normalizedSet = new Set(targetLetters.map((c) => c.toLocaleLowerCase('vi-VN')));
  return (
    <span className={`font-letter ${className}`}>
      {Array.from(word).map((ch, i) => {
        const isMatch = normalizedSet.has(stripVietnameseToneKeepBase(ch));
        return isMatch ? (
          <span key={i} className="text-rose-600 underline decoration-2 underline-offset-2">
            {ch}
          </span>
        ) : (
          <React.Fragment key={i}>{ch}</React.Fragment>
        );
      })}
    </span>
  );
};

export const Stage7WordwallSort: React.FC<Stage7WordwallSortProps> = ({
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

  const [deck, setDeck] = useState<VocabCardItem[]>(() =>
    shuffleCards(getVocabCardsForLetters(targetLetters))
  );
  const [placedMap, setPlacedMap] = useState<Record<string, string>>({});
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [wrongCardId, setWrongCardId] = useState<string | null>(null);
  const [highlightLetters, setHighlightLetters] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [drag, setDrag] = useState<CardDragState | null>(null);

  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const resetGame = useCallback(
    (announce = false) => {
      const fresh = shuffleCards(getVocabCardsForLetters(targetLetters));
      setDeck(fresh);
      setPlacedMap({});
      setSelectedCardId(null);
      setWrongCardId(null);
      setDrag(null);
      const msg = `Bé hãy kéo hoặc chạm thẻ hình ảnh xếp vào đúng cột chữ ${targetLetters.join(', ')} nhé!`;
      setStatusMessage(msg);
      if (announce) {
        audioManager.speakVi(msg);
      }
    },
    [targetLetters]
  );

  useEffect(() => {
    resetGame(false);
    const t = window.setTimeout(() => {
      audioManager.speakVi(
        `Tìm chữ trong hình ảnh! Bé hãy xếp các thẻ tranh có chứa chữ ${targetLetters.join(', ')} vào đúng cột nhé!`
      );
    }, 240);
    return () => {
      window.clearTimeout(t);
      audioManager.stopSpeaking();
    };
  }, [targetLetters, resetGame]);

  const remainingCards = useMemo(
    () => deck.filter((c) => !placedMap[c.id]),
    [deck, placedMap]
  );
  const allSorted = deck.length > 0 && remainingCards.length === 0;

  const findHoveredColumn = (clientX: number, clientY: number): string | null => {
    for (const ch of targetLetters) {
      const el = columnRefs.current[ch];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (
        clientX >= rect.left - 12 &&
        clientX <= rect.right + 12 &&
        clientY >= rect.top - 16 &&
        clientY <= rect.bottom + 12
      ) {
        return ch;
      }
    }
    return null;
  };

  const attemptPlaceCardInColumn = useCallback(
    (card: VocabCardItem, colLetter: string) => {
      if (placedMap[card.id]) return;

      if (card.targetLetter === colLetter) {
        const nextMap = { ...placedMap, [card.id]: colLetter };
        setPlacedMap(nextMap);
        setSelectedCardId(null);
        setWrongCardId(null);

        const doneCount = Object.keys(nextMap).length;
        if (doneCount >= deck.length) {
          audioManager.playCelebration();
          setStatusMessage(
            `Xuất sắc! Cả lớp đã phân loại đúng tất cả ${deck.length} bức tranh!`
          );
          audioManager.speakVi(
            `Hoan hô! Cả lớp đã tìm đúng tất cả hình ảnh chứa chữ ${targetLetters.join(' và ')}!`,
            undefined,
            undefined,
            'character'
          );
        } else {
          audioManager.playCorrect();
          setStatusMessage(`Đúng rồi! "${card.word}" có chứa chữ ${colLetter}!`);
          audioManager.speakVi(card.word);
        }
      } else {
        setWrongCardId(card.id);
        audioManager.playRetry();
        setStatusMessage(
          `Thẻ "${card.word}" chưa đúng cột chữ ${colLetter}, bé nhìn kỹ chữ cái trong từ nhé!`
        );
        audioManager.speakVi('Nhầm cột rồi, bé nhìn kỹ chữ cái trong từ nhé!');
        window.setTimeout(() => setWrongCardId(null), 650);
      }
    },
    [placedMap, deck.length, targetLetters]
  );

  const handleCardPointerDown = (e: React.PointerEvent<HTMLDivElement>, card: VocabCardItem) => {
    if (placedMap[card.id]) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({
      cardId: card.id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      dx: 0,
      dy: 0,
      hoveredCol: null,
    });
  };

  const handleCardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const hoveredCol = Math.hypot(dx, dy) > 10 ? findHoveredColumn(e.clientX, e.clientY) : null;
    setDrag({
      ...drag,
      dx,
      dy,
      hoveredCol,
    });
  };

  const handleCardPointerUp = (e: React.PointerEvent<HTMLDivElement>, card: VocabCardItem) => {
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const dist = Math.hypot(drag.dx, drag.dy);
    const dropCol = findHoveredColumn(e.clientX, e.clientY);
    setDrag(null);

    // Tap gesture: select card & speak word aloud so child can tap a column next
    if (dist < 10) {
      audioManager.playClick();
      setSelectedCardId((prev) => (prev === card.id ? null : card.id));
      setStatusMessage(`Đã chọn thẻ "${card.word}". Bé hãy chạm vào cột chữ đúng bên dưới nhé!`);
      audioManager.speakVi(card.word);
      return;
    }

    if (dropCol) {
      attemptPlaceCardInColumn(card, dropCol);
    }
  };

  const handleTapColumn = (colLetter: string) => {
    if (selectedCardId) {
      const card = deck.find((c) => c.id === selectedCardId);
      if (card) {
        attemptPlaceCardInColumn(card, colLetter);
        return;
      }
    }
    audioManager.playClick();
    audioManager.speakVi(`Cột chữ ${colLetter}`);
  };

  return (
    <div className="safe-pad relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-b from-sky-300 via-sky-100 to-lime-200 px-3 py-2.5 sm:px-6 sm:py-3.5 select-none">
      <ConfettiOverlay active={allSorted} />

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

        <div className="flex items-center gap-2 rounded-full border-4 border-emerald-500 bg-white px-4 py-1 sm:px-6 sm:py-1.5 shadow-[0_4px_0_rgba(16,185,129,0.28)]">
          <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
          <h1 className="font-heading text-base sm:text-xl md:text-2xl font-extrabold text-emerald-950">
            Chặng 7: Tìm Chữ Trong Tranh
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              setHighlightLetters((v) => !v);
            }}
            className="flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-2xl border-3 border-amber-400 bg-amber-50 px-3 py-1.5 font-heading text-xs sm:text-sm font-extrabold text-amber-950 shadow-xs hover:bg-amber-100"
          >
            {highlightLetters ? <Eye className="h-4 w-4 text-rose-600" /> : <EyeOff className="h-4 w-4" />}
            <span>{highlightLetters ? 'Đang tô chữ' : 'Ẩn tô chữ'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              resetGame(true);
            }}
            aria-label="Chơi lại"
            className="flex min-h-[44px] cursor-pointer items-center gap-1 rounded-2xl border-3 border-emerald-600 bg-emerald-500 px-3 py-1.5 font-heading text-xs sm:text-sm font-extrabold text-white shadow-[0_4px_0_#047857] hover:bg-emerald-400"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Trộn lại</span>
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

      {/* Instruction / Feedback Strip */}
      <div className="relative z-20 mx-auto mt-1.5 flex w-full max-w-5xl items-center justify-between gap-2 rounded-2xl border-2 border-white bg-white/90 px-3.5 py-1.5 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => audioManager.speakVi(statusMessage)}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-sky-600 text-white hover:bg-sky-500"
            aria-label="Nghe hướng dẫn"
          >
            <Volume2 className="h-4 w-4" />
          </button>
          <p className="text-xs sm:text-sm md:text-base font-bold text-slate-800">{statusMessage}</p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-0.5 font-heading text-xs sm:text-sm font-extrabold text-emerald-800">
          Đã xếp: {Object.keys(placedMap).length} / {deck.length}
        </span>
      </div>

      {/* Main Wordwall Group-Sort Board */}
      <main className="relative z-10 mx-auto my-2 flex w-full max-w-6xl flex-1 min-h-0 flex-col justify-between gap-2.5">
        {/* TOP PICTURE CARD TRAY (Or Victory Banner when all cards sorted!) */}
        {!allSorted ? (
          <section className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 rounded-3xl border-4 border-amber-300 bg-amber-50/90 p-2.5 sm:p-3.5 shadow-inner">
            {remainingCards.map((card) => {
              const isDraggingThis = drag?.cardId === card.id;
              const isSelected = selectedCardId === card.id;
              const isWrong = wrongCardId === card.id;

              return (
                <div
                  key={card.id}
                  role="button"
                  tabIndex={0}
                  onPointerDown={(e) => handleCardPointerDown(e, card)}
                  onPointerMove={handleCardPointerMove}
                  onPointerUp={(e) => handleCardPointerUp(e, card)}
                  onPointerCancel={(e) => handleCardPointerUp(e, card)}
                  style={{
                    transform: isDraggingThis
                      ? `translate(${drag.dx}px, ${drag.dy}px) scale(1.1) rotate(2deg)`
                      : isWrong
                        ? 'rotate(-6deg) scale(0.96)'
                        : undefined,
                    touchAction: 'none',
                  }}
                  className={`flex w-[98px] sm:w-[116px] md:w-[126px] cursor-grab active:cursor-grabbing flex-col items-center rounded-2xl border-3 bg-white p-1.5 sm:p-2 shadow-[0_5px_0_rgba(180,83,9,0.22)] select-none ${
                    isDraggingThis
                      ? 'z-50 border-blue-600 shadow-2xl transition-none'
                      : isSelected
                        ? 'z-20 -translate-y-1 border-blue-600 ring-4 ring-amber-400 transition'
                        : 'z-10 border-amber-400 hover:-translate-y-0.5 transition'
                  }`}
                >
                  <div className="h-12 w-12 sm:h-15 sm:w-15 md:h-16 md:w-16">
                    <VocabIllustration id={card.illustration} />
                  </div>
                  <HighlightedWord
                    word={card.word}
                    targetLetters={targetLetters}
                    highlight={highlightLetters}
                    className="mt-1 text-center text-sm sm:text-base font-extrabold leading-tight text-slate-900"
                  />
                </div>
              );
            })}
          </section>
        ) : (
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border-4 border-emerald-500 bg-white px-5 py-3 shadow-lg">
            <div className="flex items-center gap-3">
              <Star className="h-9 w-9 fill-amber-400 text-amber-500" />
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-emerald-800">
                  Hoan hô! Cả lớp phân loại đúng {deck.length}/{deck.length} thẻ tranh!
                </h2>
                <p className="text-xs sm:text-sm font-bold text-slate-600">
                  Cô và các bé hãy cùng đếm kiểm tra lại các tranh trong từng cột bên dưới nhé!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => resetGame(true)}
                className="flex min-h-[48px] cursor-pointer items-center gap-1.5 rounded-2xl border-3 border-emerald-600 bg-emerald-50 px-4 py-2 font-heading text-sm sm:text-base font-extrabold text-emerald-800 hover:bg-emerald-100"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Chơi tiếp sức lại</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  audioManager.playClick();
                  audioManager.stopSpeaking();
                  onNextStage();
                }}
                className="flex min-h-[48px] cursor-pointer items-center gap-1.5 rounded-2xl border-3 border-blue-800 bg-blue-600 px-5 py-2 font-heading text-sm sm:text-lg font-extrabold text-white shadow-[0_4px_0_#1E3A8A] hover:bg-blue-500"
              >
                <span>Sang Chặng 8</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </section>
        )}

        {/* BOTTOM SORTING COLUMNS (Matches Wordwall e | ê Columns in Video 1:42 & 2:02!) */}
        <section
          className={`grid flex-1 min-h-0 gap-3 sm:gap-4 ${
            targetLetters.length === 2
              ? 'grid-cols-2'
              : targetLetters.length >= 3
                ? 'grid-cols-3'
                : 'grid-cols-1'
          }`}
        >
          {targetLetters.map((colLetter, idx) => {
            const theme = COLUMN_THEMES[idx % COLUMN_THEMES.length];
            const colCards = deck.filter((c) => placedMap[c.id] === colLetter);
            const colTotal = deck.filter((c) => c.targetLetter === colLetter).length;
            const isHovered = drag?.hoveredCol === colLetter;

            return (
              <div
                key={colLetter}
                ref={(el) => {
                  columnRefs.current[colLetter] = el;
                }}
                onClick={() => handleTapColumn(colLetter)}
                className={`flex min-h-[160px] cursor-pointer flex-col overflow-hidden rounded-[28px] border-4 transition ${
                  theme.boxBorder
                } ${isHovered ? theme.ringHover : theme.boxBg} shadow-[0_8px_0_rgba(15,23,42,0.14)]`}
              >
                {/* Column Header with Big Letter */}
                <div
                  className={`flex items-center justify-between border-b-4 ${theme.headerBorder} ${theme.headerBg} px-4 py-2 text-white`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-sm sm:text-base font-bold opacity-90">
                      Cột chữ
                    </span>
                    <span className="font-letter rounded-2xl bg-white px-4 py-0.5 text-2xl sm:text-4xl font-extrabold text-slate-900 shadow-xs">
                      {colLetter}
                    </span>
                  </div>
                  <span className="rounded-full bg-black/25 px-3 py-0.5 font-heading text-xs sm:text-base font-extrabold">
                    {colCards.length} / {colTotal}
                  </span>
                </div>

                {/* Sorted Cards Grid Inside Column */}
                <div className="flex flex-1 flex-wrap content-start items-start justify-center gap-2 overflow-y-auto p-2.5 sm:p-3">
                  {colCards.length === 0 ? (
                    <div className="flex h-full w-full items-center justify-center text-center text-xs sm:text-sm font-bold text-slate-400">
                      Thả hoặc chạm để xếp tranh có chữ{' '}
                      <strong className="font-letter mx-1 text-base text-slate-600">
                        {colLetter}
                      </strong>{' '}
                      vào đây
                    </div>
                  ) : (
                    colCards.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          audioManager.playClick();
                          audioManager.speakVi(c.word);
                        }}
                        className="relative flex w-[88px] sm:w-[104px] cursor-pointer flex-col items-center rounded-2xl border-2 border-emerald-400 bg-white p-1.5 shadow-xs hover:scale-105 transition"
                      >
                        <CheckCircle2 className="absolute right-1 top-1 h-4 w-4 text-emerald-600" />
                        <div className="h-10 w-10 sm:h-12 sm:w-12">
                          <VocabIllustration id={c.illustration} />
                        </div>
                        <HighlightedWord
                          word={c.word}
                          targetLetters={[colLetter]}
                          highlight={true}
                          className="mt-0.5 text-xs sm:text-sm font-extrabold text-slate-900"
                        />
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* Bottom Stage Navigation */}
      <footer className="relative z-20 flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-950/80">
        <span>Hỗ trợ cả kéo–thả trực tiếp và chạm thẻ rồi chạm cột cho bé!</span>
        <button
          type="button"
          onClick={() => {
            audioManager.playClick();
            audioManager.stopSpeaking();
            onNextStage();
          }}
          className="flex min-h-[42px] cursor-pointer items-center gap-1.5 rounded-2xl border-3 border-purple-800 bg-purple-600 px-4 py-1.5 font-heading text-xs sm:text-base font-extrabold text-white shadow-[0_4px_0_#581C87] hover:bg-purple-500"
        >
          <span>Chặng 8: Đôi Bàn Tay Vàng</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </footer>
    </div>
  );
};
