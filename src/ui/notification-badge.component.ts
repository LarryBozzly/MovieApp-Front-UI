import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';

@customElement('notification-badge-component')
export class NotificationBadgeComponent extends LitElement {
  @property({ type: Number }) count: number = 0;

  static styles = css`
    ${tailwindStyles}

    :host {
      position: absolute;
    }
  `;

  render() {
    if (this.count <= 0) return html``;

    const label = this.count > 99 ? '99+' : this.count;

    return html`
      <span class="badge badge-secondary text-xs font-bold rounded-full p-2"> ${label} </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'notification-badge-component': NotificationBadgeComponent;
  }
}
