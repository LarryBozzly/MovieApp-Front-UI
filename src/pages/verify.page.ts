import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';
import { authStore, selectError, selectIsLoading, selectIsVerified, type AuthState } from '../store/auth-store';
import { watch, watchWithSelector } from 'zustand-lit';

@customElement('verify-page')
export class VerifyPage extends LitElement {
  @watch(authStore) authState!: AuthState;
  @watchWithSelector({ store: authStore, selector: selectIsLoading }) readonly isLoading!: boolean;
  @watchWithSelector({ store: authStore, selector: selectIsVerified }) readonly isVerified!: boolean;
  @watchWithSelector({ store: authStore, selector: selectError }) readonly error!: Error | null;

  static styles = css`
    ${tailwindStyles}
  `;


  async connectedCallback() {
    super.connectedCallback();
    await this.verifyAccount();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.authState.setIsVerified(false);
  }

  private async verifyAccount() {
    const params = new URLSearchParams(window.location.search);
    const encodedToken = params.get('token') || '';

    const token = decodeURIComponent(encodedToken);
    window.history.replaceState({}, document.title, '/verify');
    await this.authState.verifyAccount(token);
  }

  render() {
    return html`
    <div class="min-h-screen flex flex-col items-center justify-center bg-base-200">
      <div class="card w-full max-w-md bg-base-100 shadow-xl p-6 text-center">
        ${this.isLoading
        ? html`
              <span class="loading loading-spinner loading-lg text-primary mb-4"></span>
              <h2 class="text-lg font-semibold">Verifying your account...</h2>
            `
        : this.isVerified
          ? html`
              <div class="text-success text-4xl mb-2">✅</div>
              <h2 class="text-xl font-bold mb-2">Verification Successful</h2>
              <p>Your account has been verified! Redirecting to login...</p>
            `
          : this.error
            ? html`
              <div class="text-error text-4xl mb-2">❌</div>
              <h2 class="text-xl font-bold mb-2">Verification Failed</h2>
              <p>${this.error?.message || 'Invalid or expired verification link.'}</p>
              <a href="/login" class="btn btn-primary mt-4">Back to Login</a>
            `
            : html`
              <div class="text-error text-4xl mb-2">❌</div>
              <h2 class="text-xl font-bold mb-2">Verification Failed</h2>
              <p>Something went wrong. Please try again later.</p>
              <a href="/login" class="btn btn-primary mt-4">Back to Login</a>
            `}
      </div>
    </div>
  `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'verify-page': VerifyPage;
  }
}
