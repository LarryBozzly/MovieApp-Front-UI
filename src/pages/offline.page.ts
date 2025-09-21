import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('offline-page')
export class OfflinePage extends LitElement {

    render() {
        return html`
         <h2>You are offline</h2>
          <p>Some features may be unavailable while offline.</p>
    `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'offline-page': OfflinePage;
    }
}
