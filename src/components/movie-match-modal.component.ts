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
  @state() private showFullOverview = false;

  private get currentMovie(): Movie | undefined {
    return this.movies[this.currentIndex];
  }

  private get needsReadMore(): boolean {
    return (this.currentMovie?.overview?.length || 0) > 130;
  }

  private toggleOverview() {
    this.showFullOverview = !this.showFullOverview;
  }

  private async swipe(direction: MovieMatchDirection) {
    const movie = this.currentMovie;
    if (!movie) return;

    this.showFullOverview = false;
    this.currentIndex++;

    if (direction === MovieMatchDirection.Like) {
      await this.authState.sendMovieSelection(movie);
    }

    if (this.currentIndex === this.movies.length) {
      // All movies reviewed – trigger completion event or notify server
    }
  }

  render() {
    const movie = this.currentMovie;

    if (!movie) {
      return html`
        <div class="p-6 text-center bg-white rounded-3xl shadow-xl max-w-sm mx-auto my-4">
          <h2 class="text-2xl font-bold text-gray-800">No more movies</h2>
          <p class="text-gray-500">You’ve reviewed all the available titles.</p>
        </div>
      `;
    }

    return html`
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-4">Do you like this movie?</h2>

      <div class="rounded-xl overflow-hidden shadow-lg bg-white border border-gray-100">
        <img
          src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
          alt="${movie.title}"
          class="w-full h-72 object-contain"
        />

        <div class="p-4 space-y-2">
          <h3 class="text-xl font-bold text-gray-900 truncate">${movie.title}</h3>

          <div class="flex items-center gap-3">
            <span class="text-yellow-500 text-lg">★</span>
            <span class="text-base text-gray-700 font-medium">${movie.vote_average.toFixed(1)}</span>
            <span class="badge badge-outline text-sm ${getPopularityClasses(movie.percentage_popularity)}">
                Popularity: ${movie.percentage_popularity}%
            </span>
          </div>

          <div
            class="relative text-sm text-gray-600 leading-relaxed transition-[max-height] duration-300 ease-out 
                   ${this.showFullOverview ? 'max-h-[15em] overflow-y-auto' : 'max-h-[4.5em] overflow-hidden'}"
          >
            <p>${movie.overview || 'No description available.'}</p>
          </div>

          ${this.needsReadMore
        ? html`
                <button @click=${this.toggleOverview} class="text-sm font-medium text-primary mt-2">
                  ${this.showFullOverview ? 'Show Less' : 'Read More'}
                </button>
              `
        : ''}

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