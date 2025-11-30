import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';
import { Router } from '@vaadin/router';
import { authStore, type AuthState } from '../store/auth-store';
import { watch } from 'zustand-lit';

@customElement('profile-button-component')
export class ProfileButtonComponent extends LitElement {
  @watch(authStore) authState!: AuthState;

  @query('.dropdown-content') private dropdownContainer!: HTMLElement;
  @property() tag: string = '?';

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

  render() {
    return html`
      <div class="flex-none">
        <div class="dropdown dropdown-end">
          <div
            tabindex="0"
            role="button"
            class="btn w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary/70 text-white font-bold uppercase"
          >
            ${this.tag?.[0] ?? '?'}
          </div>
          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 custom-shadow"
          >
            <li>
              <a
                @click="${this.redirectToProfile}"
                class="flex items-center px-4 py-2 text-primary font-semibold transition "
              >
                Profile
              </a>
            </li>
            <li>
              <a
                href="/notifications"
                class="flex items-center px-4 py-2 text-primary font-semibold transition"
              >
                Notifications
              </a>
            </li>
            <hr class="my-2 border border-base-content/10" />
            <li>
              <button
                @click="${this.logout}"
                class="flex w-full items-center px-4 py-2 text-error font-semibold transition text-left"
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
