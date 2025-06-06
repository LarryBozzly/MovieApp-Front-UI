import { Router } from '@vaadin/router';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('profile-page')
export class ProfilePage extends LitElement {
    static styles = css`
    :host {
      display: block;
      padding: 2rem;
      background: #f3f3f3;
      font-family: system-ui, sans-serif;
    }
    .profile-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h2 {
      margin-top: 0;
      color: #333;
    }
    p {
      color: #555;
    }
  `;

    // Sample profile data as properties
    @property({ type: String }) name = 'John Doe';
    @property({ type: String }) email = 'john.doe@example.com';
    @property({ type: String }) bio =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel risus eget nisi commodo auctor.';


    // Event handler to trigger redirect using the Router
    private redirectToUser() {
        Router.go('/profile/user');
    }
    render() {
        return html`
      <div class="profile-container">
        <button @click="${this.redirectToUser}" style="margin-bottom: 1rem;">Go to User Profile</button>    
        <h2>Profile</h2>
        <p><strong>Name:</strong> ${this.name}</p>
        <p><strong>Email:</strong> ${this.email}</p>
        <p><strong>Bio:</strong> ${this.bio}</p>
      </div>
    `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'profile-page': ProfilePage;
    }
}