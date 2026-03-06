import { LitElement, css, html } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { tailwindStyles } from '@utils/app.constants';
import { watch, watchWithSelector } from 'zustand-lit';
import { authStore, selectError, selectIsLoading, type AuthState } from '@store/auth-store';

@customElement('edit-tag-modal-component')
export class EditTagModalComponent extends LitElement {
  @watch(authStore) authState!: AuthState;
  @watchWithSelector({ store: authStore, selector: selectIsLoading }) readonly isLoading!: boolean;
  @watchWithSelector({ store: authStore, selector: selectError }) readonly error!: Error | null;

  @property({ type: String }) tag = '';
  @property() onClose!: () => void;

  static styles = css`
    ${tailwindStyles}
  `;

  @state() private newTag = '';
  @state() private errorMessage = '';

  connectedCallback() {
    super.connectedCallback();
    this.newTag = this.tag;
  }

  private handleInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.newTag = value;

    const alphanumericRegex = /^[a-zA-Z0-9]+$/;

    if (!value.trim()) {
      this.errorMessage = '';
      return;
    }

    if (!alphanumericRegex.test(value)) {
      this.errorMessage = 'Only letters and numbers are allowed';
      return;
    }

    this.errorMessage = '';
  }

  private async handleSubmit(event: Event) {
    event.preventDefault();
    if (!this.isFormValid || this.isLoading) return;

    await authStore.getState().updateTag(this.newTag);

    if (!this.error) this.onClose();
  }

  private get isFormValid(): boolean {
    return this.newTag.trim() !== '' && !this.errorMessage && this.newTag !== this.tag;
  }

  render() {
    return html`
      <form class="p-6 pb-12 sm:pb-6 space-y-4" @submit=${this.handleSubmit}>
        <h2 class="text-2xl font-bold">Edit Tag</h2>

        <p class="text-sm text-base-content/50">
          Update your tag to change how others find and invite you. Only letters and numbers are
          allowed.
        </p>

        <!-- Server error -->
        ${this.error
          ? html`
              <div class="rounded-lg bg-error/10 border border-error/20 px-4 py-2">
                <p class="text-sm text-error">${this.error.message}</p>
              </div>
            `
          : ''}

        <!-- Input -->
        <div class="space-y-1">
          <input
            type="text"
            class="input input-bordered w-full ${this.errorMessage ? 'input-error' : ''}"
            placeholder="Enter new tag"
            .value=${this.newTag}
            @input=${this.handleInput}
            autocomplete="off"
          />

          ${this.errorMessage ? html`<p class="text-xs text-error">${this.errorMessage}</p>` : ''}
        </div>

        <!-- Actions -->
        <div class="pt-2 space-y-2">
          <button
            type="submit"
            class="btn btn-primary w-full"
            ?disabled=${!this.isFormValid || this.isLoading}
          >
            ${this.isLoading
              ? html`
                  <span class="loading loading-dots w-5"></span>
                  Updating...
                `
              : html`Update Tag`}
          </button>

          <button
            type="button"
            class="btn btn-ghost w-full"
            @click=${this.onClose}
            ?disabled=${this.isLoading}
          >
            Cancel
          </button>
        </div>
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'edit-tag-modal-component': EditTagModalComponent;
  }
}
