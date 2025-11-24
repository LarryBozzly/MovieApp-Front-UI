import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';
import { watch } from 'zustand-lit';
import { authStore, type AuthState } from '../store/auth-store';

@customElement('send-invite-modal-component')
export class SendInviteModalComponent extends LitElement {
  @watch(authStore) authState!: AuthState;

  static styles = css`
    ${tailwindStyles}
  `;

  @state() private tag: string = '';

  private handleInput(e: Event) {
    this.tag = (e.target as HTMLInputElement).value;
  }

  private async sendInvite(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.tag.trim()) return;
    await this.authState.sendInvitationRequest(this.tag);
  }

  render() {
    return html`
      <div class="p-6 space-y-4">
        <h2 class="text-2xl font-bold">Send Invitation</h2>
        <p class="text-sm text-gray-500">Enter the user tag to send a movie match invitation.</p>

        <form @submit=${this.sendInvite}>
          <div class="form-control">
            <input
              type="text"
              class="input input-bordered w-full"
              placeholder="User Tag"
              .value=${this.tag}
              @input=${this.handleInput}
            />
          </div>

          <div class="pt-2">
            <button type="submit" class="btn btn-primary w-full" ?disabled=${!this.tag.trim()}>
              Send Invite
            </button>
          </div>
        </form>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'send-invite-modal-component': SendInviteModalComponent;
  }
}
