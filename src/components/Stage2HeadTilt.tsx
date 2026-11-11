import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CameraOff,
  Download,
  Edit3,
  HelpCircle,
  RotateCcw,
  SkipForward,
  Star,
  Trophy,
  Volume2,
} from 'lucide-react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { LessonConfig } from '../types/lesson';
import { audioManager } from '../utils/audio';
import { ConfettiOverlay } from './ConfettiOverlay';

interface Stage2HeadTiltProps {
  lesson: LessonConfig;
  onBackHub: () => void;
  onNextStage: () => void;
  onOpenEditor: () => void;
  onExportHtml: () => void;
}

type TiltFSM = 'READY' | 'DWELLING' | 'LOCKED' | 'WAIT_NEUTRAL';

const TILT_THRESHOLD_DEG = 15;
const TILT_CANCEL_DEG = 11;
const NEUTRAL_DEG = 8;
const DWELL_MS = 600;

export const Stage2HeadTilt: React.FC<Stage2HeadTiltProps> = ({
  lesson,
  onBackHub,
  onNextStage,
  onOpenEditor,
  onExportHtml,
}) => {
  const questions = lesson.questions;
  const [qIndex, setQIndex] = useState(0);
  const [stars, setStars] = useState(0);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [cameraStatus, setCameraStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [statusLabel, setStatusLabel] = useState('Hãy đưa mặt vào giữa camera');
  const [dwellSide, setDwellSide] = useState<'left' | 'right' | null>(null);
  const [dwellPct, setDwellPct] = useState(0);
  const [feedback, setFeedback] = useState<{ side: 'left' | 'right'; correct: boolean } | null>(null);
  const [celebrateBurst, setCelebrateBurst] = useState(false);
  const [completedAll, setCompletedAll] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);

  // Mutable refs for 60fps loop access without re-creating camera pipeline
  const qIndexRef = useRef(0);
  qIndexRef.current = qIndex;
  const completedRef = useRef(false);
  completedRef.current = completedAll;

  const fsmRef = useRef<{
    state: TiltFSM;
    smoothedAngle: number;
    dwellSide: 'left' | 'right' | null;
    dwellStartMs: number;
    neutralSinceMs: number;
    minUnlockTimeMs: number;
  }>({
    state: 'READY',
    smoothedAngle: 0,
    dwellSide: null,
    dwellStartMs: 0,
    neutralSinceMs: 0,
    minUnlockTimeMs: 0,
  });

  const currentQuestion = questions[qIndex] ?? questions[0];

  const speakCurrentQuestion = useCallback(
    (idx: number) => {
      const q = questions[idx];
      if (!q) return;
      audioManager.speakVi(q.prompt, q.customAudioUrl);
    },
    [questions]
  );

  // Speak question whenever qIndex changes
  useEffect(() => {
    if (completedAll || !currentQuestion) return;
    const t = window.setTimeout(() => {
      speakCurrentQuestion(qIndex);
    }, 280);
    return () => {
      window.clearTimeout(t);
    };
  }, [qIndex, completedAll, currentQuestion, speakCurrentQuestion]);

  const evaluateChoice = useCallback(
    (chosenSide: 'left' | 'right') => {
      const idx = qIndexRef.current;
      const q = questions[idx];
      if (!q || completedRef.current) return;

      const fsm = fsmRef.current;
      fsm.state = 'LOCKED';
      setDwellSide(null);
      setDwellPct(0);

      const isCorrect = chosenSide === q.correctSide;
      setFeedback({ side: chosenSide, correct: isCorrect });

      if (isCorrect) {
        audioManager.playCorrect();
        audioManager.speakVi('Chính xác!');
        setStars((s) => Math.min(questions.length, s + 1));
        setCelebrateBurst(true);
        window.setTimeout(() => setCelebrateBurst(false), 1200);

        window.setTimeout(() => {
          setFeedback(null);
          if (idx + 1 < questions.length) {
            setQIndex(idx + 1);
            fsm.state = 'WAIT_NEUTRAL';
            fsm.neutralSinceMs = 0;
            fsm.minUnlockTimeMs = performance.now() + 900;
            setStatusLabel('Giữ thẳng đầu để trả lời câu tiếp nhé!');
          } else {
            setCompletedAll(true);
            audioManager.playCelebration();
            setStatusLabel('Hoàn thành! Bấm Chơi lại hoặc sang Chặng 3');
          }
        }, 1150);
      } else {
        audioManager.playRetry();
        audioManager.speakVi('Chưa đúng, chọn lại nhé!');
        window.setTimeout(() => {
          setFeedback(null);
          fsm.state = 'WAIT_NEUTRAL';
          fsm.neutralSinceMs = 0;
          fsm.minUnlockTimeMs = performance.now() + 500;
          setStatusLabel('Giữ thẳng hoặc nghiêng đầu chọn lại nhé');
        }, 950);
      }
    },
    [questions]
  );

  // Keyboard fallback (ArrowLeft / ArrowRight)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (completedRef.current || showGuide) return;
      if (fsmRef.current.state === 'LOCKED') return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        evaluateChoice('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        evaluateChoice('right');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [evaluateChoice, showGuide]);

  // Webcam + MediaPipe FaceLandmarker Lifecycle
  useEffect(() => {
    let cancelled = false;
    let rafId = 0;

    const cleanupMedia = () => {
      window.cancelAnimationFrame(rafId);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch {
          // ignore close errors
        }
        landmarkerRef.current = null;
      }
    };

    if (!cameraEnabled) {
      cleanupMedia();
      setCameraStatus('fallback');
      setStatusLabel('Camera đang tắt • Dùng phím ⬅ / ➡ hoặc chạm thẻ');
      return () => cleanupMedia();
    }

    const setupCameraAndModel = async () => {
      setCameraStatus('loading');
      setStatusLabel('Đang khởi động camera thông minh...');

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        // Load MediaPipe: local ./mediapipe first on HTTP(S) -> CDN on file:// or fallback
        let landmarker: FaceLandmarker | null = null;
        if (window.location.protocol !== 'file:') {
          try {
            const localVision = await FilesetResolver.forVisionTasks('./mediapipe/wasm');
            landmarker = await FaceLandmarker.createFromOptions(localVision, {
              baseOptions: { modelAssetPath: './mediapipe/face_landmarker.task' },
              runningMode: 'VIDEO',
              numFaces: 4,
            });
          } catch {
            landmarker = null;
          }
        }
        if (!landmarker) {
          const cdnVision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm'
          );
          landmarker = await FaceLandmarker.createFromOptions(cdnVision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            },
            runningMode: 'VIDEO',
            numFaces: 4,
          });
        }

        if (cancelled) {
          landmarker.close();
          cleanupMedia();
          return;
        }

        landmarkerRef.current = landmarker;
        setCameraStatus('ready');
        setStatusLabel('Giữ thẳng hoặc nghiêng đầu');

        let lastVideoTime = -1;
        const detectLoop = () => {
          if (cancelled) return;
          const video = videoRef.current;
          const lm = landmarkerRef.current;

          if (video && lm && video.readyState >= 2 && video.currentTime !== lastVideoTime) {
            lastVideoTime = video.currentTime;
            const nowMs = performance.now();
            const res = lm.detectForVideo(video, nowMs);

            if (res.faceLandmarks && res.faceLandmarks.length > 0) {
              // Anti-crowd filter: choose largest face weighted by proximity to center
              let bestLandmarks = res.faceLandmarks[0];
              let bestScore = -1;

              for (const face of res.faceLandmarks) {
                let minX = 1,
                  maxX = 0,
                  minY = 1,
                  maxY = 0;
                for (let i = 0; i < face.length; i += 8) {
                  const pt = face[i];
                  if (pt.x < minX) minX = pt.x;
                  if (pt.x > maxX) maxX = pt.x;
                  if (pt.y < minY) minY = pt.y;
                  if (pt.y > maxY) maxY = pt.y;
                }
                const w = maxX - minX;
                const h = maxY - minY;
                if (w < 0.08) continue;
                const cx = (minX + maxX) * 0.5;
                const cy = (minY + maxY) * 0.5;
                const centerDist = Math.hypot(cx - 0.5, cy - 0.5);
                const score = w * h * (1 - 0.5 * centerDist);
                if (score > bestScore) {
                  bestScore = score;
                  bestLandmarks = face;
                }
              }

              // Landmarks #33 and #263 are outer eye corners. Convert to mirrored screen space (1 - x)
              const pA = { x: 1 - bestLandmarks[33].x, y: bestLandmarks[33].y };
              const pB = { x: 1 - bestLandmarks[263].x, y: bestLandmarks[263].y };
              const leftEye = pA.x < pB.x ? pA : pB;
              const rightEye = pA.x < pB.x ? pB : pA;

              const rawAngle =
                (Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * 180) / Math.PI;
              const fsm = fsmRef.current;
              fsm.smoothedAngle = fsm.smoothedAngle * 0.62 + rawAngle * 0.38;
              const angle = fsm.smoothedAngle;
              const absAngle = Math.abs(angle);

              if (!completedRef.current) {
                if (fsm.state === 'WAIT_NEUTRAL') {
                  if (nowMs >= fsm.minUnlockTimeMs && absAngle <= NEUTRAL_DEG) {
                    if (fsm.neutralSinceMs === 0) {
                      fsm.neutralSinceMs = nowMs;
                    } else if (nowMs - fsm.neutralSinceMs >= 240) {
                      fsm.state = 'READY';
                      fsm.neutralSinceMs = 0;
                      setStatusLabel('Giữ thẳng hoặc nghiêng đầu');
                    }
                  } else {
                    fsm.neutralSinceMs = 0;
                  }
                } else if (fsm.state === 'READY') {
                  if (angle <= -TILT_THRESHOLD_DEG) {
                    fsm.state = 'DWELLING';
                    fsm.dwellSide = 'left';
                    fsm.dwellStartMs = nowMs;
                    setDwellSide('left');
                  } else if (angle >= TILT_THRESHOLD_DEG) {
                    fsm.state = 'DWELLING';
                    fsm.dwellSide = 'right';
                    fsm.dwellStartMs = nowMs;
                    setDwellSide('right');
                  } else {
                    setStatusLabel('Giữ thẳng hoặc nghiêng đầu');
                  }
                } else if (fsm.state === 'DWELLING') {
                  const stillLeft = fsm.dwellSide === 'left' && angle <= -TILT_CANCEL_DEG;
                  const stillRight = fsm.dwellSide === 'right' && angle >= TILT_CANCEL_DEG;

                  if (!stillLeft && !stillRight) {
                    fsm.state = 'READY';
                    fsm.dwellSide = null;
                    setDwellSide(null);
                    setDwellPct(0);
                    setStatusLabel('Giữ thẳng hoặc nghiêng đầu');
                  } else {
                    const degText = Math.round(absAngle);
                    setStatusLabel(
                      fsm.dwellSide === 'left'
                        ? `Nghiêng TRÁI: ${degText}°`
                        : `Nghiêng PHẢI: ${degText}°`
                    );
                    const elapsed = nowMs - fsm.dwellStartMs;
                    const pct = Math.min(100, Math.round((elapsed / DWELL_MS) * 100));
                    setDwellPct(pct);
                    if (elapsed >= DWELL_MS && fsm.dwellSide) {
                      evaluateChoice(fsm.dwellSide);
                    }
                  }
                }
              }
            } else if (fsmRef.current.state !== 'LOCKED' && !completedRef.current) {
              setDwellSide(null);
              setDwellPct(0);
              setStatusLabel('Hãy đưa mặt vào giữa camera');
            }
          }

          rafId = window.requestAnimationFrame(detectLoop);
        };

        rafId = window.requestAnimationFrame(detectLoop);
      } catch {
        if (!cancelled) {
          setCameraStatus('fallback');
          setStatusLabel('Không mở được camera • Dùng phím ⬅ / ➡ hoặc chạm thẻ');
        }
      }
    };

    setupCameraAndModel();

    return () => {
      cancelled = true;
      audioManager.stopSpeaking();
      cleanupMedia();
    };
  }, [cameraEnabled, evaluateChoice]);

  const handleRestartQuiz = () => {
    audioManager.playClick();
    setCompletedAll(false);
    setStars(0);
    setQIndex(0);
    setFeedback(null);
    setDwellSide(null);
    setDwellPct(0);
    fsmRef.current.state = 'READY';
    setStatusLabel('Bắt đầu lượt chơi mới! Giữ thẳng hoặc nghiêng đầu');
  };

  const handleSkipNext = () => {
    audioManager.playClick();
    setFeedback(null);
    setDwellSide(null);
    setDwellPct(0);
    if (qIndex + 1 < questions.length) {
      setQIndex((i) => i + 1);
      fsmRef.current.state = 'READY';
    } else {
      setCompletedAll(true);
      audioManager.playCelebration();
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-200 px-5 py-3">
      <ConfettiOverlay active={celebrateBurst || completedAll} />

      {/* Decorative Sun & Meadow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -bottom-24 left-1/2 h-44 w-[125%] -translate-x-1/2 rounded-[100%] bg-emerald-500/45" />
        <div className="animate-float-slow absolute right-8 top-10 flex h-24 w-24 items-center justify-center rounded-full border-4 border-amber-300 bg-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.75)]">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-950" />
            <span className="h-2 w-3 rounded-b-full bg-rose-600" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-950" />
          </div>
        </div>
      </div>

      {/* Top Row: Back + Guide | Wooden Question Sign | Star Counter */}
      <header className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              audioManager.stopSpeaking();
              onBackHub();
            }}
            className="flex cursor-pointer items-center gap-1.5 rounded-2xl border-2 border-white bg-slate-800/85 px-3.5 py-2 font-heading text-base font-bold text-white shadow hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Sảnh
          </button>
          <button
            type="button"
            onClick={() => setShowGuide((g) => !g)}
            className="flex cursor-pointer items-center gap-1.5 rounded-2xl border-2 border-white bg-white/90 px-4 py-2 font-heading text-base font-extrabold text-slate-800 shadow hover:bg-white"
          >
            <HelpCircle className="h-4 w-4 text-blue-600" />
            Hướng dẫn
          </button>
        </div>

        {/* Wooden Question Signboard */}
        <div className="flex max-w-3xl flex-1 flex-col items-center">
          <button
            type="button"
            onClick={() => speakCurrentQuestion(qIndex)}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-[28px] border-[6px] border-amber-700 bg-amber-50 px-8 py-3.5 text-center shadow-[0_8px_0_#92400E] transition hover:bg-white active:translate-y-0.5"
          >
            <span className="font-heading text-2xl font-extrabold text-amber-950 md:text-4xl">
              {currentQuestion.prompt}
            </span>
            <Volume2 className="h-7 w-7 shrink-0 text-amber-700" />
          </button>

          <div className="mt-1.5 rounded-full bg-white/85 px-5 py-0.5 text-sm font-extrabold text-blue-900 shadow-xs">
            {statusLabel}
          </div>
        </div>

        {/* Top-Right Star Score Pill */}
        <div className="flex items-center gap-2 rounded-full border-4 border-amber-300 bg-white px-5 py-2 shadow-md">
          <span className="font-heading text-xl font-extrabold text-slate-800">
            {stars}/{questions.length}
          </span>
          <Star className="h-6 w-6 fill-amber-400 text-amber-500" />
        </div>
      </header>

      {/* Center Stage: Left Card | Live Mirrored Webcam Frame | Right Card */}
      <main className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 grid-cols-12 items-center gap-5 py-2">
        {/* LEFT ANSWER CARD */}
        <div className="col-span-4 flex flex-col items-center">
          <button
            type="button"
            disabled={fsmRef.current.state === 'LOCKED' || completedAll}
            onClick={() => evaluateChoice('left')}
            className={`relative flex w-full cursor-pointer flex-col items-center justify-center rounded-[36px] border-[10px] bg-amber-50/95 px-4 py-7 shadow-[0_12px_0_rgba(30,64,175,0.28)] transition duration-150 ${
              feedback?.side === 'left'
                ? feedback.correct
                  ? 'scale-105 border-emerald-500 ring-8 ring-emerald-300'
                  : 'border-amber-500 opacity-85'
                : dwellSide === 'left'
                  ? 'scale-[1.03] border-blue-600 ring-4 ring-blue-300'
                  : 'border-blue-500 hover:scale-[1.02]'
            }`}
          >
            {/* Top Star Medallion */}
            <div className="absolute -top-7 flex h-14 w-14 items-center justify-center rounded-full border-4 border-amber-200 bg-amber-400 shadow">
              <Star className="h-8 w-8 fill-amber-100 text-amber-700" />
            </div>

            <span
              className={`font-letter my-3 font-extrabold leading-none text-blue-700 ${
                currentQuestion.leftOption.length <= 2 ? 'text-8xl md:text-9xl' : 'text-5xl md:text-6xl'
              }`}
            >
              {currentQuestion.leftOption}
            </span>

            <span className="font-heading mt-2 text-xl font-extrabold uppercase tracking-wider text-blue-800">
              NGHIÊNG TRÁI
            </span>

            {/* Dwell Progress Bar */}
            <div className="mt-3 h-3 w-3/4 overflow-hidden rounded-full bg-blue-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-75"
                style={{ width: dwellSide === 'left' ? `${dwellPct}%` : '0%' }}
              />
            </div>
          </button>
        </div>

        {/* CENTER WEBCAM FRAME */}
        <div className="col-span-4 flex flex-col items-center">
          <div className="relative w-full overflow-hidden rounded-[36px] border-[10px] border-amber-300 bg-slate-900 shadow-[0_12px_0_#D97706]">
            {/* Top Camera Lens Cap */}
            <div className="absolute left-1/2 top-2 z-20 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-slate-800 shadow">
              <div className="h-4 w-4 rounded-full bg-sky-400" />
            </div>

            <div className="aspect-[4/3] w-full bg-slate-800">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`h-full w-full object-cover -scale-x-100 ${
                  cameraStatus === 'ready' ? 'block' : 'hidden'
                }`}
              />

              {cameraStatus !== 'ready' && (
                <div className="flex h-full w-full flex-col items-center justify-center p-5 text-center text-white">
                  <Camera className="mb-2 h-12 w-12 text-amber-300" />
                  <p className="font-heading text-lg font-bold">
                    {cameraStatus === 'loading'
                      ? 'Đang bật Camera AI...'
                      : 'Chế độ không cần Camera'}
                  </p>
                  <p className="mt-1 text-xs text-slate-300">
                    Bấm phím mũi tên Trái ⬅ / Phải ➡ hoặc chạm trực tiếp vào 2 thẻ đáp án hai bên!
                  </p>
                </div>
              )}
            </div>

            {/* Instant Answer Feedback Banner inside Frame */}
            {feedback && (
              <div
                className={`absolute inset-x-0 bottom-0 z-20 py-2.5 text-center font-heading text-2xl font-extrabold text-white ${
                  feedback.correct ? 'bg-emerald-500/95' : 'bg-amber-500/95'
                }`}
              >
                {feedback.correct ? 'CHÍNH XÁC! GIỎI QUÁ!' : 'CHƯA ĐÚNG, THỬ LẠI NHÉ!'}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT ANSWER CARD */}
        <div className="col-span-4 flex flex-col items-center">
          <button
            type="button"
            disabled={fsmRef.current.state === 'LOCKED' || completedAll}
            onClick={() => evaluateChoice('right')}
            className={`relative flex w-full cursor-pointer flex-col items-center justify-center rounded-[36px] border-[10px] bg-amber-50/95 px-4 py-7 shadow-[0_12px_0_rgba(190,24,93,0.28)] transition duration-150 ${
              feedback?.side === 'right'
                ? feedback.correct
                  ? 'scale-105 border-emerald-500 ring-8 ring-emerald-300'
                  : 'border-amber-500 opacity-85'
                : dwellSide === 'right'
                  ? 'scale-[1.03] border-pink-600 ring-4 ring-pink-300'
                  : 'border-pink-500 hover:scale-[1.02]'
            }`}
          >
            <div className="absolute -top-7 flex h-14 w-14 items-center justify-center rounded-full border-4 border-amber-200 bg-amber-400 shadow">
              <Star className="h-8 w-8 fill-amber-100 text-amber-700" />
            </div>

            <span
              className={`font-letter my-3 font-extrabold leading-none text-pink-700 ${
                currentQuestion.rightOption.length <= 2 ? 'text-8xl md:text-9xl' : 'text-5xl md:text-6xl'
              }`}
            >
              {currentQuestion.rightOption}
            </span>

            <span className="font-heading mt-2 text-xl font-extrabold uppercase tracking-wider text-pink-800">
              NGHIÊNG PHẢI
            </span>

            <div className="mt-3 h-3 w-3/4 overflow-hidden rounded-full bg-pink-100">
              <div
                className="h-full rounded-full bg-pink-600 transition-all duration-75"
                style={{ width: dwellSide === 'right' ? `${dwellPct}%` : '0%' }}
              />
            </div>
          </button>
        </div>
      </main>

      {/* Quiz Complete Overlay Banner */}
      {completedAll && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/55 backdrop-blur-xs">
          <div className="flex max-w-xl flex-col items-center rounded-[36px] border-4 border-amber-400 bg-white p-8 text-center shadow-2xl">
            <Trophy className="h-20 w-20 text-amber-500" />
            <h2 className="font-heading mt-2 text-4xl font-extrabold text-blue-900">
              Hoàn thành {stars}/{questions.length} câu hỏi!
            </h2>
            <p className="mt-2 text-lg font-semibold text-slate-600">
              Cô có thể bấm <strong>Chơi lại</strong> cho lượt bạn tiếp theo lên thi tài, hoặc chuyển sang <strong>Chặng 3: Tập tô chữ cái</strong>!
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={handleRestartQuiz}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border-4 border-emerald-700 bg-emerald-500 px-7 py-3.5 font-heading text-2xl font-extrabold text-white shadow-[0_6px_0_#047857] hover:bg-emerald-400"
              >
                <RotateCcw className="h-6 w-6" />
                Chơi lại lượt mới
              </button>
              <button
                type="button"
                onClick={() => {
                  audioManager.stopSpeaking();
                  onNextStage();
                }}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border-4 border-pink-800 bg-pink-600 px-7 py-3.5 font-heading text-2xl font-extrabold text-white shadow-[0_6px_0_#9D174D] hover:bg-pink-500"
              >
                Sang Chặng 3
                <ArrowRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Guide Modal */}
      {showGuide && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="max-w-lg rounded-3xl border-4 border-blue-500 bg-white p-7 shadow-2xl">
            <h3 className="font-heading text-3xl font-extrabold text-blue-900">Hướng dẫn Chặng 2</h3>
            <ul className="mt-3 space-y-2 text-base font-semibold text-slate-700">
              <li>• Bé đứng chính diện trước camera laptop khoảng 0.8m – 1.5m (hệ thống tự nhận diện bạn đứng gần nhất, không bị nhiễu các bạn xếp hàng phía sau).</li>
              <li>• Nghiêng đầu sang <strong>TRÁI</strong> (thẻ xanh) hoặc sang <strong>PHẢI</strong> (thẻ hồng) và giữ nhẹ khoảng nửa giây để chốt đáp án.</li>
              <li>• <strong>Dự phòng:</strong> Cô giáo hoặc bé cũng có thể bấm phím mũi tên <code>⬅</code> / <code>➡</code> hoặc chạm trực tiếp lên thẻ đáp án.</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-6 w-full cursor-pointer rounded-2xl bg-blue-600 py-3 font-heading text-xl font-bold text-white hover:bg-blue-500"
            >
              Đã hiểu, quay lại chơi!
            </button>
          </div>
        </div>
      )}

      {/* Bottom Dock (Matches Video UI: Camera | Chơi lại | Câu tiếp | Chỉnh sửa | Tải game | Câu X/10) */}
      <footer className="relative z-20 mx-auto flex flex-wrap items-center justify-center gap-2.5 rounded-2xl border-2 border-white bg-white/95 px-5 py-2 shadow-lg">
        <button
          type="button"
          onClick={() => setCameraEnabled((c) => !c)}
          className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 font-heading text-base font-bold text-white transition ${
            cameraEnabled ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-600 hover:bg-slate-500'
          }`}
        >
          {cameraEnabled ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
          {cameraEnabled ? 'Camera đã bật' : 'Bật Camera'}
        </button>

        <button
          type="button"
          onClick={handleRestartQuiz}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 font-heading text-base font-bold text-white transition hover:bg-emerald-500"
        >
          <RotateCcw className="h-4 w-4" />
          Chơi lại
        </button>

        <button
          type="button"
          onClick={handleSkipNext}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 font-heading text-base font-bold text-white transition hover:bg-sky-500"
        >
          <SkipForward className="h-4 w-4" />
          Câu tiếp
        </button>

        <button
          type="button"
          onClick={onOpenEditor}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 font-heading text-base font-bold text-white transition hover:bg-purple-500"
        >
          <Edit3 className="h-4 w-4" />
          Chỉnh sửa
        </button>

        <button
          type="button"
          onClick={onExportHtml}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 font-heading text-base font-bold text-white transition hover:bg-orange-400"
        >
          <Download className="h-4 w-4" />
          Tải game
        </button>

        <span className="px-2 font-heading text-base font-extrabold text-slate-800">
          Câu {qIndex + 1}/{questions.length}
        </span>

        <button
          type="button"
          onClick={() => {
            audioManager.stopSpeaking();
            onNextStage();
          }}
          className="flex cursor-pointer items-center gap-1 rounded-xl bg-pink-600 px-3.5 py-2 font-heading text-base font-bold text-white transition hover:bg-pink-500"
        >
          Chặng 3
          <ArrowRight className="h-4 w-4" />
        </button>
      </footer>
    </div>
  );
};
