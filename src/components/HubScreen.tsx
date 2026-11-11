import React, { useState } from 'react';
import {
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
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ActiveScreen, LessonConfig } from '../types/lesson';
import { copyShareableLessonUrl, LESSON_PRESETS } from '../data/lessons';
import { audioManager } from '../utils/audio';

interface HubScreenProps {
  lesson: LessonConfig;
  muted: boolean;
  onToggleMute: () => void;
  onNavigate: (screen: ActiveScreen) => void;
  onSelectPreset: (preset: LessonConfig) => void;
  onOpenEditor: () => void;
  onOpenVoiceSettings: () => void;
  onExportHtml: () => void;
}

export const HubScreen: React.FC<HubScreenProps> = ({
  lesson,
  muted,
  onToggleMute,
  onNavigate,
  onSelectPreset,
  onOpenEditor,
  onOpenVoiceSettings,
  onExportHtml,
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
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-b from-sky-400 via-sky-100 to-emerald-100 px-6 py-4">
      {/* Decorative Space/Playground Backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-16 top-10 h-40 w-80 rounded-full bg-white/65 blur-md" />
        <div className="absolute -right-12 top-16 h-36 w-72 rounded-full bg-white/65 blur-md" />
        <div className="absolute -bottom-24 left-1/2 h-52 w-[120%] -translate-x-1/2 rounded-[100%] bg-emerald-300/50" />
      </div>

      {/* Header Banner (School + Title + Class + Preset Switcher) */}
      <header className="relative z-10 flex flex-col items-center">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="rounded-full border-4 border-amber-400 bg-amber-50 px-7 py-1.5 shadow-[0_5px_0_rgba(217,119,6,0.3)]">
            <span className="font-heading text-lg font-extrabold tracking-wide text-blue-900 md:text-2xl">
              {lesson.schoolName}
            </span>
          </div>
          <div className="rounded-full border-4 border-amber-600 bg-amber-400 px-5 py-1.5 shadow-[0_5px_0_rgba(180,83,9,0.35)]">
            <span className="font-heading text-lg font-extrabold text-red-900 md:text-2xl">{lesson.className}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-amber-500" />
          <h1 className="font-heading text-center text-4xl font-extrabold uppercase tracking-tight text-blue-900 drop-shadow-[0_3px_0_#ffffff] md:text-6xl">
            {lesson.title}:{' '}
            <span className="font-letter text-pink-600">{lesson.targetLetters.join(' – ')}</span>
          </h1>
          <Sparkles className="h-8 w-8 text-amber-500" />
        </div>

        {/* Quick Lesson Group Selector */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
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
                className={`font-letter cursor-pointer rounded-full border-2 px-4 py-1 text-base font-extrabold transition ${
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

      {/* 3 Main Stage Cards */}
      <main className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-6 py-3 md:grid-cols-3">
        {/* Stage 1 */}
        <button
          type="button"
          onClick={() => {
            audioManager.unlock();
            audioManager.playClick();
            onNavigate('stage1');
          }}
          className="group flex h-full max-h-[340px] cursor-pointer flex-col justify-between rounded-[32px] border-4 border-amber-500 bg-gradient-to-b from-amber-50 to-orange-100 p-6 text-left shadow-[0_10px_0_#D97706] transition duration-200 hover:-translate-y-1.5 hover:shadow-[0_14px_0_#D97706] active:translate-y-1"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-amber-500 px-4 py-1 font-heading text-base font-extrabold text-white">
                CHẶNG 1
              </span>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-amber-300 bg-amber-400 text-amber-950 shadow-sm">
                <Footprints className="h-8 w-8" />
              </div>
            </div>
            <h2 className="font-heading mt-4 text-3xl font-extrabold text-amber-950">Đường Đua Chữ Cái</h2>
            <p className="mt-2 text-base font-semibold text-amber-900/80">
              Khởi động vận động cả lớp qua 2 Level: nhảy trái, nhảy phải, bật cao và hô vang chữ cái{' '}
              <strong className="font-letter">{lesson.targetLetters.join(', ')}</strong>!
            </p>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-amber-600 bg-amber-500 py-3 font-heading text-xl font-extrabold text-white shadow-[0_4px_0_#B45309] group-hover:bg-amber-400">
            <Play className="h-6 w-6 fill-current" />
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
          className="group flex h-full max-h-[340px] cursor-pointer flex-col justify-between rounded-[32px] border-4 border-blue-600 bg-gradient-to-b from-blue-50 to-indigo-100 p-6 text-left shadow-[0_10px_0_#1D4ED8] transition duration-200 hover:-translate-y-1.5 hover:shadow-[0_14px_0_#1D4ED8] active:translate-y-1"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-blue-600 px-4 py-1 font-heading text-base font-extrabold text-white">
                CHẶNG 2
              </span>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-blue-300 bg-blue-500 text-white shadow-sm">
                <Camera className="h-8 w-8" />
              </div>
            </div>
            <h2 className="font-heading mt-4 text-3xl font-extrabold text-blue-950">Nghiêng Đầu Chọn Chữ</h2>
            <p className="mt-2 text-base font-semibold text-blue-900/80">
              Thử thách trí tuệ {lesson.questions.length} câu hỏi tương tác thông minh cùng Camera nhận diện góc nghiêng đầu!
            </p>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-blue-800 bg-blue-600 py-3 font-heading text-xl font-extrabold text-white shadow-[0_4px_0_#1E3A8A] group-hover:bg-blue-500">
            <Play className="h-6 w-6 fill-current" />
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
          className="group flex h-full max-h-[340px] cursor-pointer flex-col justify-between rounded-[32px] border-4 border-pink-600 bg-gradient-to-b from-pink-50 to-rose-100 p-6 text-left shadow-[0_10px_0_#BE185D] transition duration-200 hover:-translate-y-1.5 hover:shadow-[0_14px_0_#BE185D] active:translate-y-1"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-pink-600 px-4 py-1 font-heading text-base font-extrabold text-white">
                CHẶNG 3
              </span>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-pink-300 bg-pink-500 text-white shadow-sm">
                <PenTool className="h-8 w-8" />
              </div>
            </div>
            <h2 className="font-heading mt-4 text-3xl font-extrabold text-pink-950">
              Bé Yêu Chữ Cái {lesson.targetLetters.join(', ')}
            </h2>
            <p className="mt-2 text-base font-semibold text-pink-900/80">
              Thử tài khéo léo thực hành tập viết từng nét chấm trên màn hình cảm ứng hoặc chuột máy tính!
            </p>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-pink-800 bg-pink-600 py-3 font-heading text-xl font-extrabold text-white shadow-[0_4px_0_#9D174D] group-hover:bg-pink-500">
            <Play className="h-6 w-6 fill-current" />
            Vào Chặng 3
          </div>
        </button>
      </main>

      {/* Bottom Teacher Control Dock */}
      <footer className="relative z-10 mx-auto flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-white bg-white/90 px-5 py-2.5 shadow-md backdrop-blur">
        <button
          type="button"
          onClick={() => onNavigate('call')}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-heading text-base font-bold text-white transition hover:bg-emerald-500"
        >
          <PhoneCall className="h-4 w-4" />
          Cuộc gọi mở đầu
        </button>

        <button
          type="button"
          onClick={onOpenEditor}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 font-heading text-base font-bold text-white transition hover:bg-violet-500"
        >
          <Edit3 className="h-4 w-4" />
          Chỉnh sửa bài học
        </button>

        <button
          type="button"
          onClick={handleCopyShareLink}
          className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 font-heading text-base font-bold text-white transition ${
            copiedShare ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-sky-600 hover:bg-sky-500'
          }`}
        >
          {copiedShare ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          {copiedShare ? 'Đã chép link!' : 'Chia sẻ link'}
        </button>

        <button
          type="button"
          onClick={onExportHtml}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 font-heading text-base font-bold text-white transition hover:bg-orange-400"
        >
          <Download className="h-4 w-4" />
          Tải game (.html)
        </button>

        <button
          type="button"
          onClick={onOpenVoiceSettings}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-pink-600 px-4 py-2 font-heading text-base font-bold text-white transition hover:bg-pink-500"
        >
          <Sliders className="h-4 w-4" />
          Cài đặt giọng nói
        </button>

        <button
          type="button"
          onClick={onToggleMute}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 font-heading text-base font-bold text-slate-700 transition hover:bg-slate-200"
        >
          {muted ? <VolumeX className="h-4 w-4 text-rose-600" /> : <Volume2 className="h-4 w-4 text-blue-600" />}
          {muted ? 'Đang tắt tiếng' : 'Âm thanh: Bật'}
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 font-heading text-base font-bold text-slate-700 transition hover:bg-slate-200"
        >
          <Maximize2 className="h-4 w-4" />
          Toàn màn hình
        </button>
      </footer>
    </div>
  );
};
