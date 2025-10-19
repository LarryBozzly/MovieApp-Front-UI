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

  // scroll state + queue
  private isScrolling = false;
  private scrollTimer: number | null = null;
  private requestedOpen = false;

  static styles = css`
    ${tailwindStyles}
    :host {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
    }

    .fab-menu {
      transition: opacity 150ms ease-out, visibility 150ms ease-out;
      pointer-events: auto;
    }

    .fab-menu.closed {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .fab-menu.open {
      opacity: 1;
      visibility: visible;
    }

    /* disabled appearance while scroll active (optional) */
    .fab-disabled {
      opacity: 0.85;
      /* pointer-events still allowed, but we ignore taps while scrolling by queuing */
    }
  `;

  // ---------- scroll detection ----------
  private onScroll = () => {
    // mark scrolling true and debounce to detect end-of-scroll
    this.isScrolling = true;
    if (this.scrollTimer) window.clearTimeout(this.scrollTimer);
    // debounce window.scroll to detect end of momentum. 160ms is a good starting point.
    this.scrollTimer = window.setTimeout(() => {
      this.isScrolling = false;
      this.scrollTimer = null;
      // if a tap requested open during scroll, open now
      if (this.requestedOpen) {
        this.requestedOpen = false;
        this.openFabImmediate();
      }
    }, 160);
  };

  // ---------- open/close logic ----------
  private openFabImmediate() {
    this.isOpen = true;
  }

  private closeFabImmediate() {
    this.isOpen = false;
  }

  // pointerdown to detect taps right away (works for mouse & touch)
  private onFabPointerDown = (_e: PointerEvent) => {
    // We do NOT call preventDefault here (that would block scrolling)
    // We rely on the scroll detection to decide:
    if (this.isScrolling) {
      // queue the open, but do not open now (so we don't cancel momentum)
      this.requestedOpen = true;
      // optionally give visual feedback (brief scale) without stopping scroll
      // but keep pointer events allowed (we ignore immediate opens)
    } else {
      // no scroll in progress, open now
      this.openFabImmediate();
    }
  };

  private handleOutsideClick = (event: PointerEvent) => {
    const path = event.composedPath();
    if (this.isOpen && !path.includes(this)) {
      this.closeFabImmediate();
    }
  };

  private async copyTagToClipboard(e: Event) {
    e.stopPropagation();
    await navigator.clipboard.writeText(this.tag);
    this.closeFabImmediate();
  }

  private async sendInvitationRequest(e: Event) {
    e.stopPropagation();
    await this.appState.openSendInvitationModal();
    this.closeFabImmediate();
  }

  connectedCallback() {
    super.connectedCallback();
    // scroll detection must be passive
    window.addEventListener('scroll', this.onScroll, { passive: true });
    document.addEventListener('pointerdown', this.handleOutsideClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('scroll', this.onScroll);
    document.removeEventListener('pointerdown', this.handleOutsideClick);
    if (this.scrollTimer) window.clearTimeout(this.scrollTimer);
  }

  render() {
    const iconClass = 'size-5';
    const menuClass = this.isOpen ? 'fab-menu open flex' : 'fab-menu closed flex';
    const btnClass = `btn btn-circle btn-lg btn-primary ${this.isScrolling ? 'fab-disabled' : ''}`;

    return html`
      <div class="relative" >
        <div class="absolute bottom-16 right-0 flex-col items-end space-y-2 ${menuClass}">
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

        <!-- pointerdown is used so we can decide immediately whether to queue or open -->
        <button class="${btnClass}"
                @pointerdown="${this.onFabPointerDown}">
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
