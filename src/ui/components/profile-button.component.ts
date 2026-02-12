import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { tailwindStyles } from '@utils/app.constants';
import { Router } from '@vaadin/router';
import { authStore, type AuthState } from '@store/auth-store';
import { watch } from 'zustand-lit';
import type { Notification, UserProfile } from '@models/models';
import '@ui/components/notification-badge.component';

@customElement('profile-button-component')
export class ProfileButtonComponent extends LitElement {
  @watch(authStore) authState!: AuthState;

  @query('.dropdown-content') private dropdownContainer!: HTMLElement;
  @property({ type: Object }) userProfile!: UserProfile;
  @property({ type: Array }) notifications: Notification[] = [];

  static styles = css`
    ${tailwindStyles}
  `;

  private async logout(e: Event) {
    e.stopPropagation();
    this.dropdownContainer?.blur();
    await this.authState.logout();
  }

  private redirectToProfile(e: Event) {
    e.stopPropagation();
    this.dropdownContainer?.blur();
    Router.go('/profile');
  }

  private redirectToNotifications(e: Event) {
    e.stopPropagation();
    this.dropdownContainer?.blur();
    Router.go('/notifications');
  }

  private redirectToAbout(e: Event) {
    e.stopPropagation();
    this.dropdownContainer?.blur();
    Router.go('/about');
  }

  render() {
    return html`
      <div class="flex-none">
        <div class="dropdown dropdown-end">
          <div
            tabindex="0"
            role="button"
            class="btn btn-circle bg-gradient-to-br from-primary to-secondary/70 text-white font-bold uppercase relative"
          >
            ${this.userProfile.tag?.[0] ?? '?'}
            <notification-badge-component
              class="-top-1 -right-1"
              .count=${this.notifications.length}
            >
            </notification-badge-component>
          </div>
          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow"
          >
            <li>
              <a
                @click="${this.redirectToProfile}"
                class="flex items-center px-4 py-2 text-primary font-semibold"
              >
                Profile
              </a>
            </li>
            <li>
              <a
                @click="${this.redirectToNotifications}"
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
                @click="${this.redirectToAbout}"
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
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'profile-button-component': ProfileButtonComponent;
  }
}
