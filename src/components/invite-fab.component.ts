import { LitElement, html, css } from 'lit';
import { tailwindStyles } from '../utils/app.constants';
import { customElement, state } from 'lit/decorators.js';
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

  @state() private isOpen = false;

  private lastScrollTop = 0;
  private scrollCheckRaf: number | null = null;

  static styles = css`
    ${tailwindStyles}
    :host {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 50;
    }
  `;

  private toggleFab = async (event: Event) => {
    event.stopPropagation();

    // Wait for scroll to end if any
    await this.waitForScrollToStop();

    // Now toggle the FAB
    this.isOpen = !this.isOpen;
  };

  private waitForScrollToStop(timeout = 150): Promise<void> {
    return new Promise((resolve) => {
      let lastScrollTop = window.scrollY || window.pageYOffset;
      let stableFrames = 0;

      const checkScroll = () => {
        const currentScrollTop = window.scrollY || window.pageYOffset;

        if (currentScrollTop === lastScrollTop) {
          stableFrames += 1;
        } else {
          stableFrames = 0;
        }

        lastScrollTop = currentScrollTop;

        // Wait until scroll is stable for ~3 frames (~50ms) or timeout reached
        if (stableFrames >= 3) {
          resolve();
        } else {
          requestAnimationFrame(checkScroll);
        }
      };

      requestAnimationFrame(checkScroll);

      // Safety timeout in case scroll keeps drifting forever
      setTimeout(resolve, timeout);
    });
  }

  private handleOutsideClick = (event: PointerEvent) => {
    const path = event.composedPath();
    if (this.isOpen && !path.includes(this)) {
      this.isOpen = false;
    }
  };

  private async copyTagToClipboard(e: Event) {
    e.stopPropagation();
    await navigator.clipboard.writeText(this.tag);
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
    if (this.scrollCheckRaf) cancelAnimationFrame(this.scrollCheckRaf);
  }

  render() {
    const iconClass = 'size-5';
    return html`
      <div class="relative">

        <div class="absolute bottom-16 right-0 flex-col items-end space-y-2 ${this.isOpen ? 'flex' : 'hidden'}">
          <button class="btn btn-circle btn-lg tooltip tooltip-left"
                  @click="${this.sendInvitationRequest}" 
                  data-tip="Send Invite">
            ${OutlinePaperPlaneIcon(iconClass)}
          </button>

          <button class="btn btn-circle btn-lg tooltip tooltip-left"
                  @click="${this.copyTagToClipboard}" 
                  data-tip="Copy Tag">
            ${FilledCopyIcon(iconClass)}
          </button>
        </div>

        <button class="btn btn-circle btn-lg btn-primary" @pointerup="${this.toggleFab}">
          <svg xmlns="http://www.w3.org/2000/svg" class="${iconClass}" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z"/>
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
