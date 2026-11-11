import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { LessonConfig } from '../types/lesson';
import { audioManager } from '../utils/audio';
import { ConfettiOverlay } from './ConfettiOverlay';

interface Stage1RunnerProps {
  lesson: LessonConfig;
  onBackHub: () => void;
  onNextStage: () => void;
}

type RunnerEventKind = 'jump' | 'duck' | 'left' | 'right' | 'dance' | 'letter';

interface TrackItem {
  id: number;
  z: number; // 1.0 (far horizon) -> 0.0 (player camera)
  kind: RunnerEventKind;
  letter?: string;
  triggered: boolean;
}

const ACTION_META: Record<Exclude<RunnerEventKind, 'letter'>, { label: string; color: string; voice: string }> = {
  jump: { label: 'BẬT NHẢY CAO!', color: '#EF4444', voice: 'Nhảy lên nào!' },
  duck: { label: 'CÚI THẤP NGƯỜI!', color: '#F59E0B', voice: 'Cúi xuống nào!' },
  left: { label: 'BƯỚC SANG TRÁI!', color: '#2563EB', voice: 'Sang trái!' },
  right: { label: 'BƯỚC SANG PHẢI!', color: '#EC4899', voice: 'Sang phải!' },
  dance: { label: 'LẮC HÔNG VỖ TAY!', color: '#8B5CF6', voice: 'Lắc hông vui nhộn!' },
};

function buildLevelTimeline(level: 1 | 2, letters: string[]): Omit<TrackItem, 'id' | 'z' | 'triggered'>[] {
  const safeLetters = letters.length > 0 ? letters : ['e', 'ê', 'E', 'Ê'];
  const actionsLv1: Exclude<RunnerEventKind, 'letter'>[] = ['jump', 'left', 'right', 'duck'];
  const actionsLv2: Exclude<RunnerEventKind, 'letter'>[] = ['dance', 'left', 'right', 'jump', 'dance', 'duck'];
  const pool = level === 1 ? actionsLv1 : actionsLv2;

  const seq: Omit<TrackItem, 'id' | 'z' | 'triggered'>[] = [];
  const totalPairs = level === 1 ? 5 : 6;
  for (let i = 0; i < totalPairs; i++) {
    seq.push({ kind: pool[i % pool.length] });
    seq.push({ kind: 'letter', letter: safeLetters[i % safeLetters.length] });
  }
  return seq;
}

export const Stage1Runner: React.FC<Stage1RunnerProps> = ({ lesson, onBackHub, onNextStage }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [level, setLevel] = useState<1 | 2>(1);
  const [phase, setPhase] = useState<'countdown' | 'running' | 'paused' | 'level_clear' | 'finished'>('countdown');
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [activePrompt, setActivePrompt] = useState<{ text: string; sub?: string; isLetter?: boolean } | null>(null);
  const [activeCoachKind, setActiveCoachKind] = useState<Exclude<RunnerEventKind, 'letter'>>('jump');
  const [progressPct, setProgressPct] = useState(0);

  const stateRef = useRef<{
    roadOffset: number;
    playerLaneX: number; // -1..1
    targetLaneX: number;
    jumpOffset: number;
    items: TrackItem[];
    queue: Omit<TrackItem, 'id' | 'z' | 'triggered'>[];
    spawnCooldown: number;
    nextId: number;
    totalCount: number;
    passedCount: number;
    letterFlashTimer: number;
  }>({
    roadOffset: 0,
    playerLaneX: 0,
    targetLaneX: 0,
    jumpOffset: 0,
    items: [],
    queue: [],
    spawnCooldown: 0.4,
    nextId: 1,
    totalCount: 10,
    passedCount: 0,
    letterFlashTimer: 0,
  });

  const initLevel = useCallback(
    (targetLv: 1 | 2) => {
      audioManager.stopSpeaking();
      const timeline = buildLevelTimeline(targetLv, lesson.runnerLetters);
      stateRef.current = {
        roadOffset: 0,
        playerLaneX: 0,
        targetLaneX: 0,
        jumpOffset: 0,
        items: [],
        queue: timeline,
        spawnCooldown: 0.35,
        nextId: 1,
        totalCount: timeline.length,
        passedCount: 0,
        letterFlashTimer: 0,
      };
      setLevel(targetLv);
      setProgressPct(0);
      setActivePrompt(null);
      setCountdownNum(3);
      setPhase('countdown');
    },
    [lesson.runnerLetters]
  );

  useEffect(() => {
    initLevel(1);
    return () => {
      audioManager.stopSpeaking();
    };
  }, [initLevel]);

  // Countdown effect: 3 -> 2 -> 1 -> Let's Begin!
  useEffect(() => {
    if (phase !== 'countdown') return;
    audioManager.playCountdownBeep(countdownNum === 0);

    const timer = window.setTimeout(() => {
      if (countdownNum > 1) {
        setCountdownNum((c) => c - 1);
      } else if (countdownNum === 1) {
        setCountdownNum(0);
      } else {
        setPhase('running');
      }
    }, 850);

    return () => window.clearTimeout(timer);
  }, [phase, countdownNum]);

  // Main 60fps Canvas 2.5D Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastTime = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(640, Math.floor(rect.width * dpr));
      canvas.height = Math.max(360, Math.floor(rect.height * dpr));
    };
    resize();
    window.addEventListener('resize', resize);

    const renderFrame = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const s = stateRef.current;
      const speed = level === 1 ? 0.34 : 0.44;

      if (phase === 'running') {
        const timeScale = s.letterFlashTimer > 0 ? 0.35 : 1;
        if (s.letterFlashTimer > 0) {
          s.letterFlashTimer = Math.max(0, s.letterFlashTimer - dt);
        }

        s.roadOffset = (s.roadOffset + dt * speed * 8 * timeScale) % 1;
        s.spawnCooldown -= dt * timeScale;

        if (s.spawnCooldown <= 0 && s.queue.length > 0) {
          const nextSpec = s.queue.shift()!;
          s.items.push({
            id: s.nextId++,
            z: 1.0,
            kind: nextSpec.kind,
            letter: nextSpec.letter,
            triggered: false,
          });
          s.spawnCooldown = level === 1 ? 2.35 : 1.95;
        }

        // Update items moving toward camera
        for (const item of s.items) {
          item.z -= dt * speed * timeScale;

          // Announce upcoming action slightly ahead
          if (!item.triggered && item.z <= 0.34) {
            item.triggered = true;
            s.passedCount += 1;
            setProgressPct(Math.min(100, Math.round((s.passedCount / s.totalCount) * 100)));

            if (item.kind === 'letter' && item.letter) {
              s.letterFlashTimer = 0.95;
              s.targetLaneX = 0;
              audioManager.playCorrect();
              audioManager.speakVi(`Chữ ${item.letter}`);
              setActivePrompt({
                text: item.letter,
                sub: 'Cả lớp đọc to chữ cái nào!',
                isLetter: true,
              });
            } else if (item.kind !== 'letter') {
              const meta = ACTION_META[item.kind];
              setActiveCoachKind(item.kind);
              audioManager.playClick();
              audioManager.speakVi(meta.voice);
              setActivePrompt({ text: meta.label, isLetter: false });
              if (item.kind === 'left') s.targetLaneX = -0.68;
              else if (item.kind === 'right') s.targetLaneX = 0.68;
              else s.targetLaneX = 0;
              if (item.kind === 'jump') s.jumpOffset = 1;
            }
          }
        }

        s.playerLaneX += (s.targetLaneX - s.playerLaneX) * Math.min(1, dt * 8);
        if (s.jumpOffset > 0) {
          s.jumpOffset = Math.max(0, s.jumpOffset - dt * 2.2);
        }

        s.items = s.items.filter((it) => it.z > -0.12);

        if (s.queue.length === 0 && s.items.length === 0 && s.letterFlashTimer <= 0) {
          audioManager.playCelebration();
          setActivePrompt(null);
          if (level === 1) {
            setPhase('level_clear');
          } else {
            setPhase('finished');
          }
        }
      }

      // Draw 2.5D Scene
      const W = canvas.width;
      const H = canvas.height;
      const horizonY = H * 0.42;

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, '#38BDF8');
      skyGrad.addColorStop(1, '#BAE6FD');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, horizonY);

      // Sun
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(W * 0.85, H * 0.14, H * 0.07, 0, Math.PI * 2);
      ctx.fill();

      // Green Meadow Ground
      const grassGrad = ctx.createLinearGradient(0, horizonY, 0, H);
      grassGrad.addColorStop(0, '#4ADE80');
      grassGrad.addColorStop(1, '#16A34A');
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, horizonY, W, H - horizonY);

      // Perspective 3-Lane Road
      const roadTopHalf = W * 0.055;
      const roadBotHalf = W * 0.42;
      const centerX = W * 0.5;

      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(centerX - roadTopHalf, horizonY);
      ctx.lineTo(centerX + roadTopHalf, horizonY);
      ctx.lineTo(centerX + roadBotHalf, H);
      ctx.lineTo(centerX - roadBotHalf, H);
      ctx.closePath();
      ctx.fill();

      // Road curbs (red-white alternating stripes)
      const numStripes = 12;
      for (let i = 0; i < numStripes; i++) {
        const z0 = ((i + s.roadOffset) % numStripes) / numStripes;
        const z1 = Math.min(1, z0 + 1 / numStripes);
        if (z1 <= z0) continue;
        // Nonlinear perspective depth curve
        const p0 = Math.pow(1 - z0, 2.1);
        const p1 = Math.pow(1 - z1, 2.1);
        const y0 = horizonY + (H - horizonY) * p0;
        const y1 = horizonY + (H - horizonY) * p1;
        const hw0 = roadTopHalf + (roadBotHalf - roadTopHalf) * p0;
        const hw1 = roadTopHalf + (roadBotHalf - roadTopHalf) * p1;

        ctx.strokeStyle = i % 2 === 0 ? '#F8FAFC' : '#F43F5E';
        ctx.lineWidth = Math.max(3, (p0 + 0.1) * 10);
        ctx.beginPath();
        ctx.moveTo(centerX - hw0, y0);
        ctx.lineTo(centerX - hw1, y1);
        ctx.moveTo(centerX + hw0, y0);
        ctx.lineTo(centerX + hw1, y1);
        ctx.stroke();

        // Lane dashed dividers (-1/3 and +1/3)
        if (i % 2 === 0) {
          ctx.strokeStyle = 'rgba(255,255,255,0.65)';
          ctx.lineWidth = Math.max(2, p0 * 5);
          for (const laneDiv of [-0.333, 0.333]) {
            ctx.beginPath();
            ctx.moveTo(centerX + hw0 * laneDiv, y0);
            ctx.lineTo(centerX + hw1 * laneDiv, y1);
            ctx.stroke();
          }
        }
      }

      // Draw Track Items back-to-front (highest z first)
      const sorted = [...s.items].sort((a, b) => b.z - a.z);
      for (const item of sorted) {
        if (item.z < 0 || item.z > 1) continue;
        const p = Math.pow(1 - item.z, 2.1);
        const y = horizonY + (H - horizonY) * p;
        const halfW = roadTopHalf + (roadBotHalf - roadTopHalf) * p;
        const scale = 0.18 + p * 0.95;

        if (item.kind === 'letter' && item.letter) {
          // Circular Glowing Letter Portal (just like video frame c1_crop1!)
          const radius = Math.max(18, H * 0.22 * scale);
          const cy = y - radius * 0.85;

          ctx.save();
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = Math.max(4, 14 * scale);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.beginPath();
          ctx.arc(centerX, cy, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#1D4ED8';
          ctx.font = `800 ${Math.round(radius * 1.15)}px "Lexend", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.letter, centerX, cy + radius * 0.04);
          ctx.restore();
        } else if (item.kind === 'jump' || item.kind === 'duck') {
          // Red/Amber Hurdle Barrier across road (like c1_crop2!)
          const barW = halfW * 1.65;
          const barH = Math.max(10, 38 * scale);
          const barY = item.kind === 'duck' ? y - 115 * scale : y - barH;

          ctx.save();
          ctx.fillStyle = item.kind === 'jump' ? '#EF4444' : '#F59E0B';
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = Math.max(2, 5 * scale);
          ctx.beginPath();
          ctx.roundRect(centerX - barW / 2, barY, barW, barH, 10 * scale);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        } else if (item.kind === 'left' || item.kind === 'right' || item.kind === 'dance') {
          const laneCenter =
            item.kind === 'left'
              ? centerX - halfW * 0.58
              : item.kind === 'right'
                ? centerX + halfW * 0.58
                : centerX;
          const badgeR = Math.max(14, 58 * scale);
          ctx.save();
          ctx.fillStyle = ACTION_META[item.kind].color;
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = Math.max(3, 6 * scale);
          ctx.beginPath();
          ctx.arc(laneCenter, y - badgeR * 0.8, badgeR, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = `800 ${Math.round(badgeR * 0.85)}px "Baloo 2", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const sym = item.kind === 'left' ? '←' : item.kind === 'right' ? '→' : '★';
          ctx.fillText(sym, laneCenter, y - badgeR * 0.8);
          ctx.restore();
        }
      }

      // Draw Cute Runner Avatar at Bottom Center
      const avatarX = centerX + s.playerLaneX * roadBotHalf * 0.65;
      const jumpY = Math.sin(s.jumpOffset * Math.PI) * (H * 0.14);
      const bobY = phase === 'running' ? Math.abs(Math.sin(now * 0.012)) * 8 : 0;
      const avatarY = H - H * 0.09 - jumpY - bobY;

      ctx.save();
      // Shadow
      ctx.fillStyle = 'rgba(15,23,42,0.28)';
      ctx.beginPath();
      ctx.ellipse(avatarX, H - H * 0.045, 36, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body & astronaut helmet
      ctx.fillStyle = '#F59E0B';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(avatarX - 24, avatarY - 38, 48, 42, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#2563EB';
      ctx.beginPath();
      ctx.arc(avatarX, avatarY - 56, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      rafId = window.requestAnimationFrame(renderFrame);
    };

    rafId = window.requestAnimationFrame(renderFrame);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [level, phase]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-sky-200">
      <ConfettiOverlay active={phase === 'level_clear' || phase === 'finished'} />

      {/* Fullscreen 2.5D Canvas */}
      <canvas ref={canvasRef} className="h-full w-full block" />

      {/* Top HUD Bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4">
        <div className="pointer-events-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              audioManager.stopSpeaking();
              onBackHub();
            }}
            className="flex cursor-pointer items-center gap-2 rounded-2xl border-4 border-white bg-slate-800/90 px-4 py-2 font-heading text-lg font-bold text-white shadow-md hover:bg-slate-700"
          >
            <ArrowLeft className="h-5 w-5" />
            Sảnh chính
          </button>

          <div className="flex items-center gap-2 rounded-2xl border-4 border-amber-400 bg-white/95 px-5 py-2 shadow-md">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <span className="font-heading text-xl font-extrabold text-blue-900">
              Chặng 1: Đường Đua Chữ Cái • LEVEL {level}
            </span>
          </div>
        </div>

        {/* Progress + Level Switcher */}
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-2xl border-4 border-white bg-white/90 px-4 py-2 shadow md:flex">
            <span className="text-sm font-extrabold text-slate-700">Tiến độ:</span>
            <div className="h-4 w-32 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="font-heading text-base font-extrabold text-emerald-700">{progressPct}%</span>
          </div>

          <button
            type="button"
            onClick={() => initLevel(level === 1 ? 2 : 1)}
            className="cursor-pointer rounded-2xl border-4 border-violet-300 bg-violet-600 px-4 py-2 font-heading text-lg font-extrabold text-white shadow hover:bg-violet-500"
          >
            Đổi sang Level {level === 1 ? 2 : 1}
          </button>
        </div>
      </div>

      {/* Big Center Callout Banner when passing Letter Gate or Action */}
      {activePrompt && phase === 'running' && (
        <div className="pointer-events-none absolute inset-x-0 top-20 flex flex-col items-center justify-center">
          {activePrompt.isLetter ? (
            <div className="flex flex-col items-center rounded-[36px] border-8 border-amber-400 bg-white/95 px-14 py-6 shadow-[0_14px_0_rgba(217,119,6,0.35)]">
              <span className="font-letter text-8xl font-extrabold leading-none text-blue-700 md:text-9xl">
                {activePrompt.text}
              </span>
              <span className="font-heading mt-2 text-2xl font-extrabold text-pink-600">{activePrompt.sub}</span>
            </div>
          ) : (
            <div className="rounded-3xl border-4 border-white bg-blue-600/95 px-9 py-3 shadow-lg">
              <span className="font-heading text-3xl font-extrabold tracking-wide text-white md:text-4xl">
                {activePrompt.text}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Picture-in-Picture Pose Coach Card (Bottom Right, like video!) */}
      {phase === 'running' && (
        <div className="pointer-events-none absolute bottom-20 right-5 flex flex-col items-center rounded-3xl border-4 border-blue-600 bg-white/95 p-4 shadow-xl">
          <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-extrabold uppercase text-blue-800">
            Động tác mẫu
          </span>
          <svg viewBox="0 0 100 100" className="mt-1 h-24 w-24">
            <circle cx="50" cy="22" r="12" fill="#F59E0B" stroke="#1E3A8A" strokeWidth="3" />
            <line x1="50" y1="34" x2="50" y2="64" stroke="#1E3A8A" strokeWidth="6" strokeLinecap="round" />
            {activeCoachKind === 'jump' && (
              <>
                <line x1="50" y1="42" x2="24" y2="20" stroke="#2563EB" strokeWidth="6" strokeLinecap="round" />
                <line x1="50" y1="42" x2="76" y2="20" stroke="#2563EB" strokeWidth="6" strokeLinecap="round" />
                <line x1="50" y1="64" x2="32" y2="86" stroke="#1E3A8A" strokeWidth="6" strokeLinecap="round" />
                <line x1="50" y1="64" x2="68" y2="86" stroke="#1E3A8A" strokeWidth="6" strokeLinecap="round" />
              </>
            )}
            {activeCoachKind === 'duck' && (
              <>
                <line x1="50" y1="44" x2="26" y2="54" stroke="#2563EB" strokeWidth="6" strokeLinecap="round" />
                <line x1="50" y1="44" x2="74" y2="54" stroke="#2563EB" strokeWidth="6" strokeLinecap="round" />
                <line x1="50" y1="64" x2="28" y2="76" stroke="#1E3A8A" strokeWidth="6" strokeLinecap="round" />
                <line x1="50" y1="64" x2="72" y2="76" stroke="#1E3A8A" strokeWidth="6" strokeLinecap="round" />
              </>
            )}
            {activeCoachKind === 'left' && (
              <>
                <line x1="50" y1="42" x2="18" y2="38" stroke="#EC4899" strokeWidth="6" strokeLinecap="round" />
                <line x1="50" y1="42" x2="72" y2="54" stroke="#2563EB" strokeWidth="6" strokeLinecap="round" />
                <line x1="50" y1="64" x2="26" y2="88" stroke="#1E3A8A" strokeWidth="6" strokeLinecap="round" />
                <line x1="50" y1="64" x2="66" y2="88" stroke="#1E3A8A" strokeWidth="6" strokeLinecap="round" />
              </>
            )}
            {activeCoachKind === 'right' && (
              <>
                <line x1="50" y1="42" x2="28" y2="54" stroke="#2563EB" strokeWidth="6" strokeLinecap="round" />
                <line x1="50" y1="42" x2="82" y2="38" stroke="#EC4899" strokeWidth="6" strokeLinecap="round" />
                <line x1="50" y1="64" x2="34" y2="88" stroke="#1E3A8A" strokeWidth="6" strokeLinecap="round" />
                <line x1="50" y1="64" x2="74" y2="88" stroke="#1E3A8A" strokeWidth="6" strokeLinecap="round" />
              </>
            )}
            {activeCoachKind === 'dance' && (
              <>
                <line x1="50" y1="42" x2="28" y2="52" stroke="#8B5CF6" strokeWidth="6" strokeLinecap="round" />
                <line x1="50" y1="42" x2="72" y2="52" stroke="#8B5CF6" strokeWidth="6" strokeLinecap="round" />
                <line x1="50" y1="64" x2="30" y2="90" stroke="#1E3A8A" strokeWidth="6" strokeLinecap="round" />
                <line x1="50" y1="64" x2="72" y2="84" stroke="#1E3A8A" strokeWidth="6" strokeLinecap="round" />
              </>
            )}
          </svg>
          <span className="font-heading text-base font-extrabold text-slate-800">
            {ACTION_META[activeCoachKind].label}
          </span>
        </div>
      )}

      {/* Countdown Overlay (3 - 2 - 1 - Let's Begin!) */}
      {phase === 'countdown' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/65 backdrop-blur-xs">
          <span className="rounded-full bg-amber-400 px-6 py-1.5 font-heading text-2xl font-extrabold text-slate-950">
            LEVEL {level}
          </span>
          <div className="mt-5 flex h-44 w-44 items-center justify-center rounded-full border-8 border-amber-300 bg-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.8)]">
            <span className="font-heading text-7xl font-extrabold text-slate-950">
              {countdownNum > 0 ? countdownNum : "Bắt đầu!"}
            </span>
          </div>
          <p className="mt-5 font-heading text-3xl font-bold text-white">
            Các bạn nhỏ đứng dậy khởi động cùng cô nhé!
          </p>
        </div>
      )}

      {/* Level 1 Clear Modal */}
      {phase === 'level_clear' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs">
          <div className="flex max-w-lg flex-col items-center rounded-[36px] border-4 border-amber-400 bg-white p-9 text-center shadow-2xl">
            <Trophy className="h-20 w-20 text-amber-500" />
            <h2 className="font-heading mt-3 text-4xl font-extrabold text-blue-900">Hoàn thành Level 1!</h2>
            <p className="mt-2 text-lg font-semibold text-slate-600">
              Lớp mình vận động giỏi quá! Tăng tốc sang <strong>Level 2</strong> sôi động hơn nhé!
            </p>
            <button
              type="button"
              onClick={() => initLevel(2)}
              className="mt-6 flex cursor-pointer items-center gap-3 rounded-2xl border-4 border-emerald-700 bg-emerald-500 px-9 py-4 font-heading text-2xl font-extrabold text-white shadow-[0_6px_0_#047857] hover:bg-emerald-400"
            >
              Chơi tiếp LEVEL 2
              <ArrowRight className="h-7 w-7" />
            </button>
          </div>
        </div>
      )}

      {/* Stage 1 Finished Modal */}
      {phase === 'finished' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs">
          <div className="flex max-w-xl flex-col items-center rounded-[36px] border-4 border-amber-400 bg-white p-9 text-center shadow-2xl">
            <Trophy className="h-20 w-20 text-amber-500" />
            <h2 className="font-heading mt-3 text-4xl font-extrabold text-emerald-700">
              Xuất sắc vượt qua Chặng 1!
            </h2>
            <p className="mt-2 text-lg font-semibold text-slate-600">
              Các bạn nhỏ {lesson.className} đã sẵn sàng bước sang <strong>Chặng 2: Nghiêng đầu chọn chữ cái</strong> chưa nào?
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => initLevel(1)}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-slate-300 bg-slate-100 px-6 py-3.5 font-heading text-xl font-bold text-slate-700 hover:bg-slate-200"
              >
                <RotateCcw className="h-5 w-5" />
                Chơi lại Chặng 1
              </button>
              <button
                type="button"
                onClick={onNextStage}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border-4 border-blue-800 bg-blue-600 px-8 py-3.5 font-heading text-2xl font-extrabold text-white shadow-[0_6px_0_#1E3A8A] hover:bg-blue-500"
              >
                Sang Chặng 2
                <ArrowRight className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Teacher Toolbar */}
      <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center">
        <div className="flex items-center gap-3 rounded-2xl border-2 border-white bg-white/90 px-5 py-2 shadow-lg backdrop-blur">
          <button
            type="button"
            onClick={() => setPhase((p) => (p === 'running' ? 'paused' : p === 'paused' ? 'running' : p))}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-heading text-base font-bold text-white hover:bg-blue-500"
          >
            {phase === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {phase === 'paused' ? 'Tiếp tục chạy' : 'Tạm dừng'}
          </button>

          <button
            type="button"
            onClick={() => initLevel(level)}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-heading text-base font-bold text-white hover:bg-emerald-500"
          >
            <RotateCcw className="h-4 w-4" />
            Chơi lại Level {level}
          </button>

          <button
            type="button"
            onClick={() => {
              audioManager.stopSpeaking();
              onNextStage();
            }}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-pink-600 px-4 py-2 font-heading text-base font-bold text-white hover:bg-pink-500"
          >
            Qua Chặng 2
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
