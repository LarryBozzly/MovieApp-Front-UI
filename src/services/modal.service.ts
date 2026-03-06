type ComponentProps = Record<string, any>;

type ModalContent = {
  tag: string;
  modalMode: 'modal' | 'nonModal';
  className?: string;
  props?: ComponentProps;
};

class ModalService {
  private static instance: ModalService;
  private modal: HTMLDialogElement; // current active modal

  private constructor() {
    this.modal = this.createModal();
    document.body.appendChild(this.modal);
  }

  public static getInstance(): ModalService {
    if (!ModalService.instance) {
      ModalService.instance = new ModalService();
    }
    return ModalService.instance;
  }

  private createModal(): HTMLDialogElement {
    const modal = document.createElement('dialog');
    modal.id = 'global-modal';
    modal.className = 'modal';

    const modalBox = document.createElement('div');
    modalBox.className = 'modal-box';
    modalBox.id = 'modal-content';

    // Safe-area and scrolling
    Object.assign(modalBox.style, {
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      paddingLeft: 'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)',
      boxSizing: 'border-box',
      overflowY: 'auto',
    });

    // Close button
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

    return modal;
  }

  open(content: ModalContent): void {
    const { props = {}, modalMode, className = '' } = content;

    // Clone the base modal to isolate animations
    const newModal = this.modal.cloneNode(true) as HTMLDialogElement;
    newModal.className = `modal ${className}`.trim();

    const newContentContainer = newModal.querySelector('#modal-content')!;

    // Remove all children except the close form
    [...newContentContainer.children].forEach((child) => {
      if (child.tagName !== 'FORM') child.remove();
    });

    // Create the content element
    const element = document.createElement(content.tag);
    for (const [key, value] of Object.entries(props)) {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        element.setAttribute(key, String(value));
      } else {
        (element as any)[key] = value;
      }
    }
    newContentContainer.appendChild(element);

    // Append new modal to body and show
    document.body.appendChild(newModal);
    modalMode === 'modal' ? newModal.showModal() : newModal.show();

    // Replace old modal reference
    const oldModal = this.modal;
    this.modal = newModal;

    if (oldModal.parentElement) {
      oldModal.remove();
    }
  }

  close(): void {
    this.modal.close();
  }
}

export default ModalService;
