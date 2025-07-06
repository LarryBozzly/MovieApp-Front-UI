import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { MovieMatchDirection, type Movie } from '../models/models';
import { tailwindStyles } from '../utils/app.constants';
import { watch } from 'zustand-lit';
import { authStore, type AuthState } from '../store/auth-store';

@customElement('movie-match-modal-component')
export class MovieMatchModalComponent extends LitElement {
  @watch(authStore) authState!: AuthState;

  static styles = css`
    ${tailwindStyles}
  `;

  @property({ type: Array }) movies: Movie[] = [];
  @state() private currentIndex = 0;

  private async swipe(direction: MovieMatchDirection) {
    const movie = this.movies[this.currentIndex];
    if (!movie) return;

    this.currentIndex++;

    if (direction === MovieMatchDirection.Like) {
      await this.authState.sendMovieSelection(movie);
    }

    if (this.currentIndex === this.movies.length) {
      // here send message to server that user has finished reviewing movies
    }
  }

  private get currentMovie(): Movie | undefined {
    return this.movies[this.currentIndex];
  }

  render() {
    const movie = this.currentMovie;

    if (!movie) {
      return html`
        <div class="p-6 text-center">
          <h2 class="text-2xl font-bold">No more movies</h2>
          <p class="text-gray-500">You’ve reviewed all the available titles.</p>
        </div>
      `;
    }

    return html`
      <div class="p-6 space-y-6">
        <h2 class="text-2xl font-bold text-center">Do you like this movie?</h2>

        <div class="relative w-full max-w-sm mx-auto">
          <div class="rounded-xl overflow-hidden shadow-lg bg-white">
            <img
              src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
              alt="${movie.title}"
              class="w-full h-80 object-cover"
            />
            <div class="p-4 space-y-1">
              <h3 class="text-xl font-semibold truncate">${movie.title}</h3>
              <p class="text-sm text-gray-600 line-clamp-3">
                ${movie.overview || 'No description available.'}
              </p>
            </div>
          </div>
        </div>

        <div class="flex justify-between gap-4">
          <button
            @click=${() => this.swipe('dislike')}
            class="btn btn-outline btn-error flex-1"
          >
            👎 Dislike
          </button>
          <button
            @click=${() => this.swipe('like')}
            class="btn btn-primary flex-1"
          >
            👍 Like
          </button>
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
