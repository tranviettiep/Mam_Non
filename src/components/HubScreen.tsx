import React, { useState } from 'react';
import {
  Apple,
  Award,
  BookOpen,
  Camera,
  Check,
  Download,
  Edit3,
  Flower2,
  Footprints,
  LayoutGrid,
  Maximize2,
  Music,
  Palette,
  PenTool,
  PhoneCall,
  Play,
  Share2,
  Sliders,
  Smartphone,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ActiveScreen, LessonConfig } from '../types/lesson';
import { copyShareableLessonUrl, LESSON_PRESETS } from '../data/lessons';
import { audioManager } from '../utils/audio';
import { PwaInstallState } from '../utils/pwa';

interface HubScreenProps {
  lesson: LessonConfig;
  muted: boolean;
  pwaState: PwaInstallState;
  onToggleMute: () => void;
  onNavigate: (screen: ActiveScreen) => void;
  onSelectPreset: (preset: LessonConfig) => void;
  onOpenEditor: () => void;
  onOpenVoiceSettings: () => void;
  onExportHtml: () => void;
  onInstallApp: () => void;
}

export const HubScreen: React.FC<HubScreenProps> = ({
  lesson,
  muted,
  pwaState,
  onToggleMute,
  onNavigate,
  onSelectPreset,
  onOpenEditor,
  onOpenVoiceSettings,
  onExportHtml,
  onInstallApp,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const handleCopyShareLink = async () => {
    audioManager.playClick();
    await copyShareableLessonUrl(lesson);
    setCopiedShare(true);
    window.setTimeout(() => setCopiedShare(false), 2500);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const enterStage = (stage: ActiveScreen) => {
    audioManager.unlock();
    audioManager.playClick();
    onNavigate(stage);
  };

  const lettersLabel = lesson.targetLetters.join(', ');

  const stageCards: Array<{
    screen: ActiveScreen;
    badge: string;
    title: string;
    desc: React.ReactNode;
    cardCls: string;
    badgeCls: string;
    iconBoxCls: string;
    titleCls: string;
    descCls: string;
    btnCls: string;
    icon: React.ReactNode;
  }> = [
    {
      screen: 'stage1',
      badge: 'CHẶNG 1',
      title: 'Đường Đua Chữ Cái',
      desc: (
        <>
          Khởi động nhảy trái, phải, bật cao và đọc vang chữ{' '}
          <strong className="font-letter">{lettersLabel}</strong>!
        </>
      ),
      cardCls:
        'border-amber-500 bg-gradient-to-b from-amber-50 to-orange-100 shadow-[0_6px_0_#D97706] hover:shadow-[0_9px_0_#D97706]',
      badgeCls: 'bg-amber-500',
      iconBoxCls: 'border-amber-300 bg-amber-400 text-amber-950',
      titleCls: 'text-amber-950',
      descCls: 'text-amber-900/85',
      btnCls: 'border-amber-600 bg-amber-500 shadow-[0_3px_0_#B45309] group-hover:bg-amber-400',
      icon: <Footprints className="h-5 w-5 sm:h-6 sm:w-6" />,
    },
    {
      screen: 'stage2',
      badge: 'CHẶNG 2',
      title: 'Nghiêng Đầu Chọn Chữ',
      desc: (
        <>
          Thử thách {lesson.questions.length} câu hỏi tương tác thông minh cùng Camera AI hoặc chạm thẻ!
        </>
      ),
      cardCls:
        'border-blue-600 bg-gradient-to-b from-blue-50 to-indigo-100 shadow-[0_6px_0_#1D4ED8] hover:shadow-[0_9px_0_#1D4ED8]',
      badgeCls: 'bg-blue-600',
      iconBoxCls: 'border-blue-300 bg-blue-500 text-white',
      titleCls: 'text-blue-950',
      descCls: 'text-blue-900/85',
      btnCls: 'border-blue-800 bg-blue-600 shadow-[0_3px_0_#1E3A8A] group-hover:bg-blue-500',
      icon: <Camera className="h-5 w-5 sm:h-6 sm:w-6" />,
    },
    {
      screen: 'stage3',
      badge: 'CHẶNG 3',
      title: `Bé Tập Tô ${lettersLabel}`,
      desc: <>Rèn đôi tay khéo léo tô theo từng nét chấm hướng dẫn trên màn hình!</>,
      cardCls:
        'border-pink-600 bg-gradient-to-b from-pink-50 to-rose-100 shadow-[0_6px_0_#BE185D] hover:shadow-[0_9px_0_#BE185D]',
      badgeCls: 'bg-pink-600',
      iconBoxCls: 'border-pink-300 bg-pink-500 text-white',
      titleCls: 'text-pink-950',
      descCls: 'text-pink-900/85',
      btnCls: 'border-pink-800 bg-pink-600 shadow-[0_3px_0_#9D174D] group-hover:bg-pink-500',
      icon: <PenTool className="h-5 w-5 sm:h-6 sm:w-6" />,
    },
    {
      screen: 'stage4',
      badge: 'CHẶNG 4',
      title: 'Bé Vui Hái Táo',
      desc: (
        <>
          Tinh mắt kéo thả những quả táo đỏ mang chữ{' '}
          <strong className="font-letter">{lettersLabel}</strong> vào đúng giỏ mây!
        </>
      ),
      cardCls:
        'border-emerald-600 bg-gradient-to-b from-lime-50 to-emerald-100 shadow-[0_6px_0_#059669] hover:shadow-[0_9px_0_#059669]',
      badgeCls: 'bg-emerald-600',
      iconBoxCls: 'border-rose-200 bg-rose-500 text-white',
      titleCls: 'text-emerald-950',
      descCls: 'text-emerald-900/85',
      btnCls: 'border-emerald-800 bg-emerald-600 shadow-[0_3px_0_#047857] group-hover:bg-emerald-500',
      icon: <Apple className="h-5 w-5 sm:h-6 sm:w-6" />,
    },
    {
      screen: 'stage5',
      badge: 'CHẶNG 5',
      title: 'Cuốn Sách Kì Diệu',
      desc: (
        <>
          Mở trang sách phép thuật so sánh điểm giống, khác và ghép các nét tạo thành chữ{' '}
          <strong className="font-letter">{lettersLabel}</strong>!
        </>
      ),
      cardCls:
        'border-orange-500 bg-gradient-to-b from-yellow-50 to-amber-100 shadow-[0_6px_0_#C2410C] hover:shadow-[0_9px_0_#C2410C]',
      badgeCls: 'bg-orange-600',
      iconBoxCls: 'border-amber-200 bg-orange-500 text-white',
      titleCls: 'text-orange-950',
      descCls: 'text-orange-900/85',
      btnCls: 'border-orange-800 bg-orange-600 shadow-[0_3px_0_#9A3412] group-hover:bg-orange-500',
      icon: <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />,
    },
    {
      screen: 'stage6',
      badge: 'CHẶNG 6',
      title: 'Giải Mã Quizizz',
      desc: (
        <>
          Đấu trường 4 ô màu sôi động ôn cấu tạo nét và điền chữ{' '}
          <strong className="font-letter">{lettersLabel}</strong> còn thiếu!
        </>
      ),
      cardCls:
        'border-indigo-600 bg-gradient-to-b from-indigo-50 to-violet-100 shadow-[0_6px_0_#4338CA] hover:shadow-[0_9px_0_#4338CA]',
      badgeCls: 'bg-indigo-600',
      iconBoxCls: 'border-indigo-300 bg-indigo-500 text-white',
      titleCls: 'text-indigo-950',
      descCls: 'text-indigo-900/85',
      btnCls: 'border-indigo-800 bg-indigo-600 shadow-[0_3px_0_#312E81] group-hover:bg-indigo-500',
      icon: <Award className="h-5 w-5 sm:h-6 sm:w-6" />,
    },
    {
      screen: 'stage7',
      badge: 'CHẶNG 7',
      title: 'Tìm Chữ Trong Tranh',
      desc: (
        <>
          Trò chơi Wordwall kéo thả phân loại thẻ hình ảnh từ vựng vào đúng cột chữ{' '}
          <strong className="font-letter">{lettersLabel}</strong>!
        </>
      ),
      cardCls:
        'border-teal-600 bg-gradient-to-b from-teal-50 to-cyan-100 shadow-[0_6px_0_#0F766E] hover:shadow-[0_9px_0_#0F766E]',
      badgeCls: 'bg-teal-600',
      iconBoxCls: 'border-teal-200 bg-teal-500 text-white',
      titleCls: 'text-teal-950',
      descCls: 'text-teal-900/85',
      btnCls: 'border-teal-800 bg-teal-600 shadow-[0_3px_0_#115E59] group-hover:bg-teal-500',
      icon: <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6" />,
    },
    {
      screen: 'stage8',
      badge: 'CHẶNG 8',
      title: 'Đôi Bàn Tay Vàng',
      desc: (
        <>
          Lật hộp thẻ bí ẩn ghi nhớ mặt chữ rồi tự đặt bút viết từ chấm đỏ trên bảng màu sáng tạo!
        </>
      ),
      cardCls:
        'border-purple-600 bg-gradient-to-b from-fuchsia-50 to-purple-100 shadow-[0_6px_0_#7E22CE] hover:shadow-[0_9px_0_#7E22CE]',
      badgeCls: 'bg-purple-600',
      iconBoxCls: 'border-purple-200 bg-purple-500 text-white',
      titleCls: 'text-purple-950',
      descCls: 'text-purple-900/85',
      btnCls: 'border-purple-800 bg-purple-600 shadow-[0_3px_0_#581C87] group-hover:bg-purple-500',
      icon: <Palette className="h-5 w-5 sm:h-6 sm:w-6" />,
    },
    {
      screen: 'stage9',
      badge: 'CHẶNG 9',
      title: 'Vườn Hoa Chữ Cái',
      desc: (
        <>
          Chọn 10 bông hoa đánh số để lật mở và phát âm chữ{' '}
          <strong className="font-letter">{lettersLabel}</strong> hoặc 10 nguyên âm!
        </>
      ),
      cardCls:
        'border-rose-500 bg-gradient-to-b from-rose-50 to-pink-100 shadow-[0_6px_0_#E11D48] hover:shadow-[0_9px_0_#E11D48]',
      badgeCls: 'bg-rose-500',
      iconBoxCls: 'border-rose-200 bg-rose-500 text-white',
      titleCls: 'text-rose-950',
      descCls: 'text-rose-900/85',
      btnCls: 'border-rose-700 bg-rose-500 shadow-[0_3px_0_#9F1239] group-hover:bg-rose-400',
      icon: <Flower2 className="h-5 w-5 sm:h-6 sm:w-6" />,
    },
    {
      screen: 'stage10',
      badge: 'CHẶNG 10',
      title: 'Vũ Điệu Bạn Chữ',
      desc: (
        <>
          Vui múa cùng nhân vật hoạt hình 3D chữ{' '}
          <strong className="font-letter">{lettersLabel}</strong> với 4 điệu nhảy sôi động!
        </>
      ),
      cardCls:
        'border-cyan-600 bg-gradient-to-b from-cyan-50 to-sky-100 shadow-[0_6px_0_#0284C7] hover:shadow-[0_9px_0_#0284C7]',
      badgeCls: 'bg-cyan-600',
      iconBoxCls: 'border-cyan-200 bg-sky-500 text-white',
      titleCls: 'text-sky-950',
      descCls: 'text-sky-900/85',
      btnCls: 'border-sky-800 bg-sky-600 shadow-[0_3px_0_#075985] group-hover:bg-sky-500',
      icon: <Music className="h-5 w-5 sm:h-6 sm:w-6" />,
    },
    {
      screen: 'stage11',
      badge: 'CHẶNG 11',
      title: 'Bảng Vàng Phát Âm',
      desc: (
        <>
          Luyện khẩu hình, đọc đồng thanh theo nhịp 1–2–3 cùng bảng chữ{' '}
          <strong className="font-letter">{lettersLabel}</strong> nổi 3D!
        </>
      ),
      cardCls:
        'border-yellow-500 bg-gradient-to-b from-amber-50 to-yellow-100 shadow-[0_6px_0_#CA8A04] hover:shadow-[0_9px_0_#CA8A04]',
      badgeCls: 'bg-amber-500',
      iconBoxCls: 'border-yellow-200 bg-amber-400 text-amber-950',
      titleCls: 'text-amber-950',
      descCls: 'text-amber-900/85',
      btnCls: 'border-amber-700 bg-amber-500 shadow-[0_3px_0_#92400E] group-hover:bg-amber-400',
      icon: <Sun className="h-5 w-5 sm:h-6 sm:w-6" />,
    },
  ];

  return (
    <div className="hub-scroll absolute inset-0 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-sky-400 via-sky-100 to-emerald-100">
      {/* Decorative Space/Playground Backdrop */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-16 top-10 h-40 w-80 rounded-full bg-white/65 blur-md" />
        <div className="absolute -right-12 top-16 h-36 w-72 rounded-full bg-white/65 blur-md" />
        <div className="absolute -bottom-24 left-1/2 h-52 w-[120%] -translate-x-1/2 rounded-[100%] bg-emerald-300/50" />
      </div>

      <div className="hub-safe-inner relative z-10 mx-auto flex min-h-full w-full max-w-7xl flex-col justify-between gap-2.5 sm:gap-3">
        {/* Header Banner (School + Title + Class + Preset Switcher) */}
        <header className="shrink-0 flex flex-col items-center">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          <div className="rounded-full border-3 border-amber-400 bg-amber-50 px-3.5 py-0.5 sm:px-6 sm:py-1 shadow-[0_3px_0_rgba(217,119,6,0.3)]">
            <span className="font-heading text-xs sm:text-base md:text-xl font-extrabold tracking-wide text-blue-900">
              {lesson.schoolName}
            </span>
          </div>
          <div className="rounded-full border-3 border-amber-600 bg-amber-400 px-3 py-0.5 sm:px-4 sm:py-1 shadow-[0_3px_0_rgba(180,83,9,0.35)]">
            <span className="font-heading text-xs sm:text-base md:text-xl font-extrabold text-red-900">
              {lesson.className}
            </span>
          </div>

          {!pwaState.isStandalone && (
            <button
              type="button"
              onClick={onInstallApp}
              className="flex xl:hidden cursor-pointer items-center gap-1.5 rounded-full border-3 border-emerald-700 bg-emerald-500 px-3 py-0.5 font-heading text-xs font-extrabold text-white shadow-[0_3px_0_#047857] hover:bg-emerald-400 active:translate-y-0.5"
            >
              <Smartphone className="h-3.5 w-3.5" />
              Cài đặt App
            </button>
          )}
        </div>

        <div className="mt-1 flex items-center gap-2">
          <Sparkles className="hidden sm:block h-6 w-6 md:h-7 md:w-7 text-amber-500" />
          <h1 className="font-heading text-center text-xl sm:text-3xl md:text-4xl 2xl:text-5xl font-extrabold uppercase tracking-tight text-blue-900 drop-shadow-[0_3px_0_#ffffff]">
            {lesson.title}:{' '}
            <span className="font-letter normal-case text-pink-600">
              {lesson.targetLetters.join(' – ')}
            </span>
          </h1>
          <Sparkles className="hidden sm:block h-6 w-6 md:h-7 md:w-7 text-amber-500" />
        </div>

        {/* Quick Lesson Group Selector */}
        <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900/80">
            Nhóm chữ:
          </span>
          {LESSON_PRESETS.map((preset) => {
            const isSelected = preset.targetLetters.join(',') === lesson.targetLetters.join(',');
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  audioManager.playClick();
                  onSelectPreset(preset);
                }}
                className={`font-letter cursor-pointer rounded-full border-2 px-3 py-0.5 sm:px-3.5 text-xs sm:text-sm font-extrabold transition ${
                  isSelected
                    ? 'border-blue-800 bg-blue-600 text-white shadow-[0_3px_0_#1E3A8A]'
                    : 'border-white bg-white/85 text-blue-900 hover:bg-white'
                }`}
              >
                {preset.targetLetters.join(', ')}
              </button>
            );
          })}
        </div>
      </header>

        {/* 8 Main Stage Cards (2x4 Claymorphism Grid on TV/Desktop, 2x4 on iPad, 1 col Mobile) */}
        <main className="my-auto grid w-full shrink-0 grid-cols-1 gap-3 py-1 sm:grid-cols-2 xl:grid-cols-4 xl:gap-3.5 2xl:gap-4">
          {stageCards.map((st, idx) => (
            <button
              key={st.screen}
              type="button"
              onClick={() => enterStage(st.screen)}
              className={`group flex touch-manipulation cursor-pointer flex-col justify-between rounded-[24px] border-4 p-3 sm:p-3.5 2xl:p-4 text-left transition duration-150 hover:-translate-y-0.5 active:translate-y-0.5 ${st.cardCls}`}
            >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-3 py-0.5 font-heading text-xs sm:text-sm font-extrabold text-white ${st.badgeCls}`}
                >
                  {st.badge}
                </span>
                <div
                  className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border-3 shadow-xs ${st.iconBoxCls}`}
                >
                  {st.icon}
                </div>
              </div>
              <h2
                className={`font-heading mt-1.5 text-lg sm:text-xl 2xl:text-2xl font-extrabold leading-tight ${st.titleCls}`}
              >
                {st.title}
              </h2>
              <p
                className={`mt-1 line-clamp-2 text-xs sm:text-sm font-semibold leading-snug ${st.descCls}`}
              >
                {st.desc}
              </p>
            </div>

            <div
              className={`mt-2.5 flex items-center justify-center gap-1.5 rounded-xl border-2 py-1.5 2xl:py-2 font-heading text-sm sm:text-base font-extrabold text-white ${st.btnCls}`}
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Vào Chặng {idx + 1}</span>
            </div>
          </button>
        ))}
      </main>

        {/* Bottom Teacher & Device Control Dock */}
        <footer className="shrink-0 mx-auto flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 rounded-2xl border-2 border-white bg-white/92 px-3 py-2 sm:px-4 shadow-md backdrop-blur">
        <button
          type="button"
          onClick={() => onNavigate('call')}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-2.5 py-1.5 sm:px-3 font-heading text-xs sm:text-sm font-bold text-white transition hover:bg-emerald-500"
        >
          <PhoneCall className="h-4 w-4" />
          <span>Cuộc gọi mở đầu</span>
        </button>

        <button
          type="button"
          onClick={onInstallApp}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-teal-700 bg-teal-600 px-2.5 py-1.5 sm:px-3 font-heading text-xs sm:text-sm font-extrabold text-white shadow-xs transition hover:bg-teal-500"
        >
          <Smartphone className="h-4 w-4" />
          <span>{pwaState.isStandalone ? 'Đã mở App' : 'Cài đặt App'}</span>
        </button>

        <button
          type="button"
          onClick={onOpenEditor}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-violet-600 px-2.5 py-1.5 sm:px-3 font-heading text-xs sm:text-sm font-bold text-white transition hover:bg-violet-500"
        >
          <Edit3 className="h-4 w-4" />
          <span>Chỉnh sửa bài học</span>
        </button>

        <button
          type="button"
          onClick={handleCopyShareLink}
          className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 sm:px-3 font-heading text-xs sm:text-sm font-bold text-white transition ${
            copiedShare ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-sky-600 hover:bg-sky-500'
          }`}
        >
          {copiedShare ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          <span>{copiedShare ? 'Đã chép link!' : 'Chia sẻ link'}</span>
        </button>

        <button
          type="button"
          onClick={onExportHtml}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-orange-500 px-2.5 py-1.5 sm:px-3 font-heading text-xs sm:text-sm font-bold text-white transition hover:bg-orange-400"
        >
          <Download className="h-4 w-4" />
          <span>Tải game (.html)</span>
        </button>

        <button
          type="button"
          onClick={onOpenVoiceSettings}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-pink-600 px-2.5 py-1.5 sm:px-3 font-heading text-xs sm:text-sm font-bold text-white transition hover:bg-pink-500"
        >
          <Sliders className="h-4 w-4" />
          <span>Giọng nói</span>
        </button>

        <button
          type="button"
          onClick={onToggleMute}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-2.5 py-1.5 sm:px-3 font-heading text-xs sm:text-sm font-bold text-slate-700 transition hover:bg-slate-200"
        >
          {muted ? (
            <VolumeX className="h-4 w-4 text-rose-600" />
          ) : (
            <Volume2 className="h-4 w-4 text-blue-600" />
          )}
          <span>{muted ? 'Tắt tiếng' : 'Âm thanh'}</span>
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="hidden sm:flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 font-heading text-xs sm:text-sm font-bold text-slate-700 transition hover:bg-slate-200"
        >
          <Maximize2 className="h-4 w-4" />
          <span>Toàn màn hình</span>
        </button>
        </footer>
      </div>
    </div>
  );
};
