import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { tailwindStyles } from '@utils/app.constants';
import { updateSW } from '@utils/update-sw';

@customElement('version-update-modal-component')
export class VersionUpdateModalComponent extends LitElement {
  @property() onClose!: () => void;
  @property({ type: String }) version!: string;
  @state() private isReloading = false;

  static styles = css`
    ${tailwindStyles}
  `;

  private async handleUpdate() {
    this.isReloading = true;
    await updateSW();

    localStorage.setItem('app-version', this.version);

    window.location.reload();
  }

  render() {
    return html`
      <div class="p-6 space-y-4">
        <h2 class="text-2xl font-bold">New Version Available</h2>

        <p class="text-sm text-base-content/70">
          A new version of the app is available. Please update to get the latest features and
          improvements.
        </p>

        <!-- Actions -->
        <div class="pt-2 space-y-2">
          <button
            type="button"
            class="btn btn-primary w-full"
            @click=${this.handleUpdate}
            ?disabled=${this.isReloading}
          >
            ${this.isReloading
              ? html`
                  <span class="loading loading-dots w-5"></span>
                  Updating...
                `
              : html`Update Now`}
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'version-update-modal-component': VersionUpdateModalComponent;
  }
}
