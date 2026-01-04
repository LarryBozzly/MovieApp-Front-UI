import Hammer from 'hammerjs';

export interface BottomSheetConfig<T = any> {
  tag: string;
  props?: Partial<T>;
  dismissible?: boolean;
}

export interface BottomSheetRef {
  close: () => void;
}

type ActiveSheet = {
  backdrop: HTMLDivElement;
  container: HTMLDivElement;
  content: HTMLElement;
  hammerManager: HammerManager;
};

export default class BottomSheetService {
  private active?: ActiveSheet;
  private animationDuration = 250;

  open<T = any>(config: BottomSheetConfig<T>): BottomSheetRef {
    this.close();

    const backdrop = document.createElement('div');
    const container = document.createElement('div');
    const content = document.createElement(config.tag) as any;

    if (config.props) Object.assign(content, config.props);

    this.applyBackdropStyles(backdrop);
    this.applyContainerStyles(container);

    // --- Drag handle ---
    const handle = document.createElement('div');
    Object.assign(handle.style, {
      width: '40px',
      height: '4px',
      background: 'rgba(0,0,0,0.3)',
      borderRadius: '2px',
      margin: '8px auto',
      cursor: 'grab',
      touchAction: 'pan-y',
      userSelect: 'none',
    });
    container.appendChild(handle);
    container.appendChild(content);

    const close = () => this.close();
    content.close = close;

    if (config.dismissible !== false) backdrop.addEventListener('click', close);

    // Append to DOM
    document.body.appendChild(backdrop);
    document.body.appendChild(container);
    this.lockScroll();

    // Animate in
    requestAnimationFrame(() => {
      backdrop.style.opacity = '1';
      container.style.transform = 'translate3d(0, 0, 0)';
    });

    // --- Hammer.js vertical pan for touch + mouse ---
    const manager = new Hammer.Manager(container, {
      inputClass: Hammer.TouchMouseInput, // support desktop + mobile
      touchAction: 'pan-y',
    });

    const pan = new Hammer.Pan({ direction: Hammer.DIRECTION_VERTICAL, threshold: 0 });
    manager.add(pan);

    let startY = 0;

    manager.on('panstart', () => {
      container.style.transition = 'none';
      backdrop.style.transition = 'none';
      startY = 0;
    });

    manager.on('panmove', (e) => {
      if (!startY) startY = e.deltaY;
      const deltaY = Math.max(e.deltaY, 0); // only downward drag
      container.style.transform = `translate3d(0, ${deltaY}px, 0)`;
      backdrop.style.opacity = `${Math.max(0, 1 - deltaY / window.innerHeight)}`;
    });

    manager.on('panend', (e) => {
      container.style.transition = `transform ${this.animationDuration}ms ease`;
      backdrop.style.transition = `opacity ${this.animationDuration}ms ease`;

      const shouldClose = e.deltaY > window.innerHeight * 0.25 || e.velocityY > 0.5;
      if (shouldClose) {
        container.style.transform = `translate3d(0, 100%, 0)`;
        backdrop.style.opacity = '0';
        setTimeout(() => this.close(), this.animationDuration);
      } else {
        container.style.transform = `translate3d(0, 0, 0)`;
        backdrop.style.opacity = '1';
      }
    });

    // Ensure container & handle prevent unwanted selection / interference
    container.style.touchAction = 'pan-y';
    container.style.userSelect = 'none';
    handle.style.touchAction = 'pan-y';
    handle.style.userSelect = 'none';

    this.active = { backdrop, container, content, hammerManager: manager };
    return { close };
  }

  close() {
    if (!this.active) return;

    const { backdrop, container, content, hammerManager } = this.active;

    hammerManager.destroy();

    container.style.transition = `transform ${this.animationDuration}ms ease`;
    backdrop.style.transition = `opacity ${this.animationDuration}ms ease`;

    container.style.transform = 'translate3d(0, 100%, 0)';
    backdrop.style.opacity = '0';

    setTimeout(() => {
      content.remove();
      container.remove();
      backdrop.remove();
      this.unlockScroll();
    }, this.animationDuration);

    this.active = undefined;
  }

  // ---------- Styling helpers ----------
  private applyBackdropStyles(el: HTMLDivElement) {
    Object.assign(el.style, {
      position: 'fixed',
      inset: '0',
      background: 'rgba(0,0,0,0.45)',
      opacity: '0',
      transition: `opacity ${this.animationDuration}ms ease`,
      zIndex: '1000',
      touchAction: 'none',
    });
  }

  private applyContainerStyles(el: HTMLDivElement) {
    Object.assign(el.style, {
      position: 'fixed',
      left: '0',
      right: '0',
      bottom: '0',
      background: '#fff',
      borderRadius: '16px 16px 0 0',
      transform: 'translate3d(0, 100%, 0)', // GPU-accelerated
      transition: `transform ${this.animationDuration}ms ease`,
      zIndex: '1001',
      maxHeight: '90dvh',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      boxShadow: '0 -8px 24px rgba(0,0,0,0.15)',
      touchAction: 'pan-y',
      userSelect: 'none',
      willChange: 'transform', // improve performance
    });
  }

  // ---------- Scroll lock ----------
  private originalOverflow?: string;
  private lockScroll() {
    this.originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  private unlockScroll() {
    document.body.style.overflow = this.originalOverflow ?? '';
  }
}
