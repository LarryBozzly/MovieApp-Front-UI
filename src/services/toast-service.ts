type ToastType = 'info' | 'success' | 'warning' | 'error';

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

export default class ToastService {
  private container: HTMLElement;

  constructor() {
    let container = document.querySelector('.toast.toast-top.toast-end') as HTMLElement;

    if (!container) {
      container = document.createElement('div');
      container.className = 'toast toast-top toast-end';
      document.body.appendChild(container);
    }

    this.container = container;
  }

  show(content: ToastContent, options: ToastOptions = {}): void {
    const { type = 'info', duration = 3000 } = options;

    const toast = document.createElement('div');
    toast.className = `alert alert-${type}`;

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

    setTimeout(() => {
      toast.remove();
    }, duration);
  }
}
