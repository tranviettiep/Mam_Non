import { VoiceRole, VoiceSettings } from '../types/lesson';
import { VOICE_BANK_CUTE, VOICE_BANK_TEACHER } from '../data/voiceBank';
import { getSpeechLookupKey, normalizeVietnameseForSpeech } from './vnPhonetics';

const VOICE_SETTINGS_STORAGE_KEY = 'mam_non_voice_settings_v1';

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  preset: 'auto_role',
  rate: 1.0,
  voiceVolume: 1.0,
  sfxVolume: 0.85,
  muted: false,
};

export const PREVIEW_TEXT_TEACHER =
  'Xin chào các bạn nhỏ đáng yêu! Hôm nay cô và các con cùng khám phá sân chơi chữ cái Tiếng Việt thật vui nhé!';

export const PREVIEW_TEXT_CUTE =
  'Xin chào các bạn nhỏ! Mình là bạn chữ cái tí hon đây, chúng mình cùng thi tài xem ai tinh mắt nhất nào!';

function loadStoredVoiceSettings(): VoiceSettings {
  if (typeof localStorage === 'undefined') {
    return { ...DEFAULT_VOICE_SETTINGS };
  }
  try {
    const raw = localStorage.getItem(VOICE_SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_VOICE_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<VoiceSettings>;
    return {
      preset:
        parsed.preset === 'auto_role' ||
        parsed.preset === 'teacher_sweet' ||
        parsed.preset === 'cartoon_cute' ||
        parsed.preset === 'slow_clear'
          ? parsed.preset
          : DEFAULT_VOICE_SETTINGS.preset,
      rate: typeof parsed.rate === 'number' ? Math.min(1.25, Math.max(0.75, parsed.rate)) : 1.0,
      voiceVolume:
        typeof parsed.voiceVolume === 'number' ? Math.min(1, Math.max(0, parsed.voiceVolume)) : 1.0,
      sfxVolume:
        typeof parsed.sfxVolume === 'number' ? Math.min(1, Math.max(0, parsed.sfxVolume)) : 0.85,
      muted: Boolean(parsed.muted),
    };
  } catch {
    return { ...DEFAULT_VOICE_SETTINGS };
  }
}

function scoreVietnameseVoice(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  const lang = v.lang.toLowerCase();
  if (!lang.startsWith('vi') && !name.includes('vietnam') && !name.includes('tiếng việt')) {
    return -1000;
  }

  let score = 10;
  if (name.includes('hoaimy') || name.includes('hoài my')) score += 120;
  if (name.includes('google')) score += 95;
  if (name.includes('linh')) score += 85;
  if (name.includes('female') || name.includes('nữ')) score += 60;
  if (name.includes('natural') || name.includes('neural') || name.includes('online')) score += 35;

  // Tránh tối đa các giọng Nam mặc định trên Windows (Microsoft An / NamMinh)
  if (
    /\ban\b/.test(name) ||
    name.includes('microsoft an') ||
    name.includes('namminh') ||
    name.includes('nam minh') ||
    /\bmale\b/.test(name)
  ) {
    score -= 90;
  }
  return score;
}

function pickBestVietnameseVoice(): { voice: SpeechSynthesisVoice | null; isFemalePreferred: boolean } {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return { voice: null, isFemalePreferred: false };
  }
  const voices = window.speechSynthesis.getVoices();
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -999;

  for (const v of voices) {
    const s = scoreVietnameseVoice(v);
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
  }

  if (!best || bestScore <= -500) {
    return { voice: null, isFemalePreferred: false };
  }
  return { voice: best, isFemalePreferred: bestScore >= 0 };
}

class ClassroomAudioManager {
  private ctx: AudioContext | null = null;
  private ringTimer: number | null = null;
  private activeAudioEl: HTMLAudioElement | null = null;
  private speechTimer: number | null = null;
  private settings: VoiceSettings = loadStoredVoiceSettings();
  private listeners = new Set<(s: VoiceSettings) => void>();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Khởi tạo sớm danh sách giọng đọc của trình duyệt
      try {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.addEventListener?.('voiceschanged', () => {
          window.speechSynthesis.getVoices();
        });
      } catch {
        // ignore
      }
    }
  }

  public get muted(): boolean {
    return this.settings.muted;
  }

  public set muted(val: boolean) {
    this.updateSettings({ muted: val });
  }

  public getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public updateSettings(patch: Partial<VoiceSettings>): VoiceSettings {
    this.settings = {
      ...this.settings,
      ...patch,
    };
    if (this.settings.muted) {
      this.stopRingtone();
      this.stopSpeaking();
    }
    if (this.activeAudioEl) {
      this.activeAudioEl.volume = this.settings.muted ? 0 : this.settings.voiceVolume;
    }
    try {
      localStorage.setItem(VOICE_SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // ignore storage quota errors
    }
    const snapshot = this.getSettings();
    this.listeners.forEach((fn) => fn(snapshot));
    return snapshot;
  }

  public resetSettings(): VoiceSettings {
    return this.updateSettings({ ...DEFAULT_VOICE_SETTINGS });
  }

  public subscribe(listener: (s: VoiceSettings) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getBrowserVoiceStatus(): { name: string; isFemalePreferred: boolean } | null {
    const picked = pickBestVietnameseVoice();
    if (!picked.voice) return null;
    return { name: picked.voice.name, isFemalePreferred: picked.isFemalePreferred };
  }

  private ensureContext(): AudioContext | null {
    if (this.settings.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock(): void {
    this.ensureContext();
  }

  private playTone(
    freq: number,
    startOffset: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainPeak = 0.18
  ): void {
    if (this.settings.muted || this.settings.sfxVolume <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const scaledPeak = Math.max(0.002, gainPeak * this.settings.sfxVolume);
    const now = ctx.currentTime + startOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(scaledPeak, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playClick(): void {
    this.playTone(660, 0, 0.08, 'triangle', 0.12);
  }

  public playCountdownBeep(isGo = false): void {
    if (isGo) {
      this.playTone(587.33, 0, 0.12, 'triangle', 0.2);
      this.playTone(880, 0.1, 0.32, 'triangle', 0.24);
    } else {
      this.playTone(523.25, 0, 0.16, 'sine', 0.18);
    }
  }

  public playCorrect(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, idx * 0.08, 0.22, 'triangle', 0.2);
    });
  }

  public playRetry(): void {
    this.playTone(349.23, 0, 0.18, 'sine', 0.14);
    this.playTone(293.66, 0.16, 0.26, 'sine', 0.14);
  }

  public playStrokeComplete(): void {
    this.playTone(659.25, 0, 0.12, 'triangle', 0.18);
    this.playTone(987.77, 0.1, 0.24, 'triangle', 0.2);
  }

  public playPop(): void {
    this.playTone(520, 0, 0.08, 'sine', 0.15);
    this.playTone(784, 0.05, 0.16, 'triangle', 0.17);
  }

  public playDanceBeat(moveIdx = 0): void {
    const patterns: number[][] = [
      [523.25, 659.25, 783.99],
      [587.33, 783.99, 987.77],
      [659.25, 783.99, 1046.5],
      [523.25, 783.99, 659.25],
    ];
    const notes = patterns[((moveIdx % patterns.length) + patterns.length) % patterns.length];
    notes.forEach((freq, idx) => {
      this.playTone(freq, idx * 0.075, 0.14, 'triangle', 0.16);
    });
  }

  public playCelebration(): void {
    const melody = [
      { f: 523.25, t: 0, d: 0.14 },
      { f: 659.25, t: 0.12, d: 0.14 },
      { f: 783.99, t: 0.24, d: 0.14 },
      { f: 1046.5, t: 0.36, d: 0.36 },
      { f: 783.99, t: 0.56, d: 0.14 },
      { f: 1046.5, t: 0.7, d: 0.48 },
    ];
    melody.forEach((m) => this.playTone(m.f, m.t, m.d, 'triangle', 0.22));
  }

  public startRingtone(): void {
    this.stopRingtone();
    const ringOnce = () => {
      this.playTone(784, 0, 0.12, 'sine', 0.14);
      this.playTone(988, 0.14, 0.12, 'sine', 0.14);
      this.playTone(784, 0.28, 0.12, 'sine', 0.14);
      this.playTone(1175, 0.42, 0.25, 'sine', 0.16);
    };
    ringOnce();
    this.ringTimer = window.setInterval(ringOnce, 1800);
  }

  public stopRingtone(): void {
    if (this.ringTimer !== null) {
      window.clearInterval(this.ringTimer);
      this.ringTimer = null;
    }
  }

  public stopSpeaking(): void {
    if (this.speechTimer !== null) {
      window.clearTimeout(this.speechTimer);
      this.speechTimer = null;
    }
    if (this.activeAudioEl) {
      this.activeAudioEl.pause();
      this.activeAudioEl.currentTime = 0;
      this.activeAudioEl = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public previewVoice(onEnd?: () => void): void {
    const isCute = this.settings.preset === 'cartoon_cute';
    const sample = isCute ? PREVIEW_TEXT_CUTE : PREVIEW_TEXT_TEACHER;
    const role: VoiceRole = isCute ? 'character' : 'teacher';
    this.speakVi(sample, undefined, onEnd, role);
  }

  public speakVi(
    text: string,
    customAudioUrl?: string,
    onEnd?: () => void,
    role: VoiceRole = 'teacher'
  ): void {
    this.stopSpeaking();
    if (this.settings.muted || this.settings.voiceVolume <= 0.01) {
      onEnd?.();
      return;
    }

    let finished = false;
    const finishOnce = () => {
      if (finished) return;
      finished = true;
      if (this.speechTimer !== null) {
        window.clearTimeout(this.speechTimer);
        this.speechTimer = null;
      }
      onEnd?.();
    };

    const presetRateFactor = this.settings.preset === 'slow_clear' ? 0.85 : 1.0;
    const effectiveRate = Math.min(1.4, Math.max(0.65, this.settings.rate * presetRateFactor));
    const wantCute =
      this.settings.preset === 'cartoon_cute' ||
      (this.settings.preset === 'auto_role' && role === 'character');

    // 1. Ưu tiên bản ghi âm giọng thật của cô giáo (nếu có)
    if (customAudioUrl) {
      this.playAudioDataUrl(customAudioUrl, effectiveRate, true, () =>
        this.speakFallbackOrBank(text, effectiveRate, wantCute, finishOnce, true)
      , finishOnce);
      return;
    }

    // 2. Tra cứu ngân hàng giọng Nữ Thuần Việt Neural (Hoài My) nhúng sẵn Offline
    this.speakFallbackOrBank(text, effectiveRate, wantCute, finishOnce, false);
  }

  private speakFallbackOrBank(
    text: string,
    effectiveRate: number,
    wantCute: boolean,
    finishOnce: () => void,
    skipBank: boolean
  ): void {
    if (!skipBank) {
      const key = getSpeechLookupKey(text);
      const cuteClip = VOICE_BANK_CUTE[key];
      const teacherClip = VOICE_BANK_TEACHER[key];

      if (wantCute && cuteClip) {
        this.playAudioDataUrl(
          cuteClip,
          effectiveRate,
          true,
          () => this.speakWithWebSpeech(text, effectiveRate, wantCute, finishOnce),
          finishOnce
        );
        return;
      }

      if (wantCute && teacherClip) {
        // Nếu người dùng chọn giọng Bạn nhỏ nhí nhảnh cho câu hướng dẫn của cô:
        // nâng nhẹ cao độ +7% khi tốc độ >= 0.95, ngược lại giữ nguyên preservesPitch để không bị trầm giọng
        const shiftPitchCute = effectiveRate >= 0.95;
        const rateToUse = shiftPitchCute ? Math.min(1.3, effectiveRate * 1.07) : effectiveRate;
        this.playAudioDataUrl(
          teacherClip,
          rateToUse,
          !shiftPitchCute,
          () => this.speakWithWebSpeech(text, effectiveRate, wantCute, finishOnce),
          finishOnce
        );
        return;
      }

      if (teacherClip) {
        this.playAudioDataUrl(
          teacherClip,
          effectiveRate,
          true,
          () => this.speakWithWebSpeech(text, effectiveRate, wantCute, finishOnce),
          finishOnce
        );
        return;
      }
    }

    // 3. Fallback thông minh cho câu hỏi mới cô tự gõ thêm: chuẩn hóa âm Tiếng Việt + chọn giọng Nữ
    this.speakWithWebSpeech(text, effectiveRate, wantCute, finishOnce);
  }

  private playAudioDataUrl(
    url: string,
    playbackRate: number,
    preservePitch: boolean,
    onErrorFallback: () => void,
    finishOnce: () => void
  ): void {
    const audio = new Audio(url);
    this.activeAudioEl = audio;
    audio.volume = Math.min(1, Math.max(0, this.settings.voiceVolume));

    const audioWithPitch = audio as HTMLAudioElement & {
      preservesPitch?: boolean;
      webkitPreservesPitch?: boolean;
      mozPreservesPitch?: boolean;
    };
    audioWithPitch.preservesPitch = preservePitch;
    audioWithPitch.webkitPreservesPitch = preservePitch;
    audioWithPitch.mozPreservesPitch = preservePitch;

    audio.defaultPlaybackRate = playbackRate;
    audio.playbackRate = playbackRate;

    audio.onended = finishOnce;
    audio.onerror = onErrorFallback;

    const timeoutMs = Math.max(5000, Math.round(20000 / Math.max(0.65, playbackRate)));
    this.speechTimer = window.setTimeout(finishOnce, timeoutMs);
    audio.play().catch(onErrorFallback);
  }

  private speakWithWebSpeech(
    rawText: string,
    effectiveRate: number,
    wantCute: boolean,
    finishOnce: () => void
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      finishOnce();
      return;
    }

    try {
      const normalizedText = normalizeVietnameseForSpeech(rawText);
      const utter = new SpeechSynthesisUtterance(normalizedText);
      utter.lang = 'vi-VN';
      utter.volume = Math.min(1, Math.max(0, this.settings.voiceVolume));
      utter.rate = Math.min(1.35, Math.max(0.65, 0.94 * effectiveRate));

      const { voice, isFemalePreferred } = pickBestVietnameseVoice();
      if (voice) {
        utter.voice = voice;
      }

      if (isFemalePreferred) {
        utter.pitch = wantCute ? 1.18 : 1.06;
      } else {
        // Nếu máy Windows chỉ có giọng Microsoft An (Nam), nâng cao độ để thanh nhẹ hơn
        utter.pitch = wantCute ? 1.45 : 1.32;
      }

      utter.onend = finishOnce;
      utter.onerror = finishOnce;

      const estMs = Math.max(
        2400,
        Math.min(16000, Math.round((normalizedText.length * 95) / Math.max(0.65, effectiveRate)))
      );
      this.speechTimer = window.setTimeout(finishOnce, estMs);
      window.speechSynthesis.speak(utter);
    } catch {
      finishOnce();
    }
  }
}

export const audioManager = new ClassroomAudioManager();
