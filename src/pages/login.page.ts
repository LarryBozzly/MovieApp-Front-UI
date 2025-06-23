import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { connect } from 'zustand-lit';
import '../components/trending-movies.component';
import { tailwindStyles } from '../utils/app.constants';
import { appEffects } from '../effects/app.effects';
import { authStore } from '../store/auth-store';

@customElement('login-page')
export class LoginPage extends connect(LitElement, authStore) {
  static styles = css`
    ${tailwindStyles}
  `;

  private async handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    await appEffects.login({ email, password, remember: true });
  }

  render() {
    return html`
      <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="card w-full max-w-md bg-white shadow-xl">
          <div class="card-body">
            <h2 class="card-title justify-center text-2xl font-bold mb-4">Sign In</h2>
            <form @submit="${this.handleSubmit}" class="flex flex-col gap-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                autocomplete="username"
                class="input input-bordered w-full"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                autocomplete="current-password"
                class="input input-bordered w-full"
              />
              <button
                ?disabled=${this.$state.isLoading}
                type="submit"
                class="btn btn-primary w-full"
              >
                ${this.$state.isLoading ? html`<span class="loading loading-dots"></span>` : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  }
}