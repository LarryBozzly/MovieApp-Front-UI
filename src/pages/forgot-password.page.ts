import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { watch, watchWithSelector } from 'zustand-lit';
import '@ui/components/movies-list.component';
import { tailwindStyles } from '@utils/app.constants';
import { setPageMeta } from '@utils/setPageMeta';
import {
  authStore,
  selectError,
  selectIsForgottenPasswordSent,
  selectIsLoading,
  selectIsVerifiedPasswordCodeSent,
  selectisPasswordChanged,
  type AuthState,
} from '@store/auth-store';

@customElement('forgot-password-page')
export class ForgotPasswordPage extends LitElement {
  @watch(authStore) authState!: AuthState;

  @watchWithSelector({ store: authStore, selector: selectIsLoading }) readonly isLoading!: boolean;
  @watchWithSelector({ store: authStore, selector: selectIsForgottenPasswordSent })
  readonly isForgottenPasswordSent!: boolean;
  @watchWithSelector({ store: authStore, selector: selectIsVerifiedPasswordCodeSent })
  readonly isVerifiedPasswordCodeSent!: boolean;
  @watchWithSelector({ store: authStore, selector: selectisPasswordChanged })
  readonly isPasswordChanged!: boolean;
  @watchWithSelector({ store: authStore, selector: selectError }) readonly error!: Error | null;

  @state() private email: string = '';
  @state() private code: string = '';
  @state() private password: string = '';
  @state() private confirmPassword: string = '';

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
      title: 'Forgot Password – Movviator',
      description: 'Reset your Movviator password. Enter your email address to get started.',
      robots: 'index, follow',
      canonicalUrl: 'https://movviator.tech/forgot-password',
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.authState.setIsForgottenPasswordSent(false);
    this.authState.setIsVerifiedPasswordCodeSent(false);
    this.authState.setIsPasswordChanged(false);
    this.authState.setError(null);
  }

  private async handleEmailSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    this.email = formData.get('email') as string;

    await this.authState.forgotPassword(this.email);
  }

  private async handleCodeSubmit(e: Event) {
    e.preventDefault();
    await this.authState.verifyPasswordCode(this.email, this.code);
  }

  private async handlePasswordReset(e: Event) {
    e.preventDefault();

    if (this.password !== this.confirmPassword) {
      this.authState.setError(new Error('Passwords do not match'));
      return;
    }

    await this.authState.passwordChange(this.password);
  }

  private clearError() {
    if (this.error) this.authState.setError(null);
  }

  render() {
    return html`
      <div class="scroll-container">
        <div
          class="min-h-[calc(var(--app-height)-4rem)]  flex flex-col items-center justify-center bg-base-200"
        >
          <div class="card w-full max-w-md bg-base-100 shadow-xl p-6 text-center">
            ${this.error
              ? html`
                  <div class="alert alert-error text-sm mb-3">
                    <span>${this.error.message}</span>
                  </div>
                `
              : null}
            ${this.renderStep()}
          </div>
        </div>
        <footer-component></footer-component>
      </div>
    `;
  }

  private renderStep() {
    switch (true) {
      case this.isPasswordChanged:
        return this.renderSuccess();
      case this.isVerifiedPasswordCodeSent:
        return this.renderPasswordInput();
      case this.isForgottenPasswordSent:
        return this.renderCodeInput();
      default:
        return this.renderEmailInput();
    }
  }

  private renderEmailInput() {
    return html`
      <h2 class="card-title justify-center text-2xl font-bold mb-4">Forgot Password?</h2>

      <form @submit=${this.handleEmailSubmit} class="flex flex-col gap-4">
        <input
          @input=${this.clearError}
          type="email"
          name="email"
          placeholder="Enter your email"
          required
          autocomplete="email"
          class="input input-bordered w-full bg-base-200"
        />

        <button ?disabled=${this.isLoading} type="submit" class="btn btn-primary w-full">
          ${this.isLoading
            ? html` <span class="loading loading-dots"></span> `
            : 'Send Reset Email'}
        </button>
      </form>

      <div class="mt-4 text-sm text-center text-base-content/60">
        Remembered your password?
        <a href="/login" class="link link-primary font-medium hover:underline">Back to Login</a>
      </div>
    `;
  }

  private renderCodeInput() {
    return html`
      <div class="text-success text-4xl mb-3">📧</div>
      <h2 class="text-xl font-bold mb-2">Check Your Email</h2>
      <p class="text-base-content/80 mb-4">
        A reset code has been sent to
        <strong>${this.email}</strong>
        .
      </p>

      <form @submit=${this.handleCodeSubmit} class="flex flex-col gap-4">
        <input
          @input=${(e: any) => (this.code = e.target.value)}
          type="text"
          placeholder="Enter verification code"
          required
          maxlength="6"
          class="input input-bordered w-full bg-base-200 text-center tracking-widest"
        />

        <button type="submit" class="btn btn-primary w-full" ?disabled=${this.isLoading}>
          ${this.isLoading ? html` <span class="loading loading-dots"></span> ` : 'Verify Code'}
        </button>
      </form>
    `;
  }

  private renderPasswordInput() {
    return html`
      <div class="text-success text-4xl mb-3">🔓</div>
      <h2 class="text-xl font-bold mb-2">Reset Your Password</h2>
      <p class="text-base-content/80 mb-4">Create a new secure password.</p>

      <form @submit=${this.handlePasswordReset} class="flex flex-col gap-4">
        <input
          @input=${(e: any) => {
            this.clearError();
            this.password = e.target.value;
          }}
          type="password"
          placeholder="New Password"
          required
          class="input input-bordered w-full bg-base-200"
        />

        <input
          @input=${(e: any) => {
            this.clearError();
            this.confirmPassword = e.target.value;
          }}
          type="password"
          placeholder="Confirm Password"
          required
          class="input input-bordered w-full bg-base-200"
        />

        <button type="submit" class="btn btn-primary w-full" ?disabled=${this.isLoading}>
          ${this.isLoading ? html` <span class="loading loading-dots"></span> ` : 'Reset Password'}
        </button>
      </form>
    `;
  }

  private renderSuccess() {
    return html`
      <div class="text-success text-4xl mb-3">✅</div>
      <h2 class="text-xl font-bold mb-2">Password Changed!</h2>
      <p class="text-base-content/80">Your password was successfully updated.</p>

      <a href="/login" class="btn btn-primary mt-6">Go to Login</a>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'forgot-password-page': ForgotPasswordPage;
  }
}
