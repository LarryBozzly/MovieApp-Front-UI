type ComponentProps = Record<string, any>;

type ModalContent =
    | string
    | HTMLElement
    | {
        tag: string;
        props?: ComponentProps;
        useProperties?: boolean;
    };

export default class ModalService {
    private modal: HTMLDialogElement;
    private contentContainer: HTMLElement;

    constructor() {
        // Create modal structure dynamically if not present
        let modal = document.getElementById('global-modal') as HTMLDialogElement;

        if (!modal) {
            modal = document.createElement('dialog');
            modal.id = 'global-modal';
            modal.className = 'modal';

            const modalBox = document.createElement('div');
            modalBox.className = 'modal-box';
            modalBox.id = 'modal-content';

            const closeForm = document.createElement('form');
            closeForm.method = 'dialog';

            const closeButton = document.createElement('button');
            closeButton.className =
                'btn btn-sm btn-circle btn-ghost absolute right-2 top-2';
            closeButton.textContent = '✕';

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
        this.modal.showModal();
    }

    close(): void {
        this.modal.close();
    }
}
