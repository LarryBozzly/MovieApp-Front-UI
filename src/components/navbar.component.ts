import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';
import { authStore, selectIsAuthorized, selectTag, type AuthState } from '../store/auth-store';
import { watch, watchWithSelector } from 'zustand-lit';
import { appStore, selectisNavbarVisible, type AppState } from '../store/app-store';
import '../components/logo-back.component';
import '../components/profile-button.component';

@customElement('navbar-component')
export class NavbarComponent extends LitElement {
  @watch(authStore) authState!: AuthState;
  @watch(appStore) appState!: AppState;
  @watchWithSelector({ store: authStore, selector: selectIsAuthorized })
  readonly isAuthorized!: boolean;
  @watchWithSelector({ store: authStore, selector: selectTag }) readonly tag!: string;
  @watchWithSelector({ store: appStore, selector: selectisNavbarVisible })
  readonly isNavbarVisible!: boolean;

  static styles = css`
    ${tailwindStyles}
  `;

  render() {
    return html`
      <div
        class="navbar bg-base-100 shadow-sm fixed top-0 left-0 w-full z-50 ${this.isNavbarVisible
          ? ''
          : 'hidden'}"
      >
        <div class="flex-1">
          <logo-back-component .isAuthorized=${this.isAuthorized}></logo-back-component>
        </div>
        ${this.isAuthorized
          ? html` <profile-button-component .tag=${this.tag}></profile-button-component> `
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'navbar-component': NavbarComponent;
  }
}
