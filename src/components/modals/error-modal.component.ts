import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { tailwindStyles } from '../../utils/app.constants';

@customElement('error-modal')
export class ErrorModal extends LitElement {
  static styles = css`
    ${tailwindStyles}
  `;

  @property({ type: String }) message: string = 'An unexpected error occurred.';
  @property() onClose!: () => void;

  render() {
    return html`
      <div class="p-6 space-y-4 text-error-content">
        <!-- Warning header -->
        <div class="flex items-center gap-3">
          <span class="text-error text-3xl">⚠️</span>
          <h2 class="text-2xl font-bold">Something went wrong</h2>
        </div>

        <!-- Error message -->
        <p class="text-base text-base-content/80 whitespace-pre-line">${this.message}</p>

        <!-- Button -->
        <button @click=${() => this.onClose?.()} class="btn btn-error w-full mt-2">Close</button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'error-modal': ErrorModal;
  }
}
