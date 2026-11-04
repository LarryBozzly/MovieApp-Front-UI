import { directive, Directive, type ElementPart, type PartInfo, PartType } from 'lit/directive.js';

type ClickOutsideOptions = {
  // When provided, outside clicks are only swallowed (and the callback
  // invoked) while this returns true — i.e. while the overlay is open.
  // While closed, clicks pass through untouched.
  isActive?: () => boolean;
};

class ClickOutsideDirective extends Directive {
  private element?: HTMLElement;
  private callback?: (event: MouseEvent) => void;
  private isActive?: () => boolean;

  constructor(partInfo: PartInfo) {
    super(partInfo);
    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error(
        'clickOutside can only be used on elements (e.g., <div ${clickOutside(...)}></div>)'
      );
    }
  }

  // The update method is called when the directive is used
  update(
    part: ElementPart,
    [callback, options]: [(event: MouseEvent) => void, ClickOutsideOptions?]
  ) {
    if (!this.element) {
      this.element = part.element as HTMLElement;
      // We wait for the next tick to attach to avoid the "opening click"
      // from immediately triggering the "close" logic.
      setTimeout(() => {
        document.addEventListener('click', this.handleEvent, true);
      }, 0);
    }
    this.callback = callback;
    this.isActive = options?.isActive;
    return this.render(callback);
  }

  render(_callback: (event: MouseEvent) => void, _options?: ClickOutsideOptions) {
    return null;
  }

  // Capture phase at document runs before the click reaches any content,
  // so outside taps can be swallowed instead of activating the element
  // underneath (e.g. closing a dropdown without opening a card).
  private handleEvent = (event: MouseEvent) => {
    if (!this.element) return;

    const path = event.composedPath();
    if (path.includes(this.element)) return;

    // Overlay is closed (or no predicate given): don't touch the event.
    if (this.isActive && !this.isActive()) return;

    event.stopPropagation();
    this.callback?.(event);
  };

  // Lit directive lifecycle cleanup
  protected disconnected() {
    document.removeEventListener('click', this.handleEvent, true);
  }

  protected reconnected() {
    document.addEventListener('click', this.handleEvent, true);
  }
}

export const clickOutside = directive(ClickOutsideDirective);
