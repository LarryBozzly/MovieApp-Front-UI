import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { tailwindStyles } from '../../utils/app.constants';
import {
  authStore,
  selectIsAuthorized,
  selectUserProfile,
  type AuthState,
} from '@store/auth-store';
import { watch, watchWithSelector } from 'zustand-lit';
import {
  appStore,
  selectisNavbarVisible,
  selectNotifications,
  type AppState,
} from '@store/app-store';
import '@ui/components/logo-back.component';
import '@ui/components/profile-button.component';
import type { Notification, UserProfile } from '@models/models';

@customElement('navbar-component')
export class NavbarComponent extends LitElement {
  @watch(authStore) authState!: AuthState;
  @watch(appStore) appState!: AppState;
  @watchWithSelector({ store: authStore, selector: selectIsAuthorized })
  readonly isAuthorized!: boolean;
  @watchWithSelector({ store: authStore, selector: selectUserProfile })
  readonly userProfile!: UserProfile;
  @watchWithSelector({ store: appStore, selector: selectisNavbarVisible })
  readonly isNavbarVisible!: boolean;
  @watchWithSelector({ store: appStore, selector: selectNotifications })
  readonly notifications!: Notification[];

  @state() private path = window.location.pathname;

  static styles = css`
    ${tailwindStyles}
  `;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('popstate', this.handleRouteChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('popstate', this.handleRouteChange);
  }

  private handleRouteChange = () => {
    this.path = window.location.pathname;
  };

  private get isHomePage() {
    return this.path === '/home' || this.path === '/home/';
  }

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
          ? html`
              <profile-button-component
                .notifications=${this.notifications}
                .userProfile=${this.userProfile}
              ></profile-button-component>
            `
          : this.isHomePage
            ? html`
                <div
                  class="flex items-baseline bg-base-200/50 rounded-full p-1 mr-2 sm:mr-4 border border-base-content/5"
                >
                  <a
                    href="/login"
                    class="btn btn-primary btn-xs sm:btn-sm rounded-full px-3 sm:px-5 no-underline shadow-sm"
                  >
                    <span
                      class="text-[10px] sm:text-xs uppercase tracking-tight sm:tracking-widest font-bold"
                    >
                      Login
                    </span>
                  </a>

                  <a
                    href="/signup"
                    class="px-2 sm:px-4 no-underline hover:text-primary transition-colors"
                  >
                    <span
                      class="text-[10px] sm:text-xs uppercase tracking-tight sm:tracking-widest font-bold opacity-70"
                    >
                      Sign Up
                    </span>
                  </a>
                </div>
              `
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
