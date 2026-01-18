import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { type Movie } from '../models/models';
import { tailwindStyles } from '../utils/app.constants';
import './genre-badges.component';
import './figure-video.component';

@customElement('movie-preview-modal')
export class MoviePreviewModal extends LitElement {
  static styles = css`
    ${tailwindStyles}
  `;

  @property({ type: Object }) movie!: Movie;
  @property() onClose!: () => void;

  @state() private showContent = true;

  // Close handler to reset content visibility when the dialog is closed
  private closeHandler = () => {
    this.showContent = false;
  };

  connectedCallback() {
    super.connectedCallback();
    this.closest('dialog')?.addEventListener('close', this.closeHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.closest('dialog')?.removeEventListener('close', this.closeHandler);
  }

  render() {
    if (!this.showContent) return html``;

    return html`
      <div
        class="max-height-modal p-6 gap-3 flex flex-col overflow-hidden bg-base-100 text-base-content rounded-2xl shadow-2xl"
      >
        <figure-video-component .movie=${this.movie}></figure-video-component>

        <div class="flex gap-3 flex-col flex-1 overflow-hidden">
          <h3 class="text-2xl font-semibold flex-shrink-0">
            ${this.movie.title}
            <span class="text-base-content/70 text-base">
              (${this.movie.release_date ? new Date(this.movie.release_date).getFullYear() : ''})
            </span>
          </h3>

          <div class="flex gap-2 overflow-hidden whitespace-nowrap flex-shrink-0">
            <genre-badges .genreIds=${this.movie.genre_ids} .scrollable=${true}></genre-badges>
          </div>

          <div
            class="overflow-y-auto rounded-lg border border-base-300 bg-base-200/60 p-2 flex-1 text-sm text-base-content/70"
          >
            ${this.movie.overview || 'No description available.'}
          </div>
        </div>

        <button @click=${this.onClose} class="btn btn-primary w-full flex-shrink-0">Close</button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'movie-preview-modal': MoviePreviewModal;
  }
}
