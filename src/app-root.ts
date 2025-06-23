import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { router } from './routes';
import './components/navbar.component';
import { tailwindStyles } from './utils/app.constants';

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

  firstUpdated() {
    this.initRouter();
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