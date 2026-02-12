import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { watch, watchWithSelector } from 'zustand-lit';
import '../ui/components/movies-list.component';
import { tailwindStyles } from '../utils/app.constants';
import {
  authStore,
  selectError,
  selectIsLoading,
  selectIsRegistered,
  type AuthState,
} from '../store/auth-store';

@customElement('signup-page')
export class SignupPage extends LitElement {
  @watch(authStore) authState!: AuthState;
  @watchWithSelector({ store: authStore, selector: selectIsLoading }) readonly isLoading!: boolean;
  @watchWithSelector({ store: authStore, selector: selectIsRegistered })
  readonly isRegistered!: boolean;
  @watchWithSelector({ store: authStore, selector: selectError }) readonly error!: Error | null;

  static styles = css`
    ${tailwindStyles}
  `;
  @state() private email: string = '';

  disconnectedCallback() {
    super.disconnectedCallback();
    this.authState.setIsRegistered(false);
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    this.email = email;
    await this.authState.register({ email, password });
  }

  private clearError() {
    if (this.error) {
      this.authState.setError(null);
    }
  }

  render() {
    return html`
      <div class="min-h-screen flex flex-col items-center justify-center bg-base-200">
        <div class="card w-full max-w-md bg-base-100 shadow-xl p-6 text-center">
          ${this.isRegistered
            ? html`
                <div class="text-success text-4xl mb-3">✅</div>
                <h2 class="text-xl font-bold mb-2">Registration Successful</h2>
                <p class="text-base-content/80">
                  We’ve sent a verification email to
                  <strong>${this.email ?? 'your email address'}</strong>
                  .
                  <br />
                  <br />
                  Please check your inbox and click the verification link to activate your account.
                </p>
                <p class="mt-4 text-sm text-base-content/60">
                  If you don’t see the email, check your
                  <strong>Spam</strong>
                  or
                  <strong>Junk</strong>
                  folder.
                </p>
                <a href="/login" class="btn btn-primary mt-6">Back to Login</a>
              `
            : html`
                <h2 class="card-title justify-center text-2xl font-bold mb-4">Sign Up</h2>

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
                    autocomplete="new-password"
                    class="input input-bordered w-full bg-base-200"
                  />
                  <button ?disabled=${this.isLoading} type="submit" class="btn btn-primary w-full">
                    ${this.isLoading
                      ? html` <span class="loading loading-dots"></span> `
                      : 'Register'}
                  </button>
                </form>

                <div class="mt-4 text-sm text-center text-base-content/60">
                  Already have an account?
                  <a href="/login" class="link link-primary font-medium hover:underline">
                    Sign in here
                  </a>
                </div>
              `}
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
