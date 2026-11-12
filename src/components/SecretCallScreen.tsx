import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  PhoneCall,
  PhoneForwarded,
  RotateCcw,
  Sliders,
  Smartphone,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { LessonConfig } from '../types/lesson';
import { syncGreetingWithClassInfo } from '../data/lessons';
import { audioManager } from '../utils/audio';
import { PwaInstallState } from '../utils/pwa';

interface SecretCallScreenProps {
  lesson: LessonConfig;
  pwaState: PwaInstallState;
  onFinishCall: () => void;
  onOpenVoiceSettings: () => void;
  onInstallApp: () => void;
}

export const SecretCallScreen: React.FC<SecretCallScreenProps> = ({
  lesson,
  pwaState,
  onFinishCall,
  onOpenVoiceSettings,
  onInstallApp,
}) => {
  const [callState, setCallState] = useState<'idle' | 'ringing' | 'connected'>('idle');
  const [speaking, setSpeaking] = useState(false);

  const effectiveGreeting = lesson.secretCallCustomAudioUrl
    ? lesson.secretCallGreeting
    : syncGreetingWithClassInfo(lesson.secretCallGreeting, lesson.teacherNames, lesson.className);

  useEffect(() => {
    return () => {
      audioManager.stopRingtone();
      audioManager.stopSpeaking();
    };
  }, []);

  const handleTriggerRing = () => {
    audioManager.unlock();
    setCallState('ringing');
    audioManager.startRingtone();
  };

  const handleAnswerCall = () => {
    audioManager.unlock();
    audioManager.stopRingtone();
    audioManager.playCorrect();
    setCallState('connected');
    setSpeaking(true);
    window.setTimeout(() => {
      audioManager.speakVi(
        effectiveGreeting,
        lesson.secretCallCustomAudioUrl,
        () => {
          setSpeaking(false);
        },
        'character'
      );
    }, 350);
  };

  const handleReplayVoice = () => {
    setSpeaking(true);
    audioManager.speakVi(
      effectiveGreeting,
      lesson.secretCallCustomAudioUrl,
      () => {
        setSpeaking(false);
      },
      'character'
    );
  };

  const handleEnterPlayground = () => {
    audioManager.stopRingtone();
    audioManager.stopSpeaking();
    audioManager.playCelebration();
    onFinishCall();
  };

  return (
    <div className="safe-pad relative flex h-full w-full flex-col items-center justify-between overflow-y-auto bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-100 p-3 sm:p-6">
      {/* Decorative clouds & stars */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-12 top-8 h-32 w-64 rounded-full bg-white/70 blur-sm" />
        <div className="absolute right-10 top-14 h-28 w-56 rounded-full bg-white/75 blur-sm" />
        <div className="absolute bottom-20 left-16 h-24 w-48 rounded-full bg-white/60 blur-sm" />
        <div className="animate-float-slow hidden sm:flex absolute right-8 top-6 md:right-14 md:top-8 h-16 w-16 md:h-24 md:w-24 items-center justify-center rounded-full bg-amber-300 border-4 border-amber-400 shadow-[0_6px_0_rgba(217,119,6,0.35)]">
          <Sparkles className="h-8 w-8 md:h-12 md:w-12 text-amber-700" />
        </div>
      </div>

      {/* Top School Banner */}
      <header className="relative z-10 flex flex-col items-center text-center">
        <div className="rounded-full border-3 sm:border-4 border-amber-400 bg-amber-100 px-4 py-1.5 sm:px-8 sm:py-2 shadow-[0_4px_0_rgba(217,119,6,0.3)]">
          <span className="font-heading text-sm sm:text-xl md:text-2xl font-extrabold tracking-wide text-blue-800">
            {lesson.schoolName} • {lesson.className}
          </span>
        </div>
      </header>

      {/* Main Call Stage */}
      <main className="relative z-10 flex w-full max-w-5xl flex-1 items-center justify-center py-3 sm:py-4">
        {callState === 'idle' && (
          <div className="flex w-full max-w-2xl flex-col items-center rounded-[28px] sm:rounded-[32px] border-4 border-white bg-white/90 px-4 py-5 sm:px-10 sm:py-9 text-center shadow-[0_12px_0_rgba(37,99,235,0.18)] backdrop-blur-md">
            <div className="mb-3 sm:mb-4 flex flex-wrap justify-center gap-3 sm:gap-4">
              {lesson.targetLetters.map((ch, idx) => (
                <div
                  key={ch}
                  className={`font-letter flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-2xl sm:rounded-3xl border-4 text-4xl sm:text-6xl font-extrabold text-white shadow-[0_6px_0_rgba(0,0,0,0.16)] ${
                    idx % 2 === 0 ? 'border-blue-700 bg-blue-600' : 'border-pink-700 bg-pink-500'
                  }`}
                >
                  {ch}
                </div>
              ))}
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl font-extrabold text-blue-900">
              Hộp Quà &amp; Cuộc Gọi Bí Mật
            </h1>
            <p className="mt-2 max-w-xl text-sm sm:text-lg font-semibold text-slate-600">
              Sau khi các bé khám phá hộp quà chữ cái, bấm nút dưới đây để nhận cuộc gọi video từ các bạn chữ cái nhé!
            </p>
            <div className="mt-5 sm:mt-7 flex w-full sm:w-auto flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleTriggerRing}
                className="flex w-full sm:w-auto cursor-pointer items-center justify-center gap-2.5 rounded-2xl border-4 border-emerald-700 bg-emerald-500 px-6 py-3.5 sm:px-8 sm:py-4 font-heading text-xl sm:text-2xl font-bold text-white shadow-[0_6px_0_#047857] transition hover:bg-emerald-400 active:translate-y-1"
              >
                <PhoneForwarded className="h-6 w-6 sm:h-7 sm:w-7" />
                Đổ Chuông Điện Thoại
              </button>
              <button
                type="button"
                onClick={onFinishCall}
                className="flex w-full sm:w-auto cursor-pointer items-center justify-center gap-2 rounded-2xl border-4 border-slate-300 bg-white px-5 py-3 sm:px-6 sm:py-4 font-heading text-lg sm:text-xl font-bold text-slate-700 shadow-[0_5px_0_#CBD5E1] transition hover:bg-slate-50 active:translate-y-1"
              >
                Vào thẳng Sảnh chính
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>
        )}

        {callState === 'ringing' && (
          <div className="flex w-full max-w-xl flex-col items-center rounded-[28px] sm:rounded-[36px] border-4 border-amber-400 bg-slate-900/95 px-5 py-7 sm:px-12 sm:py-10 text-center text-white shadow-[0_14px_0_rgba(15,23,42,0.35)]">
            <div className="animate-phone-ring mb-4 sm:mb-5 flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center rounded-full border-4 border-emerald-300 bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.8)]">
              <PhoneCall className="h-10 w-10 sm:h-14 sm:w-14 text-white" />
            </div>
            <span className="rounded-full bg-amber-400/20 px-4 py-1 text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-300">
              Cuộc gọi video đến...
            </span>
            <h2 className="font-heading mt-2 text-2xl sm:text-4xl md:text-5xl font-extrabold text-white">
              Các bạn chữ cái: {lesson.targetLetters.join(', ')}
            </h2>
            <p className="mt-1.5 text-sm sm:text-lg text-sky-200">
              Đang gọi cho {lesson.teacherNames} và {lesson.className}
            </p>

            <button
              type="button"
              onClick={handleAnswerCall}
              className="mt-6 sm:mt-8 flex cursor-pointer items-center gap-3 rounded-full border-4 border-emerald-200 bg-emerald-500 px-8 py-4 sm:px-12 sm:py-5 font-heading text-2xl sm:text-3xl font-extrabold text-white shadow-[0_8px_0_#047857] transition hover:scale-105 hover:bg-emerald-400 active:translate-y-1"
            >
              <PhoneCall className="h-7 w-7 sm:h-8 sm:w-8" />
              NGHE MÁY NGAY
            </button>
          </div>
        )}

        {callState === 'connected' && (
          <div className="flex w-full flex-col items-center rounded-[28px] sm:rounded-[36px] border-4 sm:border-8 border-amber-400 bg-gradient-to-b from-indigo-950 via-blue-900 to-sky-900 p-4 sm:p-7 text-white shadow-[0_14px_0_rgba(30,58,138,0.4)]">
            {/* Animated Letter Friends Stage */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-8 py-1 sm:py-2">
              {lesson.targetLetters.map((ch, idx) => (
                <div
                  key={ch}
                  className={`relative flex h-22 w-22 sm:h-32 sm:w-32 md:h-36 md:w-36 flex-col items-center justify-center rounded-3xl sm:rounded-[32px] border-4 shadow-[0_8px_0_rgba(0,0,0,0.3)] transition-transform ${
                    speaking ? 'animate-bounce' : 'animate-float-slow'
                  } ${
                    idx % 3 === 0
                      ? 'border-sky-200 bg-blue-500'
                      : idx % 3 === 1
                        ? 'border-pink-200 bg-pink-500'
                        : 'border-amber-200 bg-amber-500'
                  }`}
                  style={{ animationDelay: `${idx * 0.18}s` }}
                >
                  <span className="font-letter text-5xl sm:text-6xl md:text-7xl font-extrabold leading-none text-white drop-shadow">
                    {ch}
                  </span>
                  {/* Cute eyes */}
                  <div className="mt-1.5 sm:mt-2 flex items-center gap-2 sm:gap-3">
                    <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-slate-900 ring-2 ring-white" />
                    <span className="h-1.5 w-3 sm:h-2 sm:w-4 rounded-b-full bg-rose-300" />
                    <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-slate-900 ring-2 ring-white" />
                  </div>
                </div>
              ))}
            </div>

            {/* Speech Bubble */}
            <div className="mt-4 sm:mt-5 w-full max-w-3xl rounded-2xl sm:rounded-3xl border-4 border-sky-200 bg-white px-4 py-3.5 sm:px-7 sm:py-5 text-center text-slate-800 shadow-lg">
              <p className="text-base sm:text-xl md:text-2xl font-bold leading-relaxed">
                “{effectiveGreeting}”
              </p>
            </div>

            <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleReplayVoice}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border-4 border-sky-300 bg-sky-600 px-4 py-2.5 sm:px-6 sm:py-3.5 font-heading text-base sm:text-xl font-bold text-white shadow-[0_5px_0_#0369A1] transition hover:bg-sky-500 active:translate-y-1"
              >
                <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" />
                {speaking ? 'Đang trò chuyện...' : 'Nghe lại lời chào'}
              </button>

              <button
                type="button"
                onClick={handleEnterPlayground}
                className="flex cursor-pointer items-center gap-2 sm:gap-3 rounded-2xl border-4 border-amber-200 bg-amber-400 px-6 py-3 sm:px-10 sm:py-4 font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-950 shadow-[0_6px_0_#B45309] transition hover:bg-amber-300 active:translate-y-1"
              >
                SẴN SÀNG VÀO SÂN CHƠI!
                <ArrowRight className="h-6 w-6 sm:h-8 sm:w-8" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer quick skip, install app & voice settings */}
      <footer className="relative z-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {!pwaState.isStandalone && (
          <button
            type="button"
            onClick={onInstallApp}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-emerald-600 bg-emerald-500 px-3.5 py-2 text-xs sm:text-sm font-extrabold text-white shadow-xs hover:bg-emerald-400"
          >
            <Smartphone className="h-4 w-4" />
            Cài đặt App
          </button>
        )}
        <button
          type="button"
          onClick={onOpenVoiceSettings}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-white/85 px-3.5 py-2 text-xs sm:text-sm font-bold text-indigo-800 shadow-2xs hover:bg-white"
        >
          <Sliders className="h-4 w-4" />
          Cài đặt giọng nói
        </button>
        {callState !== 'idle' && (
          <button
            type="button"
            onClick={() => {
              audioManager.stopRingtone();
              audioManager.stopSpeaking();
              setCallState('idle');
            }}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-white/80 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-white"
          >
            <RotateCcw className="h-4 w-4" />
            Đặt lại cuộc gọi
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            audioManager.stopRingtone();
            audioManager.stopSpeaking();
            onFinishCall();
          }}
          className="cursor-pointer rounded-xl bg-white/80 px-3.5 py-2 text-xs sm:text-sm font-bold text-blue-800 hover:bg-white"
        >
          Bỏ qua vào Sảnh 4 Chặng →
        </button>
      </footer>
    </div>
  );
};
