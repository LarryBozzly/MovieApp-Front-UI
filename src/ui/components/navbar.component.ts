import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { tailwindStyles } from '../../utils/app.constants';
import {
  authStore,
  selectIsAuthorized,
  selectIsLoading,
  selectUserProfile,
  type AuthState,
} from '@store/auth-store';
import { watch, watchWithSelector } from 'zustand-lit';
import {
  appStore,
  selectIsMenuOpen,
  selectisNavbarVisible,
  selectNavigation,
  selectNotifications,
  type AppState,
} from '@store/app-store';
import '@ui/components/logo-back.component';
import '@ui/components/profile-button.component';
import '@ui/components/burger-menu.component';
import type { Notification, UserProfile } from '@models/models';
import { type NavigationState } from '@services/navigation-service';

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
  @watchWithSelector({ store: authStore, selector: selectIsLoading })
  readonly isLoading!: boolean;
  @watchWithSelector({ store: appStore, selector: selectIsMenuOpen })
  readonly isMenuOpen!: boolean;
  @watchWithSelector({ store: appStore, selector: selectNavigation })
  readonly navigation!: NavigationState;

  static styles = css`
    ${tailwindStyles}
  `;

  private onMenuChange(e: CustomEvent<{ isMenuOpen: boolean }>) {
    const isMenuOpen = e.detail.isMenuOpen;
    appStore.getState().setIsMenuOpen(isMenuOpen);
  }

  render() {
    return html`
      <div
        class="navbar bg-base-100 shadow-sm fixed top-0 left-0 w-full z-50 ${this.isNavbarVisible
          ? ''
          : 'hidden'}"
      >
        <div class="flex-1">
          <logo-back-component
            .isHome=${this.navigation.isHome}
            .isPublicPage=${this.navigation.isPublicPage}
            .isPrivatePage=${this.navigation.isPrivatePage}
            .isAuthorized=${this.isAuthorized}
          >
          </logo-back-component>
        </div>
        ${this.isAuthorized && this.isNavbarVisible
          ? html`
              <profile-button-component
                .notifications=${this.notifications}
                .userProfile=${this.userProfile}
              ></profile-button-component>
            `
          : this.navigation.isPublicPage
            ? html`
                <burger-menu-component
                  .isMenuOpen=${this.isMenuOpen}
                  @onHandleToggle=${this.onMenuChange}
                  @onHandleClose=${this.onMenuChange}
                ></burger-menu-component>
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
