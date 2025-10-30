import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { MovieGenreMap, type Movie } from '../models/models';
import { tailwindStyles } from '../utils/app.constants';

@customElement('movie-match-result-modal')
export class MovieMatchResultModal extends LitElement {
  static styles = css`
    ${tailwindStyles}
  `;

  @property({ type: Object }) movie!: Movie;
  @property({ type: Function }) onClose!: () => void;
  @state() private canClose = false;

  firstUpdated() {
    setTimeout(() => (this.canClose = true), 10000);
  }

  render() {
    return html`
      <div
        class="p-6 space-y-4 flex flex-col max-h-[90vh] overflow-hidden bg-base-100 text-base-content rounded-2xl shadow-2xl"
      >
        <h2
          id="match-title"
          class="text-3xl font-extrabold text-center text-primary flex-shrink-0"
        >
          It's a Match!
        </h2>

        <img
          src="https://image.tmdb.org/t/p/w500${this.movie.poster_path}"
          alt="${this.movie.title}"
          class="w-full h-64 object-contain rounded-lg shadow-md flex-shrink-0 bg-base-200"
        />

        <div class="flex flex-col flex-1 overflow-hidden">
          <h3 class="text-2xl font-semibold flex-shrink-0">
            ${this.movie.title}
            <span class="text-base-content/70 text-base">
              (${this.movie.release_date ? new Date(this.movie.release_date).getFullYear() : ''})
            </span>
          </h3>

          <div class="flex gap-2 mt-1 overflow-x-auto whitespace-nowrap flex-shrink-0">
            ${this.movie.genre_ids.map((id) => html`
              <span class="badge badge-outline text-xs border-base-content/40 text-base-content/80">
                ${MovieGenreMap.get(id)}
              </span>
            `)}
          </div>

          <p class="mt-2 flex-1 overflow-y-auto pr-1 text-base-content/80">
            ${this.movie.overview || 'No description available.'}
          </p>
        </div>

        <button
          @click=${this.onClose}
          @click=${() => this.canClose && this.onClose()}
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
