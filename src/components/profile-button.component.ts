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
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
            <div
              class="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary/70 text-white font-bold uppercase"
            >
              ${this.tag?.[0] ?? '?'}
            </div>
          </div>
          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <li>
              <a
                @click="${this.redirectToProfile}"
                class="justify-between text-primary font-semibold"
              >
                Profile
              </a>
            </li>
            <li>
              <a class="text-primary font-semibold" @click="${this.logout}">Logout</a>
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
