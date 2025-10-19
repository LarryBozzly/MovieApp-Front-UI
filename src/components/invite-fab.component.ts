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

  private rafId: number | null = null;
  private touchActive = false;
  private momentumLock = false;

  static styles = css`
    ${tailwindStyles}
    :host {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 50;
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
    .locked {
      pointer-events: none !important;
      opacity: 0.7;
    }
  `;

  /**
   * Hacky, robust scroll stabilization
   */
  private waitForScrollStop(timeout = 1000): Promise<void> {
    return new Promise((resolve) => {
      let lastScrollY = window.scrollY;
      let stableFrames = 0;
      const requiredStableFrames = 5;
      let lastVelocity = 0;

      const check = () => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY;
        const velocity = Math.abs(delta);

        // If velocity is low and touch not active, increment stable frames
        if (velocity < 0.5 && lastVelocity < 0.5 && !this.touchActive) {
          stableFrames++;
        } else {
          stableFrames = 0;
        }

        lastVelocity = velocity;
        lastScrollY = currentY;

        if (stableFrames >= requiredStableFrames && !this.touchActive) {
          this.momentumLock = false;
          this.classList.remove('locked');
          resolve();
        } else {
          this.rafId = requestAnimationFrame(check);
        }
      };

      this.momentumLock = true;
      this.classList.add('locked');
      this.rafId = requestAnimationFrame(check);

      // Safety timeout
      setTimeout(() => {
        this.momentumLock = false;
        this.classList.remove('locked');
        resolve();
      }, timeout);
    });
  }

  private toggleFab = async (event: Event) => {
    event.stopPropagation();

    // If locked (momentum scrolling), ignore clicks
    if (this.momentumLock) return;

    // Wait for scroll/momentum to fully stop
    await this.waitForScrollStop();

    // Toggle FAB
    this.isOpen = !this.isOpen;
  };

  private handleOutsideClick = (event: PointerEvent) => {
    const path = event.composedPath();
    if (this.isOpen && !path.includes(this)) this.isOpen = false;
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

    // Track touch state
    window.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchend', this.onTouchEnd, { passive: true });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('pointerdown', this.handleOutsideClick);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchend', this.onTouchEnd);

    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  private onTouchStart = () => { this.touchActive = true; };
  private onTouchEnd = () => {
    this.touchActive = false;
    // Add slight delay to let inertia settle
    setTimeout(() => {
      if (!this.touchActive) this.classList.remove('locked');
    }, 120);
  };

  render() {
    const iconClass = 'size-5';
    const menuClass = this.isOpen ? 'fab-menu open flex' : 'fab-menu closed flex';

    return html`
      <div class="relative">
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

        <button class="btn btn-circle btn-lg btn-primary"
                @pointerup="${this.toggleFab}">
          <svg xmlns="http://www.w3.org/2000/svg"
               class="${iconClass}"
               fill="currentColor"
               viewBox="0 0 16 16">
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
