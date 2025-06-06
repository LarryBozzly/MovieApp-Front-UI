import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('profile-user-page')
export class ProfileUserPage extends LitElement {
    static styles = css`
    :host {
      display: block;
      padding: 2rem;
      background: #fff3e0;
      font-family: system-ui, sans-serif;
    }
    .user-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h3 {
      margin-top: 0;
      color: #333;
    }
    p {
      color: #555;
    }
  `;

    // Mock profile user data
    @property({ type: String }) username: string = 'BigJohn';
    @property({ type: String }) role: string = 'Administrator';

    render() {
        return html`
      <div class="user-container">
        <h3>User Profile: ${this.username}</h3>
        <p><strong>Role:</strong> ${this.role}</p>
      </div>
    `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'profile-user-page': ProfileUserPage;
    }
}