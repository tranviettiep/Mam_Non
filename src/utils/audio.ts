class ClassroomAudioManager {
  private ctx: AudioContext | null = null;
  private ringTimer: number | null = null;
  private activeAudioEl: HTMLAudioElement | null = null;
  private speechTimer: number | null = null;
  public muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

  private playTone(freq: number, startOffset: number, duration: number, type: OscillatorType = 'sine', gainPeak = 0.18): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + startOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.02);
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

  public playCelebration(): void {
    const melody = [
      { f: 523.25, t: 0, d: 0.14 },
      { f: 659.25, t: 0.12, d: 0.14 },
      { f: 783.99, t: 0.24, d: 0.14 },
      { f: 1046.5, t: 0.36, d: 0.36 },
      { f: 783.99, t: 0.56, d: 0.14 },
      { f: 1046.5, t: 0.70, d: 0.48 },
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

  public speakVi(text: string, customAudioUrl?: string, onEnd?: () => void): void {
    this.stopSpeaking();
    if (this.muted) {
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

    if (customAudioUrl) {
      const audio = new Audio(customAudioUrl);
      this.activeAudioEl = audio;
      audio.onended = finishOnce;
      audio.onerror = () => this.speakWithWebSpeech(text, finishOnce);
      this.speechTimer = window.setTimeout(finishOnce, 15000);
      audio.play().catch(() => this.speakWithWebSpeech(text, finishOnce));
      return;
    }

    this.speakWithWebSpeech(text, finishOnce);
  }

  private speakWithWebSpeech(text: string, finishOnce: () => void): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      finishOnce();
      return;
    }

    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'vi-VN';
      utter.rate = 0.92;
      utter.pitch = 1.08;

      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find((v) => v.lang.toLowerCase().startsWith('vi'));
      if (viVoice) {
        utter.voice = viVoice;
      }

      utter.onend = finishOnce;
      utter.onerror = finishOnce;

      const estMs = Math.max(2200, Math.min(14000, text.length * 95));
      this.speechTimer = window.setTimeout(finishOnce, estMs);
      window.speechSynthesis.speak(utter);
    } catch {
      finishOnce();
    }
  }
}

export const audioManager = new ClassroomAudioManager();
