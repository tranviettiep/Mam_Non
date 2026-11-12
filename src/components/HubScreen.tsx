import React, { useState } from 'react';
import {
  Apple,
  Camera,
  Check,
  Download,
  Edit3,
  Footprints,
  Maximize2,
  PenTool,
  PhoneCall,
  Play,
  Share2,
  Sliders,
  Smartphone,
  Sparkles,
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

  return (
    <div className="safe-pad relative flex h-full w-full flex-col justify-between overflow-y-auto xl:overflow-hidden bg-gradient-to-b from-sky-400 via-sky-100 to-emerald-100 px-3 py-3 sm:px-6 sm:py-4">
      {/* Decorative Space/Playground Backdrop */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-16 top-10 h-40 w-80 rounded-full bg-white/65 blur-md" />
        <div className="absolute -right-12 top-16 h-36 w-72 rounded-full bg-white/65 blur-md" />
        <div className="absolute -bottom-24 left-1/2 h-52 w-[120%] -translate-x-1/2 rounded-[100%] bg-emerald-300/50" />
      </div>

      {/* Header Banner (School + Title + Class + Preset Switcher) */}
      <header className="relative z-10 flex flex-col items-center">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <div className="rounded-full border-3 sm:border-4 border-amber-400 bg-amber-50 px-4 py-1 sm:px-7 sm:py-1.5 shadow-[0_4px_0_rgba(217,119,6,0.3)]">
            <span className="font-heading text-sm sm:text-lg md:text-2xl font-extrabold tracking-wide text-blue-900">
              {lesson.schoolName}
            </span>
          </div>
          <div className="rounded-full border-3 sm:border-4 border-amber-600 bg-amber-400 px-3.5 py-1 sm:px-5 sm:py-1.5 shadow-[0_4px_0_rgba(180,83,9,0.35)]">
            <span className="font-heading text-sm sm:text-lg md:text-2xl font-extrabold text-red-900">
              {lesson.className}
            </span>
          </div>

          {/* Quick Install App Badge on Mobile & Tablet */}
          {!pwaState.isStandalone && (
            <button
              type="button"
              onClick={onInstallApp}
              className="flex xl:hidden cursor-pointer items-center gap-1.5 rounded-full border-3 border-emerald-700 bg-emerald-500 px-3.5 py-1 font-heading text-xs sm:text-sm font-extrabold text-white shadow-[0_3px_0_#047857] hover:bg-emerald-400 active:translate-y-0.5"
            >
              <Smartphone className="h-4 w-4" />
              Cài đặt App
            </button>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2 sm:gap-3">
          <Sparkles className="hidden sm:block h-7 w-7 md:h-8 md:w-8 text-amber-500" />
          <h1 className="font-heading text-center text-2xl sm:text-4xl md:text-5xl xl:text-6xl font-extrabold uppercase tracking-tight text-blue-900 drop-shadow-[0_3px_0_#ffffff]">
            {lesson.title}:{' '}
            <span className="font-letter normal-case text-pink-600">
              {lesson.targetLetters.join(' – ')}
            </span>
          </h1>
          <Sparkles className="hidden sm:block h-7 w-7 md:h-8 md:w-8 text-amber-500" />
        </div>

        {/* Quick Lesson Group Selector */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900/80">Nhóm chữ:</span>
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
                className={`font-letter cursor-pointer rounded-full border-2 px-3 py-1 sm:px-4 text-sm sm:text-base font-extrabold transition ${
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

      {/* 4 Main Stage Cards (1 col mobile -> 2x2 iPad/Tablet -> 4 cols TV/Desktop) */}
      <main className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-stretch gap-4 py-3 sm:grid-cols-2 xl:grid-cols-4 xl:items-center xl:gap-5">
        {/* Stage 1 */}
        <button
          type="button"
          onClick={() => {
            audioManager.unlock();
            audioManager.playClick();
            onNavigate('stage1');
          }}
          className="group flex h-full xl:max-h-[340px] cursor-pointer flex-col justify-between rounded-[28px] sm:rounded-[32px] border-4 border-amber-500 bg-gradient-to-b from-amber-50 to-orange-100 p-4 sm:p-5 text-left shadow-[0_8px_0_#D97706] transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_0_#D97706] active:translate-y-1"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-amber-500 px-3.5 py-1 font-heading text-sm sm:text-base font-extrabold text-white">
                CHẶNG 1
              </span>
              <div className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-2xl border-4 border-amber-300 bg-amber-400 text-amber-950 shadow-sm">
                <Footprints className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
            </div>
            <h2 className="font-heading mt-3 text-2xl sm:text-3xl font-extrabold text-amber-950">
              Đường Đua Chữ Cái
            </h2>
            <p className="mt-1.5 text-sm sm:text-base font-semibold text-amber-900/85">
              Khởi động vận động qua 2 Level: nhảy trái, nhảy phải, bật cao và đọc vang chữ{' '}
              <strong className="font-letter">{lesson.targetLetters.join(', ')}</strong>!
            </p>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-amber-600 bg-amber-500 py-2.5 sm:py-3 font-heading text-lg sm:text-xl font-extrabold text-white shadow-[0_4px_0_#B45309] group-hover:bg-amber-400">
            <Play className="h-5 w-5 fill-current" />
            Vào Chặng 1
          </div>
        </button>

        {/* Stage 2 */}
        <button
          type="button"
          onClick={() => {
            audioManager.unlock();
            audioManager.playClick();
            onNavigate('stage2');
          }}
          className="group flex h-full xl:max-h-[340px] cursor-pointer flex-col justify-between rounded-[28px] sm:rounded-[32px] border-4 border-blue-600 bg-gradient-to-b from-blue-50 to-indigo-100 p-4 sm:p-5 text-left shadow-[0_8px_0_#1D4ED8] transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_0_#1D4ED8] active:translate-y-1"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-blue-600 px-3.5 py-1 font-heading text-sm sm:text-base font-extrabold text-white">
                CHẶNG 2
              </span>
              <div className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-2xl border-4 border-blue-300 bg-blue-500 text-white shadow-sm">
                <Camera className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
            </div>
            <h2 className="font-heading mt-3 text-2xl sm:text-3xl font-extrabold text-blue-950">
              Nghiêng Đầu Chọn Chữ
            </h2>
            <p className="mt-1.5 text-sm sm:text-base font-semibold text-blue-900/85">
              Thử thách trí tuệ {lesson.questions.length} câu hỏi tương tác thông minh cùng Camera AI hoặc chạm thẻ!
            </p>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-blue-800 bg-blue-600 py-2.5 sm:py-3 font-heading text-lg sm:text-xl font-extrabold text-white shadow-[0_4px_0_#1E3A8A] group-hover:bg-blue-500">
            <Play className="h-5 w-5 fill-current" />
            Vào Chặng 2
          </div>
        </button>

        {/* Stage 3 */}
        <button
          type="button"
          onClick={() => {
            audioManager.unlock();
            audioManager.playClick();
            onNavigate('stage3');
          }}
          className="group flex h-full xl:max-h-[340px] cursor-pointer flex-col justify-between rounded-[28px] sm:rounded-[32px] border-4 border-pink-600 bg-gradient-to-b from-pink-50 to-rose-100 p-4 sm:p-5 text-left shadow-[0_8px_0_#BE185D] transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_0_#BE185D] active:translate-y-1"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-pink-600 px-3.5 py-1 font-heading text-sm sm:text-base font-extrabold text-white">
                CHẶNG 3
              </span>
              <div className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-2xl border-4 border-pink-300 bg-pink-500 text-white shadow-sm">
                <PenTool className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
            </div>
            <h2 className="font-heading mt-3 text-2xl sm:text-3xl font-extrabold text-pink-950">
              Bé Tập Tô {lesson.targetLetters.join(', ')}
            </h2>
            <p className="mt-1.5 text-sm sm:text-base font-semibold text-pink-900/85">
              Rèn đôi tay khéo léo tập viết từng nét chấm trên màn hình cảm ứng hoặc chuột máy tính!
            </p>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-pink-800 bg-pink-600 py-2.5 sm:py-3 font-heading text-lg sm:text-xl font-extrabold text-white shadow-[0_4px_0_#9D174D] group-hover:bg-pink-500">
            <Play className="h-5 w-5 fill-current" />
            Vào Chặng 3
          </div>
        </button>

        {/* Stage 4: Bé Vui Hái Táo */}
        <button
          type="button"
          onClick={() => {
            audioManager.unlock();
            audioManager.playClick();
            onNavigate('stage4');
          }}
          className="group flex h-full xl:max-h-[340px] cursor-pointer flex-col justify-between rounded-[28px] sm:rounded-[32px] border-4 border-emerald-600 bg-gradient-to-b from-lime-50 to-emerald-100 p-4 sm:p-5 text-left shadow-[0_8px_0_#059669] transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_0_#059669] active:translate-y-1"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-600 px-3.5 py-1 font-heading text-sm sm:text-base font-extrabold text-white">
                CHẶNG 4
              </span>
              <div className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-2xl border-4 border-rose-200 bg-rose-500 text-white shadow-sm">
                <Apple className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
            </div>
            <h2 className="font-heading mt-3 text-2xl sm:text-3xl font-extrabold text-emerald-950">
              Bé Vui Hái Táo
            </h2>
            <p className="mt-1.5 text-sm sm:text-base font-semibold text-emerald-900/85">
              Tinh mắt kéo thả những quả táo đỏ mang chữ{' '}
              <strong className="font-letter">
                {lesson.targetLetters.map((c) => c.toLowerCase()).join(', ')}
              </strong>{' '}
              trên cây vào đúng giỏ mây!
            </p>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-800 bg-emerald-600 py-2.5 sm:py-3 font-heading text-lg sm:text-xl font-extrabold text-white shadow-[0_4px_0_#047857] group-hover:bg-emerald-500">
            <Play className="h-5 w-5 fill-current" />
            Vào Chặng 4
          </div>
        </button>
      </main>

      {/* Bottom Teacher & Device Control Dock */}
      <footer className="relative z-10 mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 rounded-2xl border-2 border-white bg-white/92 px-3 py-2 sm:px-5 sm:py-2.5 shadow-md backdrop-blur">
        <button
          type="button"
          onClick={() => onNavigate('call')}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 sm:px-3.5 font-heading text-sm sm:text-base font-bold text-white transition hover:bg-emerald-500"
        >
          <PhoneCall className="h-4 w-4" />
          <span>Cuộc gọi mở đầu</span>
        </button>

        <button
          type="button"
          onClick={onInstallApp}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-teal-700 bg-teal-600 px-3 py-2 sm:px-3.5 font-heading text-sm sm:text-base font-extrabold text-white shadow-xs transition hover:bg-teal-500"
        >
          <Smartphone className="h-4 w-4" />
          <span>{pwaState.isStandalone ? 'Đã mở App' : 'Cài đặt App'}</span>
        </button>

        <button
          type="button"
          onClick={onOpenEditor}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 sm:px-3.5 font-heading text-sm sm:text-base font-bold text-white transition hover:bg-violet-500"
        >
          <Edit3 className="h-4 w-4" />
          <span>Chỉnh sửa bài học</span>
        </button>

        <button
          type="button"
          onClick={handleCopyShareLink}
          className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 sm:px-3.5 font-heading text-sm sm:text-base font-bold text-white transition ${
            copiedShare ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-sky-600 hover:bg-sky-500'
          }`}
        >
          {copiedShare ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          <span>{copiedShare ? 'Đã chép link!' : 'Chia sẻ link'}</span>
        </button>

        <button
          type="button"
          onClick={onExportHtml}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-2 sm:px-3.5 font-heading text-sm sm:text-base font-bold text-white transition hover:bg-orange-400"
        >
          <Download className="h-4 w-4" />
          <span>Tải game (.html)</span>
        </button>

        <button
          type="button"
          onClick={onOpenVoiceSettings}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-pink-600 px-3 py-2 sm:px-3.5 font-heading text-sm sm:text-base font-bold text-white transition hover:bg-pink-500"
        >
          <Sliders className="h-4 w-4" />
          <span>Giọng nói</span>
        </button>

        <button
          type="button"
          onClick={onToggleMute}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 sm:px-3.5 font-heading text-sm sm:text-base font-bold text-slate-700 transition hover:bg-slate-200"
        >
          {muted ? <VolumeX className="h-4 w-4 text-rose-600" /> : <Volume2 className="h-4 w-4 text-blue-600" />}
          <span>{muted ? 'Tắt tiếng' : 'Âm thanh'}</span>
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="hidden sm:flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3.5 py-2 font-heading text-sm sm:text-base font-bold text-slate-700 transition hover:bg-slate-200"
        >
          <Maximize2 className="h-4 w-4" />
          <span>Toàn màn hình</span>
        </button>
      </footer>
    </div>
  );
};
