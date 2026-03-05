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
  private content: HTMLElement;

  private constructor() {
    this.modal = this.createModal();
    this.content = this.modal.querySelector('#modal-content') as HTMLElement;
  }

  static getInstance(): ModalService {
    if (!this.instance) {
      this.instance = new ModalService();
    }
    return this.instance;
  }

  open({ tag, props = {}, modalMode = 'modal', className = '' }: ModalContent) {
    const show = () => {
      this.reset();

      const element = document.createElement(tag);
      Object.assign(element, props);

      this.modal.className = `modal ${className}`.trim();
      this.content.appendChild(element);

      modalMode === 'modal' ? this.modal.showModal() : this.modal.show();
    };

    if (this.modal.open) {
      this.modal.addEventListener('close', show, { once: true });
      this.modal.close();
    } else {
      show();
    }
  }

  close() {
    if (this.modal.open) {
      this.modal.close();
    }
  }

  private reset() {
    this.modal.className = 'modal';

    const form = this.content.querySelector('form');
    if (form) {
      this.content.replaceChildren(form);
    } else {
      // fallback (should never happen)
      this.content.replaceChildren();
    }
  }

  private createModal(): HTMLDialogElement {
    const existing = document.getElementById('global-modal') as HTMLDialogElement | null;
    if (existing) return existing;

    const dialog = document.createElement('dialog');
    dialog.id = 'global-modal';
    dialog.className = 'modal';

    // Ensure cleanup on any type of close
    dialog.addEventListener('close', () => this.reset());
    dialog.addEventListener('cancel', () => this.reset());

    const box = document.createElement('div');
    box.className = 'modal-box';
    box.id = 'modal-content';

    this.applySafeArea(box);

    const form = document.createElement('form');
    form.method = 'dialog';

    const close = document.createElement('button');
    close.className = 'btn btn-sm btn-circle btn-ghost absolute right-0.5 top-0.5 z-90';
    close.textContent = '✕';

    close.addEventListener('click', (e) => {
      e.preventDefault();
      this.close();
    });

    form.appendChild(close);
    box.appendChild(form);
    dialog.appendChild(box);

    document.body.appendChild(dialog);

    return dialog;
  }

  private applySafeArea(el: HTMLElement) {
    Object.assign(el.style, {
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
