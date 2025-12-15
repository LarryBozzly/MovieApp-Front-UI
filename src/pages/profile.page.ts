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
    ${tailwindStyles}

    :host {
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

  private formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  render() {
    return html`
      <div class="scroll-container">
        <main class="p-4 max-w-4xl mx-auto">
          <div class="bg-base-100 shadow-lg rounded-xl p-6 flex flex-col md:flex-row gap-6">
            <!-- Avatar -->
            <div class="flex-shrink-0 flex justify-center md:justify-start">
              <div
                class="w-32 h-32 rounded-full shadow-md bg-gradient-to-br from-primary to-secondary/70 text-white font-bold uppercase flex items-center justify-center text-4xl leading-none"
              >
                ${this.userProfile.tag?.[0] ?? '?'}
              </div>
            </div>

            <!-- Profile Info -->
            <div class="flex-1 flex flex-col gap-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div class="flex flex-col gap-1">
                  <span class="text-sm text-base-content/50">Tag</span>
                  <div
                    class="inline-flex items-center gap-2 rounded-full bg-base-200/80 px-2 py-1 text-sm font-medium text-base-content/80 hover:bg-base-300/80 hover:shadow-sm transition-all duration-200 border border-base-300/50 w-fit"
                  >
                    ${TagIcon('w-5 h-5 text-primary')}
                    <span class="text-base font-semibold text-base-content">
                      ${this.userProfile.tag}
                    </span>
                    <button
                      class="btn btn-ghost btn-sm btn-circle hover:bg-primary/20 p-1.5"
                      title="Copy tag"
                      @click="${this.copyTagToClipboard}"
                      aria-label="Copy tag"
                    >
                      ${FilledCopyIcon('w-4 h-4 text-primary/80 hover:text-primary')}
                    </button>
                  </div>
                </div>

                <div class="flex flex-col gap-1">
                  <span class="text-sm text-base-content/50">Email</span>
                  <span class="font-medium text-base-content break-words whitespace-normal">
                    ${this.userProfile.email}
                  </span>
                </div>

                <div class="flex flex-col gap-1">
                  <span class="text-sm text-base-content/50">Joined</span>
                  <span class="font-medium text-base-content">
                    ${this.formatDate(this.userProfile.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
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
