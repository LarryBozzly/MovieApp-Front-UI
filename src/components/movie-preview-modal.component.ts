import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type Movie } from '../models/models';
import { tailwindStyles } from '../utils/app.constants';
import './genre-badges.component';

@customElement('movie-preview-modal')
export class MoviePreviewModal extends LitElement {
  static styles = css`
    ${tailwindStyles}
  `;

  @property({ type: Object }) movie!: Movie;
  @property({ type: Function }) onClose!: () => void;
 
  render() {
    return html`
      <div
        class="p-6 gap-3 flex flex-col max-h-[90vh] overflow-hidden bg-base-100 text-base-content rounded-2xl shadow-2xl"
      >
        <img
          src="https://image.tmdb.org/t/p/w500${this.movie.poster_path}"
          alt="${this.movie.title}"
          class="w-full h-64 object-contain rounded-lg shadow-md flex-shrink-0 bg-base-200"
        />

        <div class="flex gap-3 flex-col flex-1 overflow-hidden">
          <h3 class="text-2xl font-semibold flex-shrink-0">
            ${this.movie.title}
            <span class="text-base-content/70 text-base">
              (${this.movie.release_date ? new Date(this.movie.release_date).getFullYear() : ''})
            </span>
          </h3>

          <div class="flex gap-2 overflow-hidden whitespace-nowrap flex-shrink-0">
            <genre-badges .genreIds=${this.movie.genre_ids} .limit=${10}></genre-badges>
          </div>

          <div class="overflow-y-auto rounded-lg border border-base-300 bg-base-200/60 p-2 flex-1 text-sm text-base-content/70">
            ${this.movie.overview || 'No description available.'}
          </div>
        </div>

        <button
          @click=${this.onClose}
          class="btn btn-primary w-full flex-shrink-0"
        >
          Close
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'movie-preview-modal': MoviePreviewModal;
  }
}
