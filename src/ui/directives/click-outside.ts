import { directive, Directive, type ElementPart, type PartInfo, PartType } from 'lit/directive.js';

class ClickOutsideDirective extends Directive {
  private element?: HTMLElement;
  private callback?: (event: MouseEvent) => void;

  constructor(partInfo: PartInfo) {
    super(partInfo);
    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error(
        'clickOutside can only be used on elements (e.g., <div ${clickOutside(...)}></div>)'
      );
    }
  }

  // The update method is called when the directive is used
  update(part: ElementPart, [callback]: [(event: MouseEvent) => void]) {
    if (!this.element) {
      this.element = part.element as HTMLElement;
      // We wait for the next tick to attach to avoid the "opening click"
      // from immediately triggering the "close" logic.
      setTimeout(() => {
        document.addEventListener('click', this.handleEvent);
      }, 0);
    }
    this.callback = callback;
    return this.render(callback);
  }

  render(_callback: (event: MouseEvent) => void) {
    return null;
  }

  private handleEvent = (event: MouseEvent) => {
    if (!this.element) return;

    const path = event.composedPath();
    if (!path.includes(this.element)) {
      this.callback?.(event);
    }
  };

  // Lit directive lifecycle cleanup
  protected disconnected() {
    document.removeEventListener('click', this.handleEvent);
  }

  protected reconnected() {
    document.addEventListener('click', this.handleEvent);
  }
}

export const clickOutside = directive(ClickOutsideDirective);
