import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type Movie } from '../models/models';
import { tailwindStyles } from '../utils/app.constants';
import { appStore } from '../store/app-store';

@customElement('movie-match-result-modal')
export class MovieMatchResultModal extends LitElement {


  static styles = css`
      ${tailwindStyles}
  `;

  @property({ type: Object }) movie!: Movie;

  private async close() {
    await appStore.getState().closeModal();
  }
  render() {
    return html`
       <div class="p-6 space-y-6">
            <h2
              id="match-title"
              class="text-3xl font-extrabold text-center text-indigo-600"
            >
              It's a Match! 🎉
            </h2>

            <img
              src="https://image.tmdb.org/t/p/w500${this.movie.poster_path}"
              alt="${this.movie.title}"
              class="w-full h-80 object-cover rounded-lg shadow-md"
            />

            <h3 class="text-2xl font-semibold truncate">${this.movie.title}</h3>
            <p class="text-gray-700">${this.movie.overview || 'No description available.'}</p>

            <button
             @click=${this.close}
              class="btn btn-primary w-full"
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
