import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { watch, watchWithSelector } from 'zustand-lit';
import '../components/movies-list.component';
import { tailwindStyles } from '../utils/app.constants';
import { authStore, selectError, selectIsLoading, type AuthState } from '../store/auth-store';

@customElement('register-page')
export class RegisterPage extends LitElement {
  @watch(authStore) authState!: AuthState;
  @watchWithSelector({ store: authStore, selector: selectIsLoading }) readonly isLoading!: boolean;
  @watchWithSelector({ store: authStore, selector: selectError }) readonly error!: Error | null;

  static styles = css`
    ${tailwindStyles}
  `;

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
      <div class="min-h-screen flex items-center justify-center bg-base-200">
        <div class="card w-full max-w-md bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title justify-center text-2xl font-bold mb-4">Sign In</h2>

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
                autocomplete="Email"
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
              <button
                ?disabled=${this.isLoading}
                type="submit"
                class="btn btn-primary w-full"
              >
                ${this.isLoading ? html`<span class="loading loading-dots"></span>` : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  }
}