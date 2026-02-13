import { Directive, PartType, directive } from 'lit/directive.js';
import type { ElementPart, PartInfo } from 'lit/directive.js';

type GhostTapHandler = (event: PointerEvent) => void;

class GhostTapDirective extends Directive {
  private element?: HTMLElement;
  private handler?: GhostTapHandler;
  private touchCanceled = false;

  constructor(partInfo: PartInfo) {
    super(partInfo);
    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error('ghostTap directive can only be used on elements.');
    }
  }

  private onTouchStart = (event: TouchEvent) => {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement | null;
    if (!target) return;
    this.touchCanceled = false;
    target.classList.add('ghost-only-active', 'is-pressed');
    target.blur();
  };

  private onTouchMove = (event: TouchEvent) => {
    const target = event.currentTarget as HTMLElement | null;
    const touch = event.touches[0];
    if (!target || !touch) return;
    const rect = target.getBoundingClientRect();
    const inside =
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom;
    if (!inside) {
      this.touchCanceled = true;
      target.classList.remove('is-pressed');
    } else {
      target.classList.add('is-pressed');
    }
  };

  private onTouchEnd = (event: TouchEvent) => {
    const target = event.currentTarget as HTMLElement | null;
    if (!target) return;
    target.classList.remove('is-pressed');
  };

  private onTouchCancel = (event: TouchEvent) => {
    const target = event.currentTarget as HTMLElement | null;
    if (!target) return;
    this.touchCanceled = true;
    target.classList.remove('is-pressed');
  };

  private onPointerUp = (event: PointerEvent) => {
    if (event.pointerType === 'touch' && this.touchCanceled) {
      this.touchCanceled = false;
      return;
    }
    this.handler?.(event);
  };

  private attachListeners(element: HTMLElement) {
    element.classList.add('ghost-only-active');
    element.addEventListener('touchstart', this.onTouchStart, { passive: false });
    element.addEventListener('touchmove', this.onTouchMove, { passive: true });
    element.addEventListener('touchend', this.onTouchEnd, { passive: true });
    element.addEventListener('touchcancel', this.onTouchCancel, { passive: true });
    element.addEventListener('pointerup', this.onPointerUp);
  }

  private detachListeners(element: HTMLElement) {
    element.removeEventListener('touchstart', this.onTouchStart);
    element.removeEventListener('touchmove', this.onTouchMove);
    element.removeEventListener('touchend', this.onTouchEnd);
    element.removeEventListener('touchcancel', this.onTouchCancel);
    element.removeEventListener('pointerup', this.onPointerUp);
  }

  render(_handler: GhostTapHandler) {}

  update(part: ElementPart, [handler]: [GhostTapHandler]) {
    if (this.element !== part.element) {
      const element = part.element as HTMLElement;
      if (this.element) this.detachListeners(this.element);
      this.element = element;
      this.attachListeners(element);
    }
    this.handler = handler;
  }

  disconnected() {
    if (this.element) this.detachListeners(this.element);
  }
}

export const ghostTap = directive(GhostTapDirective);
