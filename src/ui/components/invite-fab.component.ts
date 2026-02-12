import { LitElement, html, css } from 'lit';
import { tailwindStyles } from '../../utils/app.constants';
import { customElement, state } from 'lit/decorators.js';
import {
  OutlinePaperPlaneIcon,
  FilledCopyIcon,
  OutlineChevronUpIcon,
  TagIcon,
} from '@ui/icons';
import { watch, watchWithSelector } from 'zustand-lit';
import { appStore, type AppState } from '../../store/app-store';
import { authStore, selectUserProfile, type AuthState } from '../../store/auth-store';
import type { UserProfile } from '../../models/models';

@customElement('invite-fab')
export class InviteFab extends LitElement {
  @watch(appStore) appState!: AppState;
  @watch(authStore) authState!: AuthState;
  @watchWithSelector({ store: authStore, selector: selectUserProfile })
  readonly userProfile!: UserProfile;

  @state() private isOpen = false;

  static styles = css`
    ${tailwindStyles}
    :host {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 50;
      touch-action: manipulation; /* ensures taps register immediately */
    }
  `;

  private toggleFab = (event: Event) => {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  };

  private handleOutsideClick = (event: PointerEvent) => {
    event.stopPropagation();
    const path = event.composedPath();
    if (this.isOpen && !path.includes(this)) {
      this.isOpen = false;
    }
  };

  private async copyTagToClipboard(e: Event) {
    e.stopPropagation();
    await navigator.clipboard.writeText(this.userProfile.tag);
    this.isOpen = false;
  }

  private scrollToTopSmooth(): void {
    const main = this.parentNode?.firstElementChild;
    main?.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
    this.isOpen = false;
  }

  private async sendInvitationRequest(e: Event) {
    e.stopPropagation();
    await this.appState.openSendInvitationModal();
    this.isOpen = false;
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('pointerdown', this.handleOutsideClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('pointerdown', this.handleOutsideClick);
  }

  render() {
    const iconClass = 'size-5';
    const tagClass = 'size-5 text-primary';
    return html`
      <div class="relative">
        <!-- FAB menu -->
        ${this.isOpen
          ? html`
              <div
                class="absolute bottom-16 right-0 flex flex-col items-end space-y-2 pointer-events-none"
              >
                <button
                  class="btn btn-circle btn-lg pointer-events-auto"
                  @click="${this.sendInvitationRequest}"
                >
                  ${OutlinePaperPlaneIcon(iconClass)}
                </button>

                <!-- Tag + Copy -->
                <div class="flex items-center gap-2 self-start pointer-events-none">
                  <div
                    class="flex items-center gap-2 bg-base-200 px-3 py-1 rounded-full border border-base-300 pointer-events-none"
                  >
                    ${TagIcon(tagClass)}
                    <span>${this.userProfile.tag}</span>
                  </div>

                  <button
                    class="btn btn-circle btn-lg pointer-events-auto"
                    @click="${this.copyTagToClipboard}"
                  >
                    ${FilledCopyIcon(iconClass)}
                  </button>
                </div>
                <button
                  class="btn btn-circle btn-lg pointer-events-auto"
                  @click="${this.scrollToTopSmooth}"
                >
                  ${OutlineChevronUpIcon(iconClass)}
                </button>
              </div>
            `
          : null}
        <!-- FAB button -->
        <button class="btn btn-circle btn-lg btn-primary" @pointerup="${this.toggleFab}">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="${iconClass}"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z"
            />
          </svg>
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'invite-fab': InviteFab;
  }
}
