type ComponentProps = Record<string, any>;

type ModalContent =
  | string
  | HTMLElement
  | {
      tag: string;
      props?: ComponentProps;
      useProperties?: boolean;
      isOnboarding?: boolean;
    };

class ModalService {
  private static instance: ModalService;
  private modal: HTMLDialogElement;
  private contentContainer: HTMLElement;

  private constructor() {
    // Create modal structure dynamically if not present
    let modal = document.getElementById('global-modal') as HTMLDialogElement;

    if (!modal) {
      modal = document.createElement('dialog');
      modal.id = 'global-modal';
      modal.className = 'modal';

      const modalBox = document.createElement('div');
      modalBox.className = 'modal-box';
      modalBox.id = 'modal-content';

      // ✅ Apply safe-area padding and scrolling support
      modalBox.style.paddingTop = 'env(safe-area-inset-top)';
      modalBox.style.paddingBottom = 'env(safe-area-inset-bottom)';
      modalBox.style.paddingLeft = 'env(safe-area-inset-left)';
      modalBox.style.paddingRight = 'env(safe-area-inset-right)';
      modalBox.style.boxSizing = 'border-box';
      modalBox.style.overflowY = 'auto';

      const closeForm = document.createElement('form');
      closeForm.method = 'dialog';

      const closeButton = document.createElement('button');
      closeButton.className = 'btn btn-sm btn-circle btn-ghost absolute right-0.5 top-0.5 z-90';
      closeButton.textContent = '✕';

      closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.close();
      });

      closeForm.appendChild(closeButton);
      modalBox.appendChild(closeForm);
      modal.appendChild(modalBox);
      document.body.appendChild(modal);
    }

    const contentContainer = document.getElementById('modal-content');

    if (!modal || !contentContainer) {
      throw new Error('Modal elements not found.');
    }

    this.modal = modal;
    this.contentContainer = contentContainer;
  }

  public static getInstance(): ModalService {
    if (!ModalService.instance) {
      ModalService.instance = new ModalService();
    }
    return ModalService.instance;
  }

  open(content: ModalContent): void {
    // Remove everything except the close form
    [...this.contentContainer.children].forEach((child) => {
      if (child.tagName !== 'FORM') {
        child.remove();
      }
    });

    let element: HTMLElement | null = null;

    if (typeof content === 'string') {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = content;
      element = wrapper;
    } else if (content instanceof HTMLElement) {
      element = content;
    } else if (content && 'tag' in content) {
      element = document.createElement(content.tag);

      const { props = {}, useProperties = false } = content;

      for (const [key, value] of Object.entries(props)) {
        if (useProperties) {
          // Always assign via property
          (element as any)[key] = value;
        } else {
          // Auto-choose: primitive => attribute, object/array => property
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
    }

    if (!element) {
      throw new Error('Invalid modal content.');
    }

    this.contentContainer.appendChild(element);

    const isOnboarding =
      typeof content === 'object' && 'isOnboarding' in content && !!content.isOnboarding;
    if (isOnboarding) {
      this.modal.show();
    } else {
      this.modal.showModal();
    }
  }

  close(): void {
    this.modal.close();
  }
}

export default ModalService;
