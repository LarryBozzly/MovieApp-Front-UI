type ComponentProps = Record<string, any>;

type ModalContent = {
  tag: string;
  modalMode: 'modal' | 'nonModal';
  className?: string;
  props?: ComponentProps;
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

    /* important events to listen to and reset modal state */
    this.modal.addEventListener('close', () => this.reset());
    this.modal.addEventListener('cancel', () => this.reset());
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

    const element = document.createElement(content.tag);
    const { props = {}, modalMode, className = '' } = content;

    this.modal.className = `modal ${className}`.trim();

    const modalBox = this.contentContainer;
    modalBox.style.paddingBottom = this.modal.classList.contains('modal-drawer')
      ? ''
      : 'env(safe-area-inset-bottom)';

    for (const [key, value] of Object.entries(props)) {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        element.setAttribute(key, String(value));
      } else {
        (element as any)[key] = value;
      }
    }

    if (!element) {
      throw new Error('Invalid modal content.');
    }

    this.contentContainer.appendChild(element);
    modalMode === 'modal' ? this.modal.showModal() : this.modal.show();
  }

  close(): void {
    this.modal.close();
  }

  private reset() {
    this.modal.className = 'modal';

    // Keep only the close form, remove all other children
    const closeForm = this.contentContainer.querySelector('form');
    if (closeForm) {
      this.contentContainer.replaceChildren(closeForm);
    } else {
      // Fallback: no form present (shouldn't happen)
      this.contentContainer.replaceChildren();
    }

    Object.assign(this.contentContainer.style, {
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      paddingLeft: 'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)',
      boxSizing: 'border-box',
      overflowY: 'auto',
    });
  }
}

export default ModalService;
