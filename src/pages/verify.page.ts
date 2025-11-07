import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';

@customElement('verify-page')
export class VerifyPage extends LitElement {
    static styles = css`
    ${tailwindStyles}
  `;

    @state() private status: 'loading' | 'success' | 'error' = 'loading';
    @state() private message = 'Verifying your account...';

    async connectedCallback() {
        super.connectedCallback();
        await this.verifyAccount();
    }

    private async verifyAccount() {
        try {
            // Extract the token from the URL (e.g. /verify/abc123)
            const pathParts = window.location.pathname.split('/');
            const token = pathParts[pathParts.length - 1];

            if (!token) {
                this.status = 'error';
                this.message = 'Invalid verification link.';
                return;
            }

            // Hit your backend verification endpoint
            const res = await fetch(`/api/auth/verify?token=${token}`, {
                method: 'GET',
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || 'Verification failed.');
            }

            this.status = 'success';
            this.message = 'Your account has been verified successfully! Redirecting to login...';

            // Redirect after 3 seconds
            setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
        } catch (err: any) {
            console.error('❌ Verification error:', err);
            this.status = 'error';
            this.message = err.message || 'Verification failed. Please try again later.';
        }
    }

    render() {
        return html`
      <div class="min-h-screen flex flex-col items-center justify-center bg-base-200">
        <div class="card w-full max-w-md bg-base-100 shadow-xl p-6 text-center">
          ${this.status === 'loading'
                ? html`
                <span class="loading loading-spinner loading-lg text-primary mb-4"></span>
                <h2 class="text-lg font-semibold">${this.message}</h2>
              `
                : this.status === 'success'
                    ? html`
                <div class="text-success text-4xl mb-2">✅</div>
                <h2 class="text-xl font-bold mb-2">Verification Successful</h2>
                <p>${this.message}</p>
              `
                    : html`
                <div class="text-error text-4xl mb-2">❌</div>
                <h2 class="text-xl font-bold mb-2">Verification Failed</h2>
                <p>${this.message}</p>
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
