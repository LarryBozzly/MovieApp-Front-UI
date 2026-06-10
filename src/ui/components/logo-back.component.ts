import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { tailwindStyles } from '@utils/app.constants';
import { Router } from '@vaadin/router';
import { OutlineChevronLeftIcon } from '@ui/icons';
import { ghostTap } from '@ui/directives/ghost-tap.directive';
import { appStore } from '@store/app-store';

@customElement('logo-back-component')
export class LogoBackComponent extends LitElement {
  static styles = css`
    ${tailwindStyles}
  `;

  @property({ type: Boolean }) isAuthorized!: boolean;
  @property({ type: Boolean }) isHome!: boolean;
  @property({ type: Boolean }) isPublicPage!: boolean;
  @property({ type: Boolean }) isPrivatePage!: boolean;

  private goHome() {
    Router.go('/');
    appStore.getState().setIsMenuOpen(false);
  }

  render() {
    const showLogo = this.isPublicPage || (this.isHome && this.isAuthorized);
    const showBackButton = this.isAuthorized && this.isPrivatePage && !this.isHome;

    return html`
      ${showLogo
        ? html`
            <a
              @click="${this.goHome}"
              class="btn text-xl text-primary bg-transparent border-none shadow-none
                     hover:bg-transparent active:bg-transparent focus:bg-transparent no-animation"
            >
              Movviator
            </a>
          `
        : showBackButton
          ? html`
              <button ${ghostTap(() => this.goHome())} class="btn btn-ghost btn-circle">
                ${OutlineChevronLeftIcon('w-8 h-8 text-primary')}
              </button>
            `
          : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'logo-back-component': LogoBackComponent;
  }
}
