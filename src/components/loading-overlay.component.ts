import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';
import { watchWithSelector } from 'zustand-lit';
import { authStore, selectIsAuthorized, selectIsLoading, selectIsWSConnected } from '../store/auth-store';

@customElement('loading-overlay-component')
export class LoadingOverlayComponent extends LitElement {
  @watchWithSelector({ store: authStore, selector: selectIsLoading }) readonly isLoading!: boolean;
  @watchWithSelector({ store: authStore, selector: selectIsWSConnected }) readonly isWSConnected!: boolean;
  @watchWithSelector({ store: authStore, selector: selectIsAuthorized }) readonly isAuthorized!: boolean;


  static styles = css`
    ${tailwindStyles}
  `;

  updated() {
    if (this.overLayLoading) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }

  get overLayLoading() {
    return this.isLoading || (this.isAuthorized && !this.isWSConnected)
  }

  render() {
    return html`
    ${this.overLayLoading
        ? html`
          <div style="z-index:999;" class="fixed top-0 left-0 w-full h-screen flex items-center justify-center bg-black/65">
            <span class="loading loading-spinner text-white w-16 h-16"></span>
          </div>
        `
        : null}
  `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'loading-overlay-component': LoadingOverlayComponent;
  }
}
