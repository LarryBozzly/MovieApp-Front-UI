import { directive, Directive, type AttributePart } from 'lit/directive.js';

/**
 * Usage: <div ${dynamicHeight(0.96)}></div>
 * 0.96 = 96% of --app-height
 */
export const dynamicHeight = directive(
  class DynamicHeightDirective extends Directive {
    private resizeObserver?: () => void;

    render(_fraction: number) {
      return '';
    }

    update(part: AttributePart, [fraction]: [number]) {
      const el = part.element as HTMLElement;
      const appRoot = document.querySelector('app-root')! as HTMLElement;

      if (!appRoot) return;

      const applyHeight = () => {
        const styles = getComputedStyle(appRoot);
        const appHeight = parseFloat(styles.getPropertyValue('--app-height')) || window.innerHeight;
        el.style.maxHeight = `${appHeight * fraction}px`;
      };

      // Apply initial height
      applyHeight();

      // Remove previous listener if exists
      if (this.resizeObserver) window.removeEventListener('resize', this.resizeObserver);

      // Update on window resize
      this.resizeObserver = applyHeight;
      window.addEventListener('resize', this.resizeObserver);

      return '';
    }

    disconnected() {
      if (this.resizeObserver) window.removeEventListener('resize', this.resizeObserver);
    }
  }
);
