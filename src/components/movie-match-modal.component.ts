import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { MovieMatchDirection, type Movie } from '../models/models';
import { tailwindStyles } from '../utils/app.constants';
import { watch } from 'zustand-lit';
import { authStore, type AuthState } from '../store/auth-store';
import { getPopularityClasses } from '../utils/popularity-ui-classes.functions';

@customElement('movie-match-modal-component')
export class MovieMatchModalComponent extends LitElement {
  @watch(authStore) authState!: AuthState;

  static styles = css`
    ${tailwindStyles}
  `;

  @property({ type: Array }) movies: Movie[] = [];

  @state() private currentIndex = 0;

  private get currentMovie(): Movie | undefined {
    return this.movies[this.currentIndex];
  }

  private async swipe(direction: MovieMatchDirection) {
    const movie = this.currentMovie;
    if (!movie) return;

    this.currentIndex++;

    if (direction === MovieMatchDirection.Like) {
      await this.authState.sendMovieSelection(movie);
    }

    if (direction === MovieMatchDirection.Dislike) {
      await this.authState.sendMovieRejection(movie);
    }

    if (this.currentIndex === this.movies.length) {
      // All movies reviewed – trigger completion event or notify server
    }
  }

  render() {
    const movie = this.currentMovie;

    if (!movie) {
      return html`
        <div class="p-6 text-center bg-base-100 rounded-3xl shadow-xl max-w-sm mx-auto my-4">
          <h2 class="text-2xl font-bold text-base-content">No more movies</h2>
          <p class="text-base-content/70">You’ve reviewed all the available titles.</p>
        </div>
      `;
    }

    return html`
      <h2 class="text-2xl font-bold text-center text-base-content mb-4">
        Do you like this movie?
      </h2>

      <div class="rounded-xl overflow-hidden shadow-lg bg-base-100 border border-base-300">
        <img
          src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
          alt="${movie.title}"
          class="w-full h-72 object-contain bg-base-200"
        />

        <div class="p-4 space-y-3">
          <!-- Title and year -->
          <h3 class="text-xl font-bold text-base-content">
            ${movie.title}
            <span class="text-base-content/60 text-sm">
              (${movie.release_date ? new Date(movie.release_date).getFullYear() : ''})
            </span>
          </h3>

          <!-- Rating and popularity -->
          <div class="flex items-center gap-3">
            <span class="text-yellow-500 text-lg">★</span>
            <span class="text-base text-base-content/80 font-medium">
              ${movie.vote_average?.toFixed(1)}
            </span>
            <span
              class="badge badge-outline text-sm ${getPopularityClasses(movie.percentage_popularity)}"
            >
              Popularity: ${movie.percentage_popularity}%
            </span>
          </div>

          <!-- Scrollable description only -->
          <div
            class="max-h-[8rem] h-auto relative text-sm text-base-content/70 leading-relaxed rounded-lg border border-base-300 bg-base-200/60 overflow-y-auto">
            <p class="p-2">${movie.overview || 'No description available.'}</p>
          </div>

          <!-- Like / Dislike buttons -->
          <div class="flex justify-between gap-4 pt-4">
            <button
              @click=${() => this.swipe(MovieMatchDirection.Dislike)}
              class="btn btn-outline btn-error flex-1 text-base font-semibold py-3"
            >
              👎 Dislike
            </button>

            <button
              @click=${() => this.swipe(MovieMatchDirection.Like)}
              class="btn btn-primary flex-1 text-base font-semibold py-3"
            >
              👍 Like
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'movie-match-modal-component': MovieMatchModalComponent;
  }
}