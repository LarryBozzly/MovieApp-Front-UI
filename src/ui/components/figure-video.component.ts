import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { tailwindStyles } from '../../utils/app.constants';
import { NoImageIcon, PlayIcon } from '../icons/icons';
import type { Movie } from '../../models/models';
import { appStore } from '../../store/app-store';

@customElement('figure-video-component')
export class FigureVideoComponent extends LitElement {
  static styles = css`
    ${tailwindStyles}
  `;

  @property({ type: Object }) movie!: Movie;
  @property({ type: Boolean }) closeVideo!: boolean;

  @state() private trailerKey: string | undefined = undefined;
  @state() private isLoadingTrailer = false;

  private disableContextMenu(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  private getPosterUrl(movie: Movie): string {
    // Matches the size used in the render method ('w500')
    return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
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

  private async handlePlayClick(e: Event) {
    e.preventDefault();
    e.stopPropagation();

    const movieId = this.movie.id;

    this.isLoadingTrailer = true;
    const trailerKey = await appStore.getState().fetchMovieTrailer(movieId);

    /* here we check if the movieId matches to prevent race conditions */
    if (this.movie.id !== movieId) return;

    this.trailerKey = trailerKey;
    if (!trailerKey) this.isLoadingTrailer = false;
  }

  protected updated(changedProperties: Map<string | PropertyKey, unknown>): void {
    super.updated(changedProperties);

    if (changedProperties.has('movie')) {
      this.isLoadingTrailer = false;
      this.trailerKey = undefined;
    }
  }

  render() {
    const isTrailer = !!this.trailerKey;

    return html`
      <figure class="relative w-full h-64 flex-shrink-0 bg-base-200 rounded-lg overflow-hidden">
        ${isTrailer
          ? html`
              <iframe
                class="w-full h-full"
                src="https://www.youtube.com/embed/${this.trailerKey}?autoplay=1"
                frameborder="0"
                allow="autoplay; encrypted-media"
                allowfullscreen
                @load=${() => (this.isLoadingTrailer = false)}
              ></iframe>
            `
          : html`
              <img
                draggable="false"
                src="${this.getPosterUrl(this.movie)}"
                alt="${this.movie.title}"
                class="w-full h-full object-contain select-none"
                @contextmenu=${this.disableContextMenu}
                @error=${this.handleImageError}
              />
            `}
        ${this.isLoadingTrailer
          ? html`
              <div
                class="absolute inset-0 flex items-center justify-center ${isTrailer
                  ? 'bg-black'
                  : 'bg-base-100/80'}"
              >
                <span class="loading loading-spinner loading-lg"></span>
              </div>
            `
          : !isTrailer
            ? html`
                <button
                  class="absolute inset-0 flex items-center justify-center opacity-75 cursor-pointer"
                  aria-label="Play trailer"
                  @click=${this.handlePlayClick}
                >
                  ${PlayIcon('w-16 h-16 text-primary')}
                </button>
              `
            : ''}
      </figure>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'figure-video-component': FigureVideoComponent;
  }
}
