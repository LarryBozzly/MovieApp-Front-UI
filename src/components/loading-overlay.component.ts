import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';
import { watchWithSelector } from 'zustand-lit';
import { authStore, selectIsLoading } from '../store/auth-store';

@customElement('loading-overlay-component')
export class LoadingOverlayComponent extends LitElement {
  @watchWithSelector({ store: authStore, selector: selectIsLoading }) readonly isLoading!: boolean;

  static styles = css`
    ${tailwindStyles}
  `;

  render() {
    return html`
      ${this.isLoading
        ? html`
            <div class="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/65 z-50">
              <span class="loading loading-dots text-white w-16 h-16"></span>
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
