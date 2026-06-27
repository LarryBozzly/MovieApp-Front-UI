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
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(this.userProfile.tag);
      await appStore.getState().showToast('Tag copied to clipboard', 'success');
    } catch {
      await appStore.getState().showToast('Could not copy tag', 'error');
    }
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
          <div class="bg-base-100 shadow-lg rounded-xl overflow-hidden">
            <!-- Identity hero -->
            <div class="flex flex-col sm:flex-row sm:items-center gap-5 p-6">
              <!-- Avatar -->
              <div class="flex-shrink-0 flex justify-center sm:justify-start">
                <div
                  class="w-24 h-24 rounded-full shadow-md bg-gradient-to-br from-primary to-secondary/70 text-white font-bold uppercase flex items-center justify-center text-4xl leading-none"
                >
                  ${this.userProfile.tag?.[0] ?? '?'}
                </div>
              </div>

              <!-- Identity + actions -->
              <div class="flex-1 min-w-0 text-center sm:text-left">
                <span class="text-xs font-semibold uppercase tracking-wider text-base-content/40">
                  Your tag
                </span>
                <h2 class="text-2xl font-bold text-base-content break-words whitespace-normal mt-1">
                  ${this.userProfile.tag}
                </h2>
                <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                  <button
                    class="btn btn-primary btn-sm gap-1.5"
                    title="Copy tag"
                    @click="${this.copyTagToClipboard}"
                    aria-label="Copy tag"
                  >
                    ${FilledCopyIcon('w-4 h-4')}
                    <span>Copy tag</span>
                  </button>
                  <button
                    class="btn btn-ghost btn-sm gap-1.5"
                    title="Edit tag"
                    @click="${this.handleEditTag}"
                    aria-label="Edit tag"
                  >
                    ${PencilEditIcon('w-4 h-4 text-primary/80')}
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            </div>

            <hr class="border-t border-base-content/10" />

            <!-- Metadata -->
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 p-6">
              <div class="flex flex-col gap-1">
                <dt class="text-sm text-base-content/50">Email</dt>
                <dd class="font-medium text-base-content break-words whitespace-normal">
                  ${this.userProfile.email}
                </dd>
              </div>
              <div class="flex flex-col gap-1">
                <dt class="text-sm text-base-content/50">Joined</dt>
                <dd class="font-medium text-base-content">
                  ${this.formatDate(this.userProfile.createdAt)}
                </dd>
              </div>
            </dl>
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
