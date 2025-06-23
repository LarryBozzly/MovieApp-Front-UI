import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';
import { appEffects } from '../effects/app.effects';
import { Router } from '@vaadin/router';
import { connect } from 'zustand-lit';
import { authStore } from '../store/auth-store';

@customElement('navbar-component')
export class NavbarComponent extends connect(LitElement, authStore) {
  static styles = css`
  ${tailwindStyles}
    `;

  private async logout(e: Event) {
    e.stopPropagation();
    await appEffects.logout();
  }

  private redirectToProfile() {
    Router.go('/profile');
  }

  render() {
    return html`
    <div class="navbar bg-base-100 shadow-sm sticky top-0 z-50">
      <div class="flex-1">
        <a class="btn btn-ghost text-xl">MovieApp</a>
      </div>
        ${this.$state.isAuthorized ? html`
        <div class="flex-none">
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
              <div class="w-10 rounded-full">
                <img
                  alt="Tailwind CSS Navbar component"
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
              </div>
            </div>
            <ul
              tabindex="0"
              class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
              <li>
                <a @click="${this.redirectToProfile}" class="justify-between">
                  Profile
                </a>
              </li>
              <li><a>Settings</a></li>
              <li><a @click="${this.logout}" >Logout</a></li>
            </ul>
          </div>
        </div>
      ` : ''}
    </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'navbar-component': NavbarComponent;
  }
}