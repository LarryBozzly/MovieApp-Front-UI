import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';
import { Router } from '@vaadin/router';
import { OutlineChevronLeftIcon } from '../components/icons/icons';

@customElement('logo-back-component')
export class LogoBackComponent extends LitElement {
  static styles = css`${tailwindStyles}`;

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
    this.updateRoute(); // ensure Lit re-renders for programmatic navigation
  }

  render() {
    const isHome = this.path === '/';

    return html`
      ${isHome
        ? html`
            <a
              @click="${this.goHome}"
              class="btn text-xl text-primary bg-transparent border-none shadow-none hover:bg-transparent active:bg-transparent focus:bg-transparent no-animation"
            >
              Movviator
            </a>
          `
        : html`
            <button
              @click="${this.goHome}"
              class="btn btn-ghost btn-circle shadow-none border-none hover:bg-transparent active:bg-transparent"
            >
              ${OutlineChevronLeftIcon()}
            </button>
          `}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'logo-back-component': LogoBackComponent;
  }
}
