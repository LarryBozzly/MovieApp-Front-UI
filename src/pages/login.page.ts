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
      <div class="flex justify-center items-center min-h-screen bg-gray-100">
        <div class="w-full max-w-md bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 class="text-2xl font-bold mb-6 text-center">Sign In</h2>
          <form @submit="${this.handleSubmit}" class="flex flex-col gap-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              autocomplete="username"
              class="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              autocomplete="current-password"
              class="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button ?disabled=${this.$state.isLoading} type="submit" class="btn btn-active btn-primary">
              ${this.$state.isLoading ? html`<span class="loading loading-spinner"></span>` : 'Login'}
            </button>
          </form>
          </div>
          </div>
        `;
  }
}