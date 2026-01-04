class DeviceInfoService {
  private listeners: Set<(isForeground: boolean) => void> = new Set();

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  /** Returns true if the app is currently in the foreground */
  public isForeground(): boolean {
    return document.visibilityState === 'visible';
  }

  /** Best-practice mobile detection */
  public isMobile(): boolean {
    if (typeof window === 'undefined') return false;

    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const noHover = !window.matchMedia('(hover: hover)').matches;
    const smallViewport = window.innerWidth <= 768;

    if (hasCoarsePointer && noHover) return true;
    if (smallViewport) return true;
    if (typeof navigator !== 'undefined') {
      return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent);
    }

    return false;
  }

  /** Subscribe to foreground/background changes */
  public onVisibilityChange(callback: (isForeground: boolean) => void): void {
    this.listeners.add(callback);
  }

  /** Remove a previously added visibility change listener */
  public removeVisibilityListener(callback: (isForeground: boolean) => void): void {
    this.listeners.delete(callback);
  }

  /** Cleanup all listeners */
  public destroy(): void {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.listeners.clear();
  }

  /** Internal: notify all listeners */
  private handleVisibilityChange = (): void => {
    const isForeground = this.isForeground();
    for (const listener of this.listeners) {
      listener(isForeground);
    }
  };
}

export default DeviceInfoService;
