import React, { useEffect, useState } from 'react';
import { PhoneCall, PhoneForwarded, Sparkles, Volume2, ArrowRight, RotateCcw } from 'lucide-react';
import { LessonConfig } from '../types/lesson';
import { audioManager } from '../utils/audio';

interface SecretCallScreenProps {
  lesson: LessonConfig;
  onFinishCall: () => void;
}

export const SecretCallScreen: React.FC<SecretCallScreenProps> = ({ lesson, onFinishCall }) => {
  const [callState, setCallState] = useState<'idle' | 'ringing' | 'connected'>('idle');
  const [speaking, setSpeaking] = useState(false);

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
      audioManager.speakVi(lesson.secretCallGreeting, lesson.secretCallCustomAudioUrl, () => {
        setSpeaking(false);
      });
    }, 350);
  };

  const handleReplayVoice = () => {
    setSpeaking(true);
    audioManager.speakVi(lesson.secretCallGreeting, lesson.secretCallCustomAudioUrl, () => {
      setSpeaking(false);
    });
  };

  const handleEnterPlayground = () => {
    audioManager.stopRingtone();
    audioManager.stopSpeaking();
    audioManager.playCelebration();
    onFinishCall();
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-100 p-6">
      {/* Decorative clouds & stars */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-12 top-8 h-32 w-64 rounded-full bg-white/70 blur-sm" />
        <div className="absolute right-10 top-14 h-28 w-56 rounded-full bg-white/75 blur-sm" />
        <div className="absolute bottom-20 left-16 h-24 w-48 rounded-full bg-white/60 blur-sm" />
        <div className="animate-float-slow absolute right-14 top-8 flex h-24 w-24 items-center justify-center rounded-full bg-amber-300 border-4 border-amber-400 shadow-[0_6px_0_rgba(217,119,6,0.35)]">
          <Sparkles className="h-12 w-12 text-amber-700" />
        </div>
      </div>

      {/* Top School Banner */}
      <header className="relative z-10 flex flex-col items-center text-center">
        <div className="rounded-full border-4 border-amber-400 bg-amber-100 px-8 py-2 shadow-[0_5px_0_rgba(217,119,6,0.3)]">
          <span className="font-heading text-xl font-extrabold tracking-wide text-blue-800 md:text-2xl">
            {lesson.schoolName} • {lesson.className}
          </span>
        </div>
      </header>

      {/* Main Call Stage */}
      <main className="relative z-10 flex w-full max-w-5xl flex-1 items-center justify-center py-4">
        {callState === 'idle' && (
          <div className="flex flex-col items-center rounded-[32px] border-4 border-white bg-white/90 px-10 py-9 text-center shadow-[0_12px_0_rgba(37,99,235,0.18)] backdrop-blur-md">
            <div className="mb-4 flex gap-4">
              {lesson.targetLetters.map((ch, idx) => (
                <div
                  key={ch}
                  className={`font-letter flex h-24 w-24 items-center justify-center rounded-3xl border-4 text-6xl font-extrabold text-white shadow-[0_8px_0_rgba(0,0,0,0.16)] ${
                    idx % 2 === 0 ? 'border-blue-700 bg-blue-600' : 'border-pink-700 bg-pink-500'
                  }`}
                >
                  {ch}
                </div>
              ))}
            </div>
            <h1 className="font-heading text-4xl font-extrabold text-blue-900 md:text-5xl">
              Hộp Quà & Cuộc Gọi Bí Mật
            </h1>
            <p className="mt-2 max-w-xl text-lg font-semibold text-slate-600">
              Sau khi các bé khám phá hộp quà chữ cái trên bàn, cô giáo bấm nút dưới đây để nhận cuộc gọi video từ các bạn chữ cái nhé!
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleTriggerRing}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border-4 border-emerald-700 bg-emerald-500 px-8 py-4 font-heading text-2xl font-bold text-white shadow-[0_7px_0_#047857] transition hover:bg-emerald-400 active:translate-y-1"
              >
                <PhoneForwarded className="h-7 w-7" />
                Đổ Chuông Điện Thoại
              </button>
              <button
                type="button"
                onClick={onFinishCall}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border-4 border-slate-300 bg-white px-6 py-4 font-heading text-xl font-bold text-slate-700 shadow-[0_6px_0_#CBD5E1] transition hover:bg-slate-50 active:translate-y-1"
              >
                Vào thẳng Sảnh chính
                <ArrowRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}

        {callState === 'ringing' && (
          <div className="flex flex-col items-center rounded-[36px] border-4 border-amber-400 bg-slate-900/95 px-12 py-10 text-center text-white shadow-[0_14px_0_rgba(15,23,42,0.35)]">
            <div className="animate-phone-ring mb-5 flex h-28 w-28 items-center justify-center rounded-full border-4 border-emerald-300 bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.8)]">
              <PhoneCall className="h-14 w-14 text-white" />
            </div>
            <span className="rounded-full bg-amber-400/20 px-4 py-1 text-sm font-bold uppercase tracking-widest text-amber-300">
              Cuộc gọi video đến...
            </span>
            <h2 className="font-heading mt-2 text-4xl font-extrabold text-white md:text-5xl">
              Các bạn chữ cái: {lesson.targetLetters.join(', ')}
            </h2>
            <p className="mt-2 text-lg text-sky-200">Đang gọi cho {lesson.teacherNames} và {lesson.className}</p>

            <button
              type="button"
              onClick={handleAnswerCall}
              className="mt-8 flex cursor-pointer items-center gap-3 rounded-full border-4 border-emerald-200 bg-emerald-500 px-12 py-5 font-heading text-3xl font-extrabold text-white shadow-[0_8px_0_#047857] transition hover:scale-105 hover:bg-emerald-400 active:translate-y-1"
            >
              <PhoneCall className="h-8 w-8" />
              NGHE MÁY NGAY
            </button>
          </div>
        )}

        {callState === 'connected' && (
          <div className="flex w-full flex-col items-center rounded-[36px] border-8 border-amber-400 bg-gradient-to-b from-indigo-950 via-blue-900 to-sky-900 p-7 text-white shadow-[0_14px_0_rgba(30,58,138,0.4)]">
            {/* Animated Letter Friends Stage */}
            <div className="flex items-center justify-center gap-8 py-2">
              {lesson.targetLetters.map((ch, idx) => (
                <div
                  key={ch}
                  className={`relative flex h-36 w-36 flex-col items-center justify-center rounded-[32px] border-4 shadow-[0_10px_0_rgba(0,0,0,0.3)] transition-transform ${
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
                  <span className="font-letter text-7xl font-extrabold leading-none text-white drop-shadow">
                    {ch}
                  </span>
                  {/* Cute eyes */}
                  <div className="mt-2 flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-slate-900 ring-2 ring-white" />
                    <span className="h-2 w-4 rounded-b-full bg-rose-300" />
                    <span className="h-3 w-3 rounded-full bg-slate-900 ring-2 ring-white" />
                  </div>
                </div>
              ))}
            </div>

            {/* Speech Bubble */}
            <div className="mt-5 w-full max-w-3xl rounded-3xl border-4 border-sky-200 bg-white px-7 py-5 text-center text-slate-800 shadow-lg">
              <p className="text-xl font-bold leading-relaxed md:text-2xl">“{lesson.secretCallGreeting}”</p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleReplayVoice}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border-4 border-sky-300 bg-sky-600 px-6 py-3.5 font-heading text-xl font-bold text-white shadow-[0_6px_0_#0369A1] transition hover:bg-sky-500 active:translate-y-1"
              >
                <Volume2 className="h-6 w-6" />
                {speaking ? 'Đang trò chuyện...' : 'Nghe lại lời chào'}
              </button>

              <button
                type="button"
                onClick={handleEnterPlayground}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border-4 border-amber-200 bg-amber-400 px-10 py-4 font-heading text-2xl font-extrabold text-slate-950 shadow-[0_7px_0_#B45309] transition hover:bg-amber-300 active:translate-y-1 md:text-3xl"
              >
                SẴN SÀNG VÀO SÂN CHƠI!
                <ArrowRight className="h-8 w-8" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer quick skip */}
      <footer className="relative z-10 flex items-center gap-4">
        {callState !== 'idle' && (
          <button
            type="button"
            onClick={() => {
              audioManager.stopRingtone();
              audioManager.stopSpeaking();
              setCallState('idle');
            }}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-white/80 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-white"
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
          className="cursor-pointer rounded-xl bg-white/80 px-4 py-2 text-sm font-bold text-blue-800 hover:bg-white"
        >
          Bỏ qua vào Sảnh 3 Chặng →
        </button>
      </footer>
    </div>
  );
};
