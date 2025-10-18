import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';
import { Router } from '@vaadin/router';
import { authStore, selectIsAuthorized, selectTag, type AuthState } from '../store/auth-store';
import { watch, watchWithSelector } from 'zustand-lit';
import { appStore, selectisNavbarVisible, type AppState } from '../store/app-store';

@customElement('navbar-component')
export class NavbarComponent extends LitElement {
  @watch(authStore) authState!: AuthState;
  @watch(appStore) appState!: AppState;
  @watchWithSelector({ store: authStore, selector: selectIsAuthorized }) readonly isAuthorized!: boolean;
  @watchWithSelector({ store: authStore, selector: selectTag }) readonly tag!: string;
  @watchWithSelector({ store: appStore, selector: selectisNavbarVisible }) readonly isNavbarVisible!: boolean;


  static styles = css`
  ${tailwindStyles}
    `;

  private async logout(e: Event) {
    e.stopPropagation();
    await this.authState.logout();
  }

  private async copyTagToClipboard(e: Event) {
    e.stopPropagation();
    await navigator.clipboard.writeText(this.tag);
  }

  private async sendInvitationRequest(e: Event) {
    e.stopPropagation();
    await this.appState.openSendInvitationModal();
  }

  private redirectToProfile() {
    Router.go('/profile');
  }

  private redirectToHome() {
    Router.go('/');
  }

  render() {
    return html`
    <div class="navbar bg-base-100 shadow-sm sticky top-0 left-0 w-full z-50 ${this.isNavbarVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}">
      <div class="flex-1">
        <a @click="${this.redirectToHome}" class="btn btn-ghost text-xl text-primary">Movviator</a>
      </div>
        ${this.isAuthorized ? html`
        <div class="flex-none">
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
              <div class="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary/70 text-white font-bold uppercase">
                  ${this.tag?.[0] ?? '?'}
              </div>
            </div>
            <ul
              tabindex="0"
              class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
              <li>
                <a @click="${this.redirectToProfile}" class="justify-between text-primary font-semibold">
                  Profile
                </a>
              </li>
              <li><a class="text-primary font-semibold" @click="${this.copyTagToClipboard}">Tag: ${this.tag}</a></li>
              <li><a class="text-primary font-semibold" @click="${this.sendInvitationRequest}">Send Invite</a></li>
              <li><a class="text-primary font-semibold" @click="${this.logout}" >Logout</a></li>
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