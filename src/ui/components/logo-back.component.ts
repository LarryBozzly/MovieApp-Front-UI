import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { tailwindStyles } from '../../utils/app.constants';
import { Router } from '@vaadin/router';
import { OutlineChevronLeftIcon } from '../icons/icons';
import { routes } from '../../routes/app.routes';
import { publicGuard } from '../../guards/public-guard';
import { authGuard } from '../../guards/auth-guard';

@customElement('logo-back-component')
export class LogoBackComponent extends LitElement {
  static styles = css`
    ${tailwindStyles}
  `;

  @property({ type: Boolean }) isAuthorized!: boolean;
  @state() private path = window.location.pathname;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('popstate', this.updateRoute);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('popstate', this.updateRoute);
  }

  private updateRoute = () => {
    this.path = window.location.pathname;
  };

  private goHome() {
    Router.go('/');
    this.updateRoute();
  }

  get publicPages() {
    const pages: string[] = [];

    routes.forEach((route) => {
      if (route.action === publicGuard) {
        if (route.path) pages.push(route.path);
      }
    });

    return pages;
  }

  get privatePages() {
    const pages: string[] = [];

    routes.forEach((route) => {
      if (route.action === authGuard) {
        if (route.path) pages.push(route.path);
        if (Array.isArray(route.children)) {
          route.children.forEach((child) => {
            if (child.path) pages.push(child.path);
          });
        }
      }
    });

    return pages;
  }

  render() {
    const isHome = this.path === '/';

    const isPublicPage = this.publicPages.some((p) => p && this.path.startsWith(p));

    const isPrivatePage = this.privatePages.some((p) => p && this.path.startsWith(p));

    const showLogo = isPublicPage || (isHome && this.isAuthorized);

    const showBackButton = this.isAuthorized && isPrivatePage && !isHome;

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
              <button @click="${this.goHome}" class="btn btn-ghost btn-circle">
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
