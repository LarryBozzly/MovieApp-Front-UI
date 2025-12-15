import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';
import { watchWithSelector } from 'zustand-lit';
import { authStore, selectUserProfile } from '../store/auth-store';
import { FilledCopyIcon, TagIcon } from '../components/icons/icons';
import type { UserProfile } from '../models/models';

@customElement('profile-page')
export class ProfilePage extends LitElement {
  @watchWithSelector({ store: authStore, selector: selectUserProfile })
  readonly userProfile!: UserProfile;

  static styles = css`
    ${tailwindStyles} :host {
      display: block;
      height: 100dvh;
      position: relative;
    }

    .scroll-container {
      position: absolute;
      top: 4rem; /* height of navbar */
      left: 0;
      right: 0;
      bottom: 0;
      overflow-y: auto;
      scroll-behavior: smooth;
    }
  `;

  private async copyTagToClipboard(e: Event) {
    e.stopPropagation();
    await navigator.clipboard.writeText(this.userProfile.tag);
  }

  render() {
    return html`
      <div class="scroll-container">
        <main class="p-4 max-w-4xl mx-auto">
          <div class="bg-base-100 shadow-lg rounded-xl p-6 flex flex-col md:flex-row gap-6">
            <!-- Avatar -->
            <div class="flex-shrink-0">
              <div
                tabindex="0"
                role="button"
                class="w-32 h-32 rounded-full shadow-md bg-gradient-to-br from-primary to-secondary/70 text-white font-bold uppercase relative overflow-hidden"
              >
                <div class="h-full flex items-center justify-center text-4xl leading-none">
                  ${this.userProfile.tag?.[0] ?? '?'}
                </div>
              </div>
            </div>

            <!-- Profile Info -->
            <div class="flex-1 flex flex-col justify-between min-w-0">
              <div class="space-y-2">
                <h1 class="text-2xl md:text-3xl font-bold text-base-content leading-tight truncate">
                  ${this.userProfile.id}
                </h1>
                <div
                  class="inline-flex items-center gap-2 rounded-full bg-base-200/80 px-4 py-2 text-sm font-medium text-base-content/80 hover:bg-base-300/80 hover:shadow-sm transition-all duration-200 border border-base-300/50"
                >
                  ${TagIcon('w-5 h-5 text-primary')}
                  <span>${this.userProfile.tag}</span>
                  <button
                    class="btn btn-ghost btn-sm btn-circle hover:bg-primary/20 p-1.5"
                    title="Copy username"
                    @click="${this.copyTagToClipboard}"
                    aria-label="Copy username"
                  >
                    ${FilledCopyIcon('w-4 h-4 text-primary/80 hover:text-primary')}
                  </button>
                </div>
              </div>

              <div class="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p class="text-sm text-base-content/50">Email</p>
                  <p class="font-medium text-base-content">${this.userProfile.email}</p>
                </div>
                <div>
                  <p class="text-sm text-base-content/50">Joined</p>
                  <p class="font-medium text-base-content">${this.userProfile.createdAt}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Mock Recent Activity -->
          <section class="mt-8">
            <h2 class="text-xl font-bold text-base-content mb-4">Recent Activity</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              ${[1, 2, 3, 4, 5, 6].map(
                (i) => html`
                  <div class="card bg-base-100 shadow-md rounded-lg p-4">
                    <h3 class="font-semibold text-base-content mb-1">Movie ${i}</h3>
                    <p class="text-sm text-base-content/60">Watched on: 2023-0${i}-1${i}</p>
                  </div>
                `
              )}
            </div>
          </section>
        </main>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'profile-page': ProfilePage;
  }
}
