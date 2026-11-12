import React, { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Laptop,
  MoreVertical,
  PlusSquare,
  Share,
  Smartphone,
  Sparkles,
  Tablet,
  X,
} from 'lucide-react';
import { LessonConfig } from '../types/lesson';
import { copyShareableLessonUrl } from '../data/lessons';
import { audioManager } from '../utils/audio';
import { DevicePlatform, PwaInstallState, pwaManager } from '../utils/pwa';

interface InstallAppModalProps {
  open: boolean;
  pwaState: PwaInstallState;
  lesson: LessonConfig;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  open,
  pwaState,
  lesson,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<DevicePlatform>(pwaState.platform);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (open) {
      setActiveTab(pwaState.platform);
      setCopiedUrl(false);
    }
  }, [open, pwaState.platform]);

  if (!open) return null;

  const handleNativeInstallClick = async () => {
    audioManager.playClick();
    setInstalling(true);
    const res = await pwaManager.triggerNativeInstall();
    setInstalling(false);
    if (res === 'accepted') {
      onClose();
    }
  };

  const handleCopyWebLink = async () => {
    audioManager.playClick();
    await copyShareableLessonUrl(lesson);
    setCopiedUrl(true);
    window.setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-3 sm:p-5 backdrop-blur-xs">
      <div className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] sm:rounded-[32px] border-4 border-sky-500 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-sky-50 via-blue-50 to-emerald-50 px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <img
              src="./icons/icon-192.png"
              alt="Biểu tượng ứng dụng"
              className="h-11 w-11 sm:h-13 sm:w-13 rounded-2xl border-2 border-white shadow-md"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-blue-950">
                Cài Đặt Tạo App Ra Màn Hình
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-600">
                Mở toàn màn hình mượt mà trên Điện thoại, iPad và Máy tính
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {/* Status: Already running as installed app */}
          {pwaState.isStandalone && (
            <div className="flex items-center gap-3 rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-4 text-emerald-900">
              <Check className="h-7 w-7 shrink-0 text-emerald-600" />
              <div>
                <p className="font-heading text-lg font-extrabold">
                  Thiết bị này đã cài đặt và đang mở dưới dạng App!
                </p>
                <p className="text-xs sm:text-sm font-semibold text-emerald-800/90">
                  Bạn vẫn có thể xem hướng dẫn bên dưới hoặc chép link để cài thêm cho Điện thoại, iPad khác.
                </p>
              </div>
            </div>
          )}

          {/* Direct 1-Tap Native Install Banner when browser supports beforeinstallprompt */}
          {pwaState.canNativePrompt && !pwaState.isStandalone && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border-4 border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 sm:p-5 shadow-sm">
              <div className="text-center sm:text-left">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-extrabold text-white">
                  <Sparkles className="h-3.5 w-3.5" /> Cài nhanh 1 chạm
                </span>
                <h3 className="font-heading mt-1 text-xl font-extrabold text-emerald-950">
                  Trình duyệt hỗ trợ tạo App trực tiếp!
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-emerald-800">
                  Bấm nút bên cạnh để thêm biểu tượng <strong>Sân Chơi Chữ</strong> ra màn hình ngay.
                </p>
              </div>
              <button
                type="button"
                disabled={installing}
                onClick={handleNativeInstallClick}
                className="flex w-full sm:w-auto shrink-0 cursor-pointer items-center justify-center gap-2 rounded-2xl border-4 border-emerald-700 bg-emerald-500 px-6 py-3.5 font-heading text-lg font-extrabold text-white shadow-[0_5px_0_#047857] transition hover:bg-emerald-400 active:translate-y-0.5"
              >
                <Download className="h-5 w-5" />
                {installing ? 'Đang mở...' : 'CÀI ĐẶT APP NGAY'}
              </button>
            </div>
          )}

          {/* Notice if currently opened via file:// local HTML */}
          {pwaState.isFileProtocol && (
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-3.5 text-xs sm:text-sm font-semibold text-amber-950">
              Bạn đang mở từ file <code>.html</code> lưu trong máy. Để tạo biểu tượng App trên Điện thoại / iPad / Máy tính, hãy bấm <strong>Chép link bài học</strong> bên dưới rồi mở bằng trình duyệt Safari hoặc Chrome nhé!
            </div>
          )}

          {/* Device Tabs */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('ios')}
              className={`flex cursor-pointer flex-col sm:flex-row items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 font-heading text-xs sm:text-base font-extrabold transition ${
                activeTab === 'ios'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-700 hover:bg-white/80'
              }`}
            >
              <Tablet className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>iPhone / iPad</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('android')}
              className={`flex cursor-pointer flex-col sm:flex-row items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 font-heading text-xs sm:text-base font-extrabold transition ${
                activeTab === 'android'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-700 hover:bg-white/80'
              }`}
            >
              <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Android</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('desktop')}
              className={`flex cursor-pointer flex-col sm:flex-row items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 font-heading text-xs sm:text-base font-extrabold transition ${
                activeTab === 'desktop'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-700 hover:bg-white/80'
              }`}
            >
              <Laptop className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Máy tính</span>
            </button>
          </div>

          {/* Step-by-step Guide per Platform */}
          {activeTab === 'ios' && (
            <div className="space-y-2.5 rounded-2xl border-2 border-blue-200 bg-blue-50/60 p-4">
              <p className="font-heading text-base sm:text-lg font-extrabold text-blue-950">
                Cách tạo App trên iPhone &amp; iPad (trình duyệt Safari / Chrome):
              </p>
              <div className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-2xs">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 font-heading text-sm font-extrabold text-white">
                  1
                </span>
                <p className="text-sm font-semibold text-slate-700">
                  Mở đường link trò chơi trong trình duyệt <strong>Safari</strong>, sau đó chạm vào nút{' '}
                  <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 font-bold text-blue-700">
                    <Share className="h-3.5 w-3.5" /> Chia sẻ
                  </span>{' '}
                  (biểu tượng ô vuông có mũi tên hướng lên ở thanh dưới iPhone hoặc góc trên phải iPad).
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-2xs">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 font-heading text-sm font-extrabold text-white">
                  2
                </span>
                <p className="text-sm font-semibold text-slate-700">
                  Cuộn danh sách xuống và chọn mục{' '}
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-bold text-slate-800">
                    <PlusSquare className="h-3.5 w-3.5" /> Thêm vào MH chính
                  </span>{' '}
                  <em>(Add to Home Screen)</em>.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-2xs">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 font-heading text-sm font-extrabold text-white">
                  3
                </span>
                <p className="text-sm font-semibold text-slate-700">
                  Bấm nút <strong>Thêm (Add)</strong> ở góc trên bên phải. Biểu tượng quả táo chữ cái <strong>Sân Chơi Chữ</strong> sẽ xuất hiện ngay trên màn hình iPhone/iPad như một ứng dụng độc lập!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-2.5 rounded-2xl border-2 border-blue-200 bg-blue-50/60 p-4">
              <p className="font-heading text-base sm:text-lg font-extrabold text-blue-950">
                Cách tạo App trên Điện thoại / Máy tính bảng Android:
              </p>
              <div className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-2xs">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 font-heading text-sm font-extrabold text-white">
                  1
                </span>
                <p className="text-sm font-semibold text-slate-700">
                  Mở trang bằng trình duyệt <strong>Google Chrome</strong> (hoặc Samsung Internet / Edge). Nếu có nút màu xanh <strong>“CÀI ĐẶT APP NGAY”</strong> phía trên, bạn chỉ cần chạm vào đó là xong!
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-2xs">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 font-heading text-sm font-extrabold text-white">
                  2
                </span>
                <p className="text-sm font-semibold text-slate-700">
                  Hoặc chạm nút menu{' '}
                  <span className="inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-bold text-slate-800">
                    <MoreVertical className="h-3.5 w-3.5" /> 3 chấm
                  </span>{' '}
                  ở góc trên bên phải trình duyệt, chọn <strong>“Cài đặt ứng dụng”</strong> (hoặc <strong>“Thêm vào Màn hình chính”</strong>) → xác nhận <strong>Cài đặt</strong>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'desktop' && (
            <div className="space-y-2.5 rounded-2xl border-2 border-blue-200 bg-blue-50/60 p-4">
              <p className="font-heading text-base sm:text-lg font-extrabold text-blue-950">
                Cách tạo App trên Máy tính Windows / MacBook (Chrome, Edge):
              </p>
              <div className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-2xs">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 font-heading text-sm font-extrabold text-white">
                  1
                </span>
                <p className="text-sm font-semibold text-slate-700">
                  Bấm nút màu xanh <strong>“CÀI ĐẶT APP NGAY”</strong> phía trên (nếu trình duyệt hiển thị sẵn).
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-2xs">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 font-heading text-sm font-extrabold text-white">
                  2
                </span>
                <p className="text-sm font-semibold text-slate-700">
                  Hoặc nhìn lên góc bên phải thanh địa chỉ của <strong>Chrome / Microsoft Edge</strong>, bấm vào biểu tượng{' '}
                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-bold text-slate-800">
                    <Download className="h-3.5 w-3.5" /> Cài đặt Sân Chơi Chữ Cái
                  </span>{' '}
                  rồi chọn <strong>Install / Cài đặt</strong> để tạo biểu tượng ngay ngoài màn hình Desktop!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={handleCopyWebLink}
            className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 font-heading text-sm sm:text-base font-bold text-white transition ${
              copiedUrl ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-sky-600 hover:bg-sky-500'
            }`}
          >
            {copiedUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiedUrl ? 'Đã chép link cài đặt!' : 'Chép link gửi qua Điện thoại / iPad'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border-2 border-slate-300 bg-white px-5 py-2 font-heading text-sm sm:text-base font-bold text-slate-700 hover:bg-slate-100"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
