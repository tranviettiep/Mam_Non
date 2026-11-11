import React, { useEffect, useState } from 'react';
import {
  Check,
  Gauge,
  Heart,
  Music,
  Play,
  RotateCcw,
  Sliders,
  Smile,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { VoicePreset, VoiceSettings } from '../types/lesson';
import { audioManager } from '../utils/audio';

interface VoiceSettingsModalProps {
  open: boolean;
  settings: VoiceSettings;
  onChangeSettings: (patch: Partial<VoiceSettings>) => void;
  onResetSettings: () => void;
  onClose: () => void;
}

interface PresetOption {
  id: VoicePreset;
  title: string;
  badge?: string;
  desc: string;
  activeBorder: string;
  activeBg: string;
  iconBg: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const PRESET_OPTIONS: PresetOption[] = [
  {
    id: 'auto_role',
    title: 'Tự động theo vai',
    badge: 'Khuyên dùng',
    desc: 'Cuộc gọi mở đầu dùng giọng Bạn nhỏ nhí nhảnh; Chặng 1–3 dùng giọng Cô giáo dịu dàng.',
    activeBorder: 'border-blue-600 ring-4 ring-blue-200',
    activeBg: 'bg-blue-50/90',
    iconBg: 'bg-blue-600 text-white',
    Icon: Sparkles,
  },
  {
    id: 'teacher_sweet',
    title: 'Cô giáo dịu dàng',
    desc: 'Giọng nữ ấm áp, truyền cảm, phát âm tròn vành rõ chữ chuẩn sư phạm mầm non.',
    activeBorder: 'border-pink-600 ring-4 ring-pink-200',
    activeBg: 'bg-pink-50/90',
    iconBg: 'bg-pink-500 text-white',
    Icon: Heart,
  },
  {
    id: 'cartoon_cute',
    title: 'Bạn nhỏ nhí nhảnh',
    desc: 'Tông giọng nữ cao, tươi vui và đáng yêu như bạn nhỏ hoạt hình đồng hành cùng lớp.',
    activeBorder: 'border-violet-600 ring-4 ring-violet-200',
    activeBg: 'bg-violet-50/90',
    iconBg: 'bg-violet-600 text-white',
    Icon: Smile,
  },
  {
    id: 'slow_clear',
    title: 'Đọc chậm rõ chữ',
    desc: 'Giảm nhịp đọc chậm rãi (85%), giúp các bé nghe rõ từng âm vần và dấu thanh.',
    activeBorder: 'border-emerald-600 ring-4 ring-emerald-200',
    activeBg: 'bg-emerald-50/90',
    iconBg: 'bg-emerald-600 text-white',
    Icon: Gauge,
  },
];

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  open,
  settings,
  onChangeSettings,
  onResetSettings,
  onClose,
}) => {
  const [previewing, setPreviewing] = useState(false);
  const [browserVoice, setBrowserVoice] = useState<{ name: string; isFemalePreferred: boolean } | null>(
    null
  );

  useEffect(() => {
    if (open) {
      setBrowserVoice(audioManager.getBrowserVoiceStatus());
    } else {
      setPreviewing(false);
    }
  }, [open]);

  if (!open) return null;

  const handlePreviewVoice = () => {
    audioManager.unlock();
    if (previewing) {
      audioManager.stopSpeaking();
      setPreviewing(false);
      return;
    }
    if (settings.muted) {
      onChangeSettings({ muted: false });
    }
    setPreviewing(true);
    audioManager.previewVoice(() => {
      setPreviewing(false);
    });
  };

  const handleClose = () => {
    if (previewing) {
      audioManager.stopSpeaking();
      setPreviewing(false);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-4 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[32px] border-4 border-blue-500 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-sky-50 via-blue-50 to-pink-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-blue-300 bg-blue-600 text-white shadow-xs">
              <Sliders className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-extrabold text-blue-950">
                Cài Đặt Giọng Nói & Âm Thanh Chung
              </h2>
              <p className="text-xs font-semibold text-slate-600">
                Giọng Nữ AI Thuần Việt (Hoài My) dễ thương, phát âm chuẩn chữ cái mầm non
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Đóng cài đặt giọng nói"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-rose-50 hover:text-rose-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {/* 1. Voice Style Presets */}
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="font-heading text-lg font-extrabold text-slate-800">
                1. Chọn phong cách giọng đọc Nữ Tiếng Việt
              </span>
              <button
                type="button"
                onClick={() => onChangeSettings({ muted: !settings.muted })}
                className={`flex cursor-pointer items-center gap-1.5 rounded-xl border-2 px-3.5 py-1.5 text-sm font-extrabold transition ${
                  settings.muted
                    ? 'border-rose-300 bg-rose-50 text-rose-700'
                    : 'border-emerald-300 bg-emerald-50 text-emerald-800'
                }`}
              >
                {settings.muted ? (
                  <VolumeX className="h-4 w-4 text-rose-600" />
                ) : (
                  <Volume2 className="h-4 w-4 text-emerald-600" />
                )}
                {settings.muted ? 'Đang tắt tiếng' : 'Âm thanh đang bật'}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PRESET_OPTIONS.map((opt) => {
                const selected = settings.preset === opt.id;
                const IconComp = opt.Icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      audioManager.playClick();
                      onChangeSettings({ preset: opt.id });
                    }}
                    className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border-3 p-4 text-left transition ${
                      selected
                        ? `${opt.activeBorder} ${opt.activeBg}`
                        : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-xs ${opt.iconBg}`}
                    >
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-heading text-lg font-extrabold text-slate-900">
                          {opt.title}
                        </span>
                        {opt.badge && (
                          <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-[11px] font-extrabold text-slate-950">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs font-semibold leading-relaxed text-slate-600">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Speed & Volume Sliders */}
          <div className="grid grid-cols-1 gap-4 rounded-2xl border-2 border-slate-200 bg-slate-50/80 p-4 md:grid-cols-3">
            {/* Speed */}
            <div className="flex flex-col justify-between rounded-xl bg-white p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-extrabold text-slate-800">
                  <Gauge className="h-4 w-4 text-blue-600" />
                  Tốc độ đọc
                </span>
                <span className="rounded-lg bg-blue-100 px-2 py-0.5 font-heading text-sm font-extrabold text-blue-800">
                  {settings.rate.toFixed(2)}×
                </span>
              </div>
              <input
                type="range"
                min={0.75}
                max={1.25}
                step={0.05}
                value={settings.rate}
                onChange={(e) => onChangeSettings({ rate: parseFloat(e.target.value) })}
                aria-label="Tốc độ giọng đọc"
                className="my-3 h-2.5 w-full cursor-pointer accent-blue-600"
              />
              <div className="flex items-center justify-between gap-1">
                {[
                  { label: 'Chậm', val: 0.85 },
                  { label: 'Chuẩn', val: 1.0 },
                  { label: 'Nhanh', val: 1.15 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onChangeSettings({ rate: item.val })}
                    className={`flex-1 cursor-pointer rounded-lg py-1 text-xs font-bold transition ${
                      Math.abs(settings.rate - item.val) < 0.02
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Volume */}
            <div className="flex flex-col justify-between rounded-xl bg-white p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-extrabold text-slate-800">
                  <Volume2 className="h-4 w-4 text-pink-600" />
                  Âm lượng giọng đọc
                </span>
                <span className="rounded-lg bg-pink-100 px-2 py-0.5 font-heading text-sm font-extrabold text-pink-800">
                  {Math.round(settings.voiceVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.voiceVolume}
                onChange={(e) => onChangeSettings({ voiceVolume: parseFloat(e.target.value) })}
                aria-label="Âm lượng giọng đọc"
                className="my-3 h-2.5 w-full cursor-pointer accent-pink-600"
              />
              <span className="text-[11px] font-semibold text-slate-500">
                Điều chỉnh độ to rõ của lời chào & câu hỏi
              </span>
            </div>

            {/* SFX Volume */}
            <div className="flex flex-col justify-between rounded-xl bg-white p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-extrabold text-slate-800">
                  <Music className="h-4 w-4 text-amber-600" />
                  Âm lượng hiệu ứng
                </span>
                <span className="rounded-lg bg-amber-100 px-2 py-0.5 font-heading text-sm font-extrabold text-amber-900">
                  {Math.round(settings.sfxVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.sfxVolume}
                onChange={(e) => onChangeSettings({ sfxVolume: parseFloat(e.target.value) })}
                aria-label="Âm lượng hiệu ứng"
                className="my-3 h-2.5 w-full cursor-pointer accent-amber-500"
              />
              <button
                type="button"
                onClick={() => {
                  audioManager.unlock();
                  audioManager.playCorrect();
                }}
                className="cursor-pointer rounded-lg bg-amber-100 py-1 text-xs font-bold text-amber-900 hover:bg-amber-200"
              >
                Thử chuông hiệu ứng
              </button>
            </div>
          </div>

          {/* 3. Live Voice Test & Engine Status */}
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border-2 border-sky-200 bg-gradient-to-r from-sky-50 to-indigo-50 p-4 sm:flex-row">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-sm font-extrabold text-blue-950">
                  Giọng Nữ Thuần Việt (Hoài My Neural): Sẵn sàng Offline 100%
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600">
                Tự động đọc chuẩn âm mầm non (<em>bờ, giờ, đờ, á, ớ, lớp năm xê năm</em>), không đọc lẫn tiếng Anh.
                {browserVoice
                  ? ` Giọng dự phòng câu tự soạn: ${browserVoice.name}.`
                  : ''}
              </p>
            </div>

            <button
              type="button"
              onClick={handlePreviewVoice}
              className={`flex min-h-[48px] shrink-0 cursor-pointer items-center gap-2 rounded-2xl border-3 px-6 py-2.5 font-heading text-lg font-extrabold text-white shadow-[0_5px_0_rgba(0,0,0,0.18)] transition active:translate-y-0.5 ${
                previewing
                  ? 'border-rose-700 bg-rose-500 hover:bg-rose-400'
                  : 'border-blue-800 bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {previewing ? <Square className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
              {previewing ? 'Dừng nghe thử' : 'Nghe thử giọng nói'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <button
            type="button"
            onClick={() => {
              audioManager.playClick();
              onResetSettings();
            }}
            className="flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            <RotateCcw className="h-4 w-4" />
            Khôi phục mặc định
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-7 py-2.5 font-heading text-lg font-extrabold text-white shadow hover:bg-emerald-500"
          >
            <Check className="h-5 w-5" />
            Áp dụng & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
