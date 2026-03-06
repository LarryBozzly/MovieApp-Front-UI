export type ToastType = 'info' | 'success' | 'warning' | 'error';

type ToastContent =
  | string
  | HTMLElement
  | {
      tag: string;
      props?: Record<string, any>;
      useProperties?: boolean;
    };

interface ToastOptions {
  type?: ToastType;
  duration?: number; // ms
}

class ToastService {
  private static instance: ToastService;
  private container: HTMLElement;

  private constructor() {
    let container = document.querySelector('.toast.toast-bottom.toast-center') as HTMLElement;

    if (!container) {
      container = document.createElement('div');
      container.className = 'toast toast-top toast-center';
      container.style.zIndex = '500';
      document.body.appendChild(container);
    }

    this.container = container;
  }

  public static getInstance(): ToastService {
    if (!ToastService.instance) {
      ToastService.instance = new ToastService();
    }
    return ToastService.instance;
  }

  private getAlertClass(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'alert alert-success';
      case 'warning':
        return 'alert alert-warning';
      case 'error':
        return 'alert alert-error';
      case 'info':
      default:
        return 'alert alert-info';
    }
  }

  show(content: ToastContent, options: ToastOptions = {}): void {
    const { type = 'info', duration = 3000 } = options;

    const toast = document.createElement('div');
    toast.className = `${this.getAlertClass(type)} shadow-lg`;

    // Mobile-friendly animation setup
    toast.style.opacity = '0';
    toast.style.transform = 'translate3d(0, 20px, 0)'; // GPU
    toast.style.willChange = 'opacity, transform';
    toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

    let element: HTMLElement | null = null;

    if (typeof content === 'string') {
      const span = document.createElement('span');
      span.textContent = content;
      toast.appendChild(span);
    } else if (content instanceof HTMLElement) {
      toast.appendChild(content);
    } else if (content && 'tag' in content) {
      element = document.createElement(content.tag);
      const { props = {}, useProperties = false } = content;

      for (const [key, value] of Object.entries(props)) {
        if (useProperties) {
          (element as any)[key] = value;
        } else {
          if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean'
          ) {
            element.setAttribute(key, String(value));
          } else {
            (element as any)[key] = value;
          }
        }
      }

      toast.appendChild(element);
    }

    this.container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translate3d(0, 0, 0)';
    });

    // Remove after duration with exit animation
    setTimeout(() => {
      // start exit
      toast.style.opacity = '0';
      toast.style.transform = 'translate3d(0, 20px, 0)';

      // remove only after transition ends
      const removeListener = () => {
        toast.remove();
        toast.removeEventListener('transitionend', removeListener);
      };
      toast.addEventListener('transitionend', removeListener);
    }, duration);
  }
}

export default ToastService;
