import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { router } from './routes';
import './components/navbar.component';
import { tailwindStyles } from './utils/app.constants';
import { env } from './config';
import { appStore } from './store/app-store';
import HttpService from './services/http.service';
import AuthService from './services/auth.service';
import { authStore } from './store/auth-store';

@customElement('app-root')
export class AppRoot extends LitElement {
  static styles = css`
   ${tailwindStyles} 
    :host {
      width: 100%;
      display: block;
      min-height: 100vh;
    }
  `;

  private initRouter() {
    // Create and attach outlet programmatically
    const outlet = document.createElement('div');
    outlet.id = 'outlet';
    outlet.className = 'pt-16';
    this.shadowRoot!.appendChild(outlet);
    router.setOutlet(outlet);
  }

  private initAppStore() {
    appStore.getInitialState().storeInit({
      httpService: new HttpService(env.MOVIEDB_API_BASE_URL),
      authService: new AuthService(),
      authStore,
    });
  }

  private initAuthStore() {
    authStore.getInitialState().storeInit({
      httpService: new HttpService(env.MOVIEDB_API_BASE_URL),
      authService: new AuthService(),
    });
  }

  firstUpdated() {
    this.initRouter();
    this.initAuthStore();
    this.initAppStore();
  }

  render() {
    return html`
      <navbar-component></navbar-component>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-root': AppRoot;
  }
}