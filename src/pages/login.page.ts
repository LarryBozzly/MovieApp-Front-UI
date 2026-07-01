import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { watch, watchWithSelector } from 'zustand-lit';
import { tailwindStyles } from '@utils/app.constants';
import { authStore, selectError, selectIsLoading, type AuthState } from '@store/auth-store';
import { setPageMeta } from '@utils/setPageMeta';

@customElement('login-page')
export class LoginPage extends LitElement {
  @watch(authStore) authState!: AuthState;
  @watchWithSelector({ store: authStore, selector: selectIsLoading }) readonly isLoading!: boolean;
  @watchWithSelector({ store: authStore, selector: selectError }) readonly error!: Error | null;

  static styles = css`
    ${tailwindStyles}
    :host {
      display: block;
      height: 100dvh;
      position: relative;
    }

    .scroll-container {
      position: absolute;
      top: 4rem;
      left: 0;
      right: 0;
      bottom: 0;
      overflow-y: auto;
      scroll-behavior: smooth;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    setPageMeta({
      title: 'Login – Movviator',
      description:
        'Log in to your Movviator account to access your watchlist and match movies with friends.',
      robots: 'index, follow',
      canonicalUrl: 'https://movviator.com/login',
    });
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    await this.authState.login({ email, password, remember: true });
  }

  private clearError() {
    if (this.error) {
      this.authState.setError(null);
    }
  }

  render() {
    return html`
      <div class="scroll-container">
        <div
          class="min-h-[calc(var(--app-height)-4rem)] flex flex-col items-center justify-center bg-base-200"
        >
          <div class="card w-full max-w-md bg-base-100 shadow-xl p-6 text-center">
            <h2 class="text-2xl font-bold mb-4">Sign In</h2>

            ${this.error
              ? html`
                  <div class="alert alert-error text-sm mb-3">
                    <span>${this.error.message}</span>
                  </div>
                `
              : null}

            <form @submit=${this.handleSubmit} class="flex flex-col gap-4">
              <input
                @input=${this.clearError}
                type="email"
                name="email"
                placeholder="Email"
                required
                autocomplete="email"
                class="input input-bordered w-full bg-base-200"
              />
              <input
                @input=${this.clearError}
                type="password"
                name="password"
                placeholder="Password"
                required
                autocomplete="current-password"
                class="input input-bordered w-full bg-base-200"
              />
              <button ?disabled=${this.isLoading} type="submit" class="btn btn-primary w-full">
                ${this.isLoading ? html` <span class="loading loading-dots"></span> ` : 'Login'}
              </button>
            </form>
            <div class="mt-4 text-sm text-center text-base-content/60">
              <a href="/forgot-password" class="link link-primary font-medium hover:underline">
                Forgot your password?
              </a>
              <div class="mt-2">
                Don’t have an account?
                <a href="/signup" class="link link-primary font-medium hover:underline">
                  Sign up here
                </a>
              </div>
            </div>
          </div>
        </div>
        <footer-component></footer-component>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'login-page': LoginPage;
  }
}
