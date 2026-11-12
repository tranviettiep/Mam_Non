export type DevicePlatform = 'ios' | 'android' | 'desktop';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export interface PwaInstallState {
  canNativePrompt: boolean;
  isStandalone: boolean;
  isFileProtocol: boolean;
  platform: DevicePlatform;
}

function detectPlatform(): DevicePlatform {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  const isIPhoneOrIPod = /iPhone|iPod/i.test(ua);
  const isIPad =
    /iPad/i.test(ua) ||
    (navigator.platform === 'MacIntel' && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1);
  if (isIPhoneOrIPod || isIPad) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

function checkStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    Boolean(nav.standalone) ||
    Boolean(window.matchMedia?.('(display-mode: standalone)').matches) ||
    Boolean(window.matchMedia?.('(display-mode: fullscreen)').matches && nav.standalone)
  );
}

class PwaInstallManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isStandalone = checkStandalone();
  private readonly platform: DevicePlatform = detectPlatform();
  private readonly isFileProtocol =
    typeof window !== 'undefined' && window.location.protocol === 'file:';
  private listeners = new Set<(state: PwaInstallState) => void>();

  constructor() {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.notify();
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.isStandalone = true;
      this.notify();
    });

    const mql = window.matchMedia?.('(display-mode: standalone)');
    mql?.addEventListener?.('change', (ev) => {
      this.isStandalone = ev.matches || checkStandalone();
      this.notify();
    });
  }

  public registerServiceWorker(): void {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') return;
    // Skip SW registration on Vite HMR dev server to avoid caching dev modules
    if (document.querySelector('script[src*="/@vite/client"]')) return;

    const doRegister = () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {
        // ignore SW registration failure in restricted webviews
      });
    };

    if (document.readyState === 'complete') {
      doRegister();
    } else {
      window.addEventListener('load', doRegister, { once: true });
    }
  }

  public getState(): PwaInstallState {
    return {
      canNativePrompt: Boolean(this.deferredPrompt),
      isStandalone: this.isStandalone,
      isFileProtocol: this.isFileProtocol,
      platform: this.platform,
    };
  }

  public subscribe(fn: (state: PwaInstallState) => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  public async triggerNativeInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!this.deferredPrompt) return 'unavailable';
    const promptEvent = this.deferredPrompt;
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        this.deferredPrompt = null;
        this.notify();
        return 'accepted';
      }
      this.notify();
      return 'dismissed';
    } catch {
      return 'unavailable';
    }
  }

  private notify(): void {
    const snap = this.getState();
    this.listeners.forEach((fn) => fn(snap));
  }
}

export const pwaManager = new PwaInstallManager();
