import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { tailwindStyles } from '@utils/app.constants';
import { watchWithSelector } from 'zustand-lit';
import { authStore, selectUserProfile } from '@store/auth-store';
import { FilledCopyIcon, PencilEditIcon, DownloadIcon, TrashIcon } from '@ui/icons';
import type { UserProfile } from '@models/models';
import { appStore } from '@store/app-store';
import '@ui/components/invite-fab.component';

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

  private handleEditTag(e: Event) {
    e.preventDefault();
    e.stopPropagation();

    appStore.getState().openEditTagModal(this.userProfile.tag);
  }

  private handleExportGdpr(e: Event) {
    e.preventDefault();
    e.stopPropagation();

    appStore.getState().openGdprConfirmModal();
  }

  private handleDeleteAccount(e: Event) {
    e.preventDefault();
    e.stopPropagation();

    authStore.getState().openDeleteAccountConfirmModal();
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
                <!-- Tag Section -->
                <div class="flex flex-col gap-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-base-content/50">Tag</span>
                    <button
                      class="btn btn-ghost btn-sm gap-1.5"
                      title="Edit tag"
                      @click="${this.handleEditTag}"
                      aria-label="Edit tag"
                    >
                      ${PencilEditIcon('w-4 h-4 text-primary/80')}
                      <span class="text-sm text-primary/80">Edit</span>
                    </button>
                  </div>
                  <div
                    class="inline-flex items-center gap-2 rounded-full bg-base-200/80 px-3 py-1.5 text-sm font-medium text-base-content/80 border border-base-300/50 w-fit"
                  >
                    <span class="text-base font-semibold text-base-content">
                      ${this.userProfile.tag}
                    </span>
                    <button
                      class="btn btn-ghost btn-sm btn-circle"
                      title="Copy tag"
                      @click="${this.copyTagToClipboard}"
                      aria-label="Copy tag"
                    >
                      ${FilledCopyIcon('w-4 h-4 text-primary/80')}
                    </button>
                  </div>
                </div>

                <div class="flex flex-col gap-2">
                  <span class="text-sm text-base-content/50">Email</span>
                  <span class="font-medium text-base-content break-words whitespace-normal">
                    ${this.userProfile.email}
                  </span>
                </div>

                <div class="flex flex-col gap-2">
                  <span class="text-sm text-base-content/50">Joined</span>
                  <span class="font-medium text-base-content">
                    ${this.formatDate(this.userProfile.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Data & Privacy -->
          <div class="bg-base-100 shadow-lg rounded-xl p-6 mt-4">
            <h2 class="text-lg font-semibold mb-1">Data & Privacy</h2>
            <p class="text-sm text-base-content/60 mb-5">Manage your personal data and account.</p>

            <!-- Export data row -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-start gap-3">
                <span
                  class="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  ${DownloadIcon('w-5 h-5 text-primary')}
                </span>
                <div>
                  <p class="font-medium text-base-content">Export your data</p>
                  <p class="text-sm text-base-content/60">
                    Download a copy of the personal data we hold about you (GDPR).
                  </p>
                </div>
              </div>
              <button
                type="button"
                class="btn btn-outline btn-primary shrink-0"
                @click=${this.handleExportGdpr}
              >
                Export my data
              </button>
            </div>

            <hr class="border-t border-base-content/10 my-4" />

            <!-- Delete account row -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-start gap-3">
                <span
                  class="flex-shrink-0 w-9 h-9 rounded-full bg-error/10 flex items-center justify-center"
                >
                  ${TrashIcon('w-5 h-5 text-error')}
                </span>
                <div>
                  <p class="font-medium text-base-content">Delete account</p>
                  <p class="text-sm text-base-content/60">
                    Permanently remove your account and all associated data. This action cannot be
                    undone.
                  </p>
                </div>
              </div>
              <button
                type="button"
                class="btn btn-outline btn-error shrink-0"
                @click=${this.handleDeleteAccount}
              >
                Delete account
              </button>
            </div>
          </div>
        </main>
        <invite-fab></invite-fab>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'profile-page': ProfilePage;
  }
}
