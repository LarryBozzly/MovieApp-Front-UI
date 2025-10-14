import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type Movie } from '../models/models';
import { tailwindStyles } from '../utils/app.constants';

@customElement('movie-match-result-modal')
export class MovieMatchResultModal extends LitElement {

  static styles = css`
      ${tailwindStyles}
  `;

  @property({ type: Object }) movie!: Movie;
  @property({ type: Function }) onClose!: () => void;


  render() {
    return html`
      <div class="p-6 space-y-4 flex flex-col max-h-[90vh] overflow-hidden">
        <h2
          id="match-title"
          class="text-3xl font-extrabold text-center text-indigo-600 flex-shrink-0"
        >
          It's a Match!
        </h2>

        <img
          src="https://image.tmdb.org/t/p/w500${this.movie.poster_path}"
          alt="${this.movie.title}"
          class="w-full h-64 object-contain rounded-lg shadow-md flex-shrink-0"
        />

        <div class="flex flex-col flex-1 overflow-hidden">
          <h3 class="text-2xl font-semibold flex-shrink-0">
            ${this.movie.title}
            <span class="text-gray-500 text-base">
              (${this.movie.release_date ? new Date(this.movie.release_date).getFullYear() : ''})
            </span>
          </h3>

          <p class="text-gray-700 mt-2 flex-1 overflow-y-auto pr-1">
            ${this.movie.overview || 'No description available.'}
          </p>
        </div>

        <button
          @click=${this.onClose}
          class="btn btn-primary w-full flex-shrink-0 mt-4"
        >
          Close
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'movie-match-result-modal': MovieMatchResultModal;
  }
}
