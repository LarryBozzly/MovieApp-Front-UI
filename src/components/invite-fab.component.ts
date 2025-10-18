import { LitElement, html, css } from 'lit';
import { tailwindStyles } from '../utils/app.constants';
import { customElement } from 'lit/decorators.js';
import {
  OutlinePaperPlaneIcon,
  FilledCopyIcon
} from './icons/icons';
import { watch, watchWithSelector } from 'zustand-lit';
import { appStore, type AppState } from '../store/app-store';
import { authStore, selectTag, type AuthState } from '../store/auth-store';

@customElement('invite-fab')
export class InviteFab extends LitElement {
  @watch(appStore) appState!: AppState;
  @watch(authStore) authState!: AuthState;
  @watchWithSelector({ store: authStore, selector: selectTag }) readonly tag!: string;

  static styles = css`
    ${tailwindStyles}
    :host {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 50;
    }
  `;

  private async copyTagToClipboard(e: Event) {
    e.stopPropagation();
    await navigator.clipboard.writeText(this.tag);
    this.closeFab();
  }

  private async sendInvitationRequest(e: Event) {
    e.stopPropagation();
    await this.appState.openSendInvitationModal();
    this.closeFab();
  }

  private closeFab() {
    const fabToggle = this.renderRoot.querySelector<HTMLInputElement>('#fab-toggle');
    if (fabToggle) fabToggle.checked = false;
  }


  render() {
    const iconClass = 'size-5';
    return html`
      <div class="relative">
        <input type="checkbox" id="fab-toggle" class="peer hidden" />

        <div class="absolute bottom-16 right-0 hidden flex-col items-end space-y-2 peer-checked:flex">
          
          <button class="btn btn-circle btn-lg tooltip tooltip-left" @click="${this.sendInvitationRequest}" data-tip="Send Invite">
            ${OutlinePaperPlaneIcon(iconClass)}
          </button>

          <button class="btn btn-circle btn-lg tooltip tooltip-left" @click="${this.copyTagToClipboard}" data-tip="Copy Tag">
            ${FilledCopyIcon(iconClass)}
          </button>
        </div>

        <label for="fab-toggle" class="btn btn-circle btn-lg btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="${iconClass}" fill="currentColor" viewBox="0 0 16 16">
            <path
              d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z"
            />
          </svg>
        </label>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'invite-fab': InviteFab;
  }
}