import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type Movie } from '../models/models';
import { tailwindStyles } from '../utils/app.constants';
import './genre-badges.component';
import { NoImageIcon } from './icons/icons';

@customElement('movie-preview-modal')
export class MoviePreviewModal extends LitElement {
  static styles = css`
    ${tailwindStyles}
  `;

  @property({ type: Object }) movie!: Movie;
  @property({ type: Function }) onClose!: () => void;

  private disableContextMenu(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  private handleImageError(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const img = event.target as HTMLImageElement;
    const svg = new DOMParser().parseFromString(
      NoImageIcon('w-6 h-6 text-base-content/40').strings.join(''),
      'image/svg+xml'
    ).documentElement;
    svg.setAttribute('class', img.className);
    img.replaceWith(svg);
  }
  render() {
    return html`
      <div
        class="max-height-modal p-6 gap-3 flex flex-col overflow-hidden bg-base-100 text-base-content rounded-2xl shadow-2xl"
      >
        <img
          draggable="false"
          src="https://image.tmdb.org/t/p/w500${this.movie.poster_path}"
          alt="${this.movie.title}"
          class="w-full h-64 object-contain bg-base-200 flex-shrink-0 select-none"
          @contextmenu=${this.disableContextMenu}
          @error=${this.handleImageError}
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
