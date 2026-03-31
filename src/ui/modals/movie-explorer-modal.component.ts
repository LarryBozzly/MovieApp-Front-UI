import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { tailwindStyles } from '@utils/app.constants';
import { watch } from 'zustand-lit';
import { authStore, type AuthState } from '@store/auth-store';
import ToastService from '@services/toast-service';
import { MovieGenre, MovieGenreMap } from '@models/models';

interface Mood {
  id: number;
  name: string;
  genres: MovieGenre[]; // typed as MovieGenre instead of plain number
}

@customElement('movie-explorer-modal-component')
export class MovieExplorerModalComponent extends LitElement {
  @watch(authStore) authState!: AuthState;

  static styles = css`
    ${tailwindStyles}
  `;

  private readonly toastService = ToastService.getInstance();
  private readonly invitationMessage = 'Session started.';

  @state() private selectedMoods: Mood[] = [];
  @state() private isSubmitting = false;

  private moods: Mood[] = [
    {
      id: 1,
      name: 'Feel Good',
      genres: [MovieGenre.Comedy, MovieGenre.Family, MovieGenre.Music],
    },
    { id: 2, name: 'Emotional', genres: [MovieGenre.Drama, MovieGenre.Romance] },
    { id: 3, name: 'Intense', genres: [MovieGenre.Thriller, MovieGenre.Crime] },
    { id: 4, name: 'Scary', genres: [MovieGenre.Horror, MovieGenre.Thriller] },
    { id: 5, name: 'Mind-Bending', genres: [MovieGenre.SciFi, MovieGenre.Mystery] },
    { id: 6, name: 'Adventure', genres: [MovieGenre.Adventure, MovieGenre.Fantasy] },
    { id: 7, name: 'Action', genres: [MovieGenre.Action, MovieGenre.Adventure] },
    { id: 8, name: 'Animated', genres: [MovieGenre.Animation, MovieGenre.Family] },
    { id: 9, name: 'Real & Raw', genres: [MovieGenre.Documentary, MovieGenre.Drama] },
  ];

  private isMoodSelected(mood: Mood): boolean {
    return this.selectedMoods.some((m) => m.id === mood.id);
  }

  private toggleMood(mood: Mood) {
    if (this.isSubmitting) return;

    if (this.isMoodSelected(mood)) {
      this.selectedMoods = this.selectedMoods.filter((m) => m.id !== mood.id);
    } else {
      if (this.selectedMoods.length >= 1) return;
      this.selectedMoods = [...this.selectedMoods, mood];
    }
  }

  private get selectedGenreIds(): number[] {
    const uniqueIds = [...new Set(this.selectedMoods.flatMap((m) => m.genres))];
    return uniqueIds.filter((id) => MovieGenreMap.has(id));
  }

  private async startSession(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.isSubmitting || this.selectedMoods.length === 0) return;

    this.isSubmitting = true;

    try {
      const tag = authStore.getState().userProfile?.tag;
      await this.authState.startSoloSession(tag, this.selectedGenreIds);
      this.toastService.show(this.invitationMessage, { type: 'success' });
    } finally {
      this.isSubmitting = false;
    }
  }

  render() {
    return html`
      <div class="p-6 pb-12 sm:pb-6 space-y-5 bg-base-100">
        <!-- Header -->
        <div>
          <h2 class="text-2xl font-bold text-base-content">Movie night for one?</h2>
          <p class="text-sm text-base-content/60 mt-1">Choose your mood</p>
        </div>

        <div class="divider border-base-300 my-0"></div>

        <!-- Mood chips -->
        <div>
          <div class="flex flex-wrap gap-2">
            ${this.moods.map(
              (m) => html`
                <button
                  type="button"
                  ?disabled=${this.isSubmitting || (!this.isMoodSelected(m) && this.selectedMoods.length >= 1)}
                  class="btn btn-sm rounded-full
                    ${this.isMoodSelected(m)
                    ? 'btn-primary'
                    : 'btn-outline border-base-300 text-base-content hover:bg-base-200 hover:border-base-300 hover:text-base-content'}
                    ${this.isSubmitting || (!this.isMoodSelected(m) && this.selectedMoods.length >= 1)
                    ? 'opacity-40 cursor-not-allowed'
                    : ''}"
                  @click=${() => this.toggleMood(m)}
                >
                  ${m.name}
                </button>
              `
            )}
          </div>
        </div>

        <!-- Submit -->
        <form @submit=${this.startSession} autocomplete="off">
          <button
            type="submit"
            class="btn btn-primary w-full"
            ?disabled=${this.isSubmitting || this.selectedMoods.length === 0}
          >
            ${this.isSubmitting ? 'Starting...' : 'Start'}
          </button>
        </form>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'movie-explorer-modal-component': MovieExplorerModalComponent;
  }
}
