import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { tailwindStyles } from '@utils/app.constants';
import { watch } from 'zustand-lit';
import { authStore, type AuthState } from '@store/auth-store';
import ToastService from '@services/toast-service';
import { MovieGenre, MovieGenreMap, type Mood } from '@models/models';

@customElement('send-invite-modal-component')
export class SendInviteModalComponent extends LitElement {
  @watch(authStore) authState!: AuthState;

  static styles = css`
    ${tailwindStyles}
  `;

  @state() private tag: string = '';
  @state() private selectedMood: Mood | undefined = undefined;

  private readonly toastService = ToastService.getInstance();
  private readonly invitationMessage = 'Invitation sent.';

  private moods: Mood[] = [
    { id: 0, name: 'Personalized', genres: [] },
    {
      id: 1,
      name: 'Feel Good',
      genres: [MovieGenre.Comedy, MovieGenre.Family, MovieGenre.Music],
    },
    {
      id: 2,
      name: 'Emotional',
      genres: [MovieGenre.Drama, MovieGenre.Romance],
    },
    {
      id: 3,
      name: 'Intense',
      genres: [MovieGenre.Thriller, MovieGenre.Crime],
    },
    {
      id: 4,
      name: 'Scary',
      genres: [MovieGenre.Horror],
    },
    {
      id: 5,
      name: 'Mind-Bending',
      genres: [MovieGenre.SciFi, MovieGenre.Mystery],
    },
    {
      id: 6,
      name: 'Adventure',
      genres: [MovieGenre.Adventure, MovieGenre.Fantasy],
    },
    {
      id: 7,
      name: 'Action',
      genres: [MovieGenre.Action, MovieGenre.Adventure],
    },
    {
      id: 8,
      name: 'Animated',
      genres: [MovieGenre.Animation, MovieGenre.Family],
    },
    {
      id: 9,
      name: 'Real & Raw',
      genres: [MovieGenre.Documentary],
    },
  ];

  constructor() {
    super();
    this.selectedMood = this.moods[0];
  }

  private handleInput(e: Event) {
    this.tag = (e.target as HTMLInputElement).value;
  }

  private isMoodSelected(mood: Mood): boolean {
    return this.selectedMood?.id === mood.id;
  }

  /**
   * Stable single-select behavior.
   * No toggling off = smoother UX.
   */
  private toggleMood(mood: Mood) {
    this.selectedMood = mood;
  }

  private get selectedGenreIds(): number[] {
    if (!this.selectedMood) return [];
    return [...new Set(this.selectedMood.genres)].filter((id) => MovieGenreMap.has(id));
  }

  private getMoodButtonClass(mood: Mood): string {
    const isSelected = this.isMoodSelected(mood);

    return isSelected
      ? 'btn-primary'
      : 'btn-outline border-base-300 text-base-content hover:bg-base-200 hover:border-base-300';
  }

  private async sendInvite(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const trimmedTag = this.tag.trim();
    if (!trimmedTag || !this.selectedMood) return;

    (document.activeElement as HTMLElement | null)?.blur();
    await this.authState.sendInvitationRequest(trimmedTag, this.selectedGenreIds);
    this.toastService.show(this.invitationMessage, { type: 'success' });
  }

  render() {
    return html`
      <div class="p-6 pb-12 sm:pb-6 space-y-5 bg-base-100">
        <div>
          <h2 class="text-2xl font-bold">Send Invitation</h2>

          <p class="text-sm text-base-content/60 mt-1">
            Choose the mood and enter a user tag for the movie match invitation.
          </p>
        </div>

        <form @submit=${this.sendInvite} autocomplete="off">
          <div class="flex flex-wrap gap-2">
            ${this.moods.map(
              (mood) => html`
                <button
                  type="button"
                  class="btn btn-sm rounded-full ${this.getMoodButtonClass(mood)}"
                  @click=${() => this.toggleMood(mood)}
                >
                  ${mood.name}
                </button>
              `
            )}
          </div>

          <div class="form-control mt-4">
            <input
              autocapitalize="none"
              autocomplete="off"
              autocorrect="off"
              spellcheck="false"
              inputmode="text"
              type="text"
              class="input input-bordered w-full"
              placeholder="User Tag"
              .value=${this.tag}
              @input=${this.handleInput}
            />
          </div>

          <div class="pt-4">
            <button
              type="submit"
              class="btn btn-primary w-full"
              ?disabled=${!this.tag.trim() || !this.selectedMood}
            >
              Send Invite
            </button>
          </div>
        </form>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'send-invite-modal-component': SendInviteModalComponent;
  }
}
