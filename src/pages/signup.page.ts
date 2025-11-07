import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { watch, watchWithSelector } from 'zustand-lit';
import '../components/movies-list.component';
import { tailwindStyles } from '../utils/app.constants';
import { authStore, selectError, selectIsLoading, type AuthState } from '../store/auth-store';

@customElement('signup-page')
export class SignupPage extends LitElement {
  @watch(authStore) authState!: AuthState;
  @watchWithSelector({ store: authStore, selector: selectIsLoading }) readonly isLoading!: boolean;
  @watchWithSelector({ store: authStore, selector: selectError }) readonly error!: Error | null;

  static styles = css`
    ${tailwindStyles}
  `;

  private async handleSubmit(_e: Event) {
    // e.preventDefault();
    // const form = e.target as HTMLFormElement;
    // const formData = new FormData(form);
    // const email = formData.get('email') as string;
    // const password = formData.get('password') as string;
    // await this.authState.login({ email, password, remember: true });
  }

  private clearError() {
    if (this.error) {
      this.authState.setError(null);
    }
  }

  render() {
    return html`
      <div class="min-h-screen flex flex-col items-center justify-center bg-base-200">
        <div class="card w-full max-w-md bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title justify-center text-2xl font-bold mb-4">Sign Up</h2>

            ${this.error
        ? html`
                  <div class="alert alert-error text-sm">
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
                autocomplete="new-password"
                class="input input-bordered w-full bg-base-200"
              />
              <button
                ?disabled=${this.isLoading}
                type="submit"
                class="btn btn-primary w-full"
              >
                ${this.isLoading ? html`<span class="loading loading-dots"></span>` : 'Register'}
              </button>
            </form>
          </div>
        </div>

        <!-- Login footer -->
        <div class="mt-4 text-sm text-center text-base-content/60">
          Already have an account?
          <a href="/login" class="link link-primary font-medium hover:underline">
            Sign in here
          </a>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'signup-page': SignupPage;
  }
}
