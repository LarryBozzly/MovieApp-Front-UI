import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';
import { watch } from 'zustand-lit';
import { authStore, type AuthState } from '../store/auth-store';

@customElement('invitation-notification-modal-component')
export class InvitationNotificationModalComponent extends LitElement {
  @watch(authStore) authState!: AuthState;

  static styles = css`
    ${tailwindStyles}
  `;

  @property({ type: String }) tag: string = '';

  private async acceptInvitation() {
    const fromUserId = this.authState.tag;
    if (!fromUserId || !this.tag) return;

    await this.authState.sendInvitationResponse(this.tag, fromUserId.toString());
  }

  render() {
    return html`
      <div class="p-6 space-y-4">
        <h2 class="text-2xl font-bold">Incoming Invitation</h2>
        <p class="text-sm text-gray-500">
          You have received a movie match invitation from <span class="font-semibold">${this.tag}</span>.
        </p>

        <div class="pt-4">
          <button
            class="btn btn-primary w-full"
            @click=${this.acceptInvitation}
          >
            Accept
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'invitation-notification-modal-component': InvitationNotificationModalComponent;
  }
}
