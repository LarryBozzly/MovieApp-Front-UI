import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';

interface MockProfile {
  name: string;
  username: string;
  email: string;
  joined: string;
  avatar: string;
  bio: string;
  favoriteGenres: string[];
}

@customElement('profile-page')
export class ProfilePage extends LitElement {
  static styles = css`
    ${tailwindStyles}
  `;

  private mockProfile: MockProfile = {
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    joined: '2021-06-15',
    avatar: 'https://i.pravatar.cc/150?img=12',
    bio: 'Movie enthusiast and weekend critic. Love sci-fi and thrillers!',
    favoriteGenres: ['Action', 'Sci-Fi', 'Thriller', 'Drama'],
  };

  render() {
    return html`
      <main class="p-4 max-w-4xl mx-auto mt-20">
        <div class="bg-base-100 shadow-lg rounded-xl p-6 flex flex-col md:flex-row gap-6">
          <!-- Avatar -->
          <div class="flex-shrink-0">
            <img
              src="${this.mockProfile.avatar}"
              alt="Avatar of ${this.mockProfile.name}"
              class="w-32 h-32 rounded-full object-cover shadow-md"
            />
          </div>

          <!-- Profile Info -->
          <div class="flex-1 flex flex-col justify-between">
            <div>
              <h1 class="text-2xl font-bold text-base-content">${this.mockProfile.name}</h1>
              <p class="text-sm text-base-content/50">@${this.mockProfile.username}</p>
              <p class="mt-2 text-base-content">${this.mockProfile.bio}</p>
            </div>

            <div class="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p class="text-sm text-base-content/50">Email</p>
                <p class="font-medium text-base-content">${this.mockProfile.email}</p>
              </div>
              <div>
                <p class="text-sm text-base-content/50">Joined</p>
                <p class="font-medium text-base-content">${this.mockProfile.joined}</p>
              </div>
            </div>

            <div class="mt-4">
              <p class="text-sm text-base-content/50 mb-1">Favorite Genres</p>
              <div class="flex flex-wrap gap-2">
                ${this.mockProfile.favoriteGenres.map(
      genre => html`<span class="badge badge-outline">${genre}</span>`
    )}
              </div>
            </div>
          </div>
        </div>

        <!-- Mock Recent Activity -->
        <section class="mt-8">
          <h2 class="text-xl font-bold text-base-content mb-4">Recent Activity</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            ${[1, 2, 3, 4, 5, 6].map(i => html`
              <div class="card bg-base-100 shadow-md rounded-lg p-4">
                <h3 class="font-semibold text-base-content mb-1">Movie ${i}</h3>
                <p class="text-sm text-base-content/60">Watched on: 2023-0${i}-1${i}</p>
              </div>
            `)}
          </div>
        </section>
      </main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'profile-page': ProfilePage;
  }
}