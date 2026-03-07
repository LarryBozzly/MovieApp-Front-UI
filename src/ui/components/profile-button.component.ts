import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ref, createRef } from 'lit/directives/ref.js';
import { clickOutside } from '../directives/click-outside';
import { tailwindStyles } from '@utils/app.constants';
import { Router } from '@vaadin/router';
import { authStore, type AuthState } from '@store/auth-store';
import { watch } from 'zustand-lit';
import type { Notification, UserProfile } from '@models/models';
import '@ui/components/notification-badge.component';

@customElement('profile-button-component')
export class ProfileButtonComponent extends LitElement {
  @watch(authStore) authState!: AuthState;

  @property({ type: Object }) userProfile!: UserProfile;
  @property({ type: Array }) notifications: Notification[] = [];

  private detailsRef = createRef<HTMLDetailsElement>();

  static styles = css`
    ${tailwindStyles}
    .menu a:active {
      background-color: rgba(0, 0, 0, 0.05) !important;
      color: inherit !important;
    }
    summary::-webkit-details-marker {
      display: none;
    }
  `;

  private closeDropdown = () => {
    const details = this.detailsRef.value;
    if (details) details.open = false;
  };

  private navigate(path: string) {
    this.closeDropdown();
    Router.go(path);
  }

  private async logout() {
    this.closeDropdown();
    await this.authState.logout();
  }

  render() {
    return html`
      <div class="flex-none">
        <details
          class="dropdown dropdown-end"
          ${ref(this.detailsRef)}
          ${clickOutside(() => this.closeDropdown())}
        >
          <summary
            class="btn btn-circle bg-gradient-to-br from-primary to-secondary/70 text-white font-bold uppercase relative"
          >
            ${this.userProfile.tag?.[0] ?? '?'}
            <notification-badge-component
              class="-top-1 -right-1"
              .count=${this.notifications.length}
            >
            </notification-badge-component>
          </summary>

          <ul
            class="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow"
          >
            <li>
              <a
                @click="${() => this.navigate('/profile')}"
                class="flex items-center px-4 py-2 text-primary font-semibold"
              >
                Profile
              </a>
            </li>
            <li>
              <a
                @click="${() => this.navigate('/notifications')}"
                class="flex items-center justify-between px-4 py-2 text-primary font-semibold"
              >
                <span>Notifications</span>
                ${this.notifications.length > 0
                  ? html`<span class="w-2 h-2 bg-secondary rounded-full"></span>`
                  : null}
              </a>
            </li>
            <li>
              <a
                @click="${() => this.navigate('/about')}"
                class="flex items-center justify-between px-4 py-2 text-primary font-semibold"
              >
                <span>About</span>
              </a>
            </li>
            <hr class="my-2 border border-base-content/10" />
            <li>
              <button
                @click="${this.logout}"
                class="flex w-full items-center px-4 py-2 text-error font-semibold text-left"
              >
                Logout
              </button>
            </li>
          </ul>
        </details>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'profile-button-component': ProfileButtonComponent;
  }
}
