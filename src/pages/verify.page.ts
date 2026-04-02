import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { tailwindStyles } from '@utils/app.constants';
import {
  authStore,
  selectError,
  selectIsLoading,
  selectIsVerified,
  type AuthState,
} from '@store/auth-store';
import { watch, watchWithSelector } from 'zustand-lit';
import { setPageMeta } from '@utils/setPageMeta';

@customElement('verify-page')
export class VerifyPage extends LitElement {
  @watch(authStore) authState!: AuthState;
  @watchWithSelector({ store: authStore, selector: selectIsLoading }) readonly isLoading!: boolean;
  @watchWithSelector({ store: authStore, selector: selectIsVerified })
  readonly isVerified!: boolean;
  @watchWithSelector({ store: authStore, selector: selectError }) readonly error!: Error | null;

  static styles = css`
    ${tailwindStyles}
  `;

  async connectedCallback() {
    super.connectedCallback();
    setPageMeta({
      title: 'Verify Your Account – Movviator',
      description: 'Verify your Movviator email address to complete your account registration.',
      robots: 'noindex, follow',
      canonicalUrl: 'https://movviator.tech/verify',
    });
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

  private _renderLoading() {
    return html`
      <div class="flex flex-col items-center">
        <span class="loading loading-spinner loading-lg text-primary mb-4"></span>
        <h2 class="text-lg font-semibold">Verifying your account...</h2>
      </div>
    `;
  }

  private _renderSuccess() {
    return html`
      <div class="flex flex-col items-center">
        <div class="text-success text-4xl mb-2">✅</div>
        <h2 class="text-xl font-bold mb-2">Verification Successful</h2>
        <p>Your account has been verified! Redirecting to login...</p>
      </div>
    `;
  }

  private _renderError(message: string) {
    return html`
      <div class="flex flex-col items-center">
        <div class="text-error text-4xl mb-2">❌</div>
        <h2 class="text-xl font-bold mb-2">Verification Failed</h2>
        <p>${message}</p>
        <a href="/login" class="btn btn-primary mt-4">Back to Login</a>
      </div>
    `;
  }

  private _renderGenericError() {
    return this._renderError('Something went wrong. Please try again later.');
  }

  render() {
    let content;

    if (this.isLoading) {
      content = this._renderLoading();
    } else if (this.isVerified) {
      content = this._renderSuccess();
    } else if (this.error) {
      content = this._renderError(this.error?.message || 'Invalid or expired verification link.');
    } else {
      content = this._renderGenericError();
    }

    return html`
      <div class="min-h-screen flex flex-col items-center justify-center bg-base-200">
        <div class="card w-full max-w-md bg-base-100 shadow-xl p-6 text-center">${content}</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'verify-page': VerifyPage;
  }
}
