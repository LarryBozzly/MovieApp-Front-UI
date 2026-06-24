import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { tailwindStyles } from '@utils/app.constants';
import { watchWithSelector } from 'zustand-lit';
import { appStore, selectIsLoading } from '@store/app-store';

@customElement('confirm-action-modal')
export class ConfirmActionModalComponent extends LitElement {
  @watchWithSelector({ store: appStore, selector: selectIsLoading }) readonly isLoading!: boolean;

  @property({ type: String }) title = '';
  @property({ type: String }) description = '';
  @property({ type: String }) confirmLabel = 'Confirm';
  @property({ type: String }) cancelLabel = 'Cancel';
  @property({ type: Boolean }) danger = false;

  @property() onConfirm!: () => void;
  @property() onClose!: () => void;

  static styles = css`
    ${tailwindStyles}
  `;

  render() {
    return html`
      <div class="p-6 pb-12 sm:pb-6 space-y-4">
        <h2 class="text-2xl font-bold">${this.title}</h2>

        <p class="text-base text-base-content/80">${this.description}</p>

        <div class="pt-2 space-y-2">
          <button
            type="button"
            class="btn w-full ${this.danger ? 'btn-error' : 'btn-primary'}"
            ?disabled=${this.isLoading}
            @click=${() => this.onConfirm?.()}
          >
            ${this.isLoading
              ? html`
                  <span class="loading loading-dots w-5"></span>
                  Processing...
                `
              : html`${this.confirmLabel}`}
          </button>

          <button
            type="button"
            class="btn btn-ghost w-full"
            ?disabled=${this.isLoading}
            @click=${() => this.onClose?.()}
          >
            ${this.cancelLabel}
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'confirm-action-modal': ConfirmActionModalComponent;
  }
}
