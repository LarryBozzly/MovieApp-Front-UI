import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { type Movie } from '../models/models';
import { tailwindStyles } from '../utils/app.constants';
import './genre-badges.component';
import { NoImageIcon, PlayIcon } from './icons/icons';
import { appStore } from '../store/app-store';

@customElement('movie-preview-modal')
export class MoviePreviewModal extends LitElement {
  static styles = css`
    ${tailwindStyles}
  `;

  @property({ type: Object }) movie!: Movie;
  @property() onClose!: () => void;
  @state() private trailerKey: string | undefined = undefined;
  @state() private isLoadingTrailer: boolean = false;

  private closeHandler = () => {
    this.trailerKey = undefined;
  };

  connectedCallback() {
    super.connectedCallback();
    this.closest('dialog')?.addEventListener('close', this.closeHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.closest('dialog')?.removeEventListener('close', this.closeHandler);
  }

  private disableContextMenu(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  private async handlePlayClick(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.isLoadingTrailer = true;
    this.trailerKey = await appStore.getState().fetchMovieTrailer(this.movie.id);
  }

  private handleImageError(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const img = event.target as HTMLImageElement;
    const svg = new DOMParser().parseFromString(
      NoImageIcon().strings.join(''),
      'image/svg+xml'
    ).documentElement;
    svg.setAttribute('class', 'w-full h-64 text-base-content/40 bg-base-200 select-none');
    img.replaceWith(svg);
  }

  private get trailerEmbedUrl(): string | null {
    if (!this.trailerKey) return null;
    return `https://www.youtube.com/embed/${this.trailerKey}?autoplay=1`;
  }

  private renderFigureContent() {
    if (this.trailerEmbedUrl) {
      return html`
        <iframe
          class="w-full h-full"
          src="${this.trailerEmbedUrl}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          @load=${() => (this.isLoadingTrailer = false)}
        ></iframe>
        ${this.isLoadingTrailer
          ? html`
              <div class="absolute inset-0 flex items-center justify-center bg-black">
                <span class="loading loading-spinner loading-lg"></span>
              </div>
            `
          : ''}
      `;
    }

    return html`
      <img
        draggable="false"
        src="https://image.tmdb.org/t/p/w500${this.movie.poster_path}"
        alt="${this.movie.title}"
        class="w-full h-full object-contain select-none"
        @contextmenu=${this.disableContextMenu}
        @error=${this.handleImageError}
      />

      ${this.isLoadingTrailer
        ? html`
            <div class="absolute inset-0 flex items-center justify-center bg-base-100/80">
              <span class="loading loading-spinner loading-lg"></span>
            </div>
          `
        : html`
            <button
              class="absolute inset-0 flex items-center justify-center opacity-75 cursor-pointer"
              aria-label="Play trailer"
              @click=${this.handlePlayClick}
            >
              <div
                class="w-16 h-16 rounded-full bg-primary-content/80 text-base-content flex items-center justify-center"
              >
                ${PlayIcon('w-16 h-16')}
              </div>
            </button>
          `}
    `;
  }
  render() {
    return html`
      <div
        class="max-height-modal p-6 gap-3 flex flex-col overflow-hidden bg-base-100 text-base-content rounded-2xl shadow-2xl"
      >
        <figure class="relative w-full h-64 flex-shrink-0 bg-base-200 rounded-lg overflow-hidden">
          ${this.renderFigureContent()}
        </figure>

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
