import { LitElement, css, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { WatchlistState, Movie, AppError } from '@models/models.ts';
import { tailwindStyles } from '@utils/app.constants.ts';
import {
  FilledBookmarkIcon,
  NoImageIcon,
  OutlineBookmarkIcon,
  RetryIcon,
  StarIcon,
} from '@ui/icons';
import { formatCompactCount } from '@utils/format-compact-count.ts';
import { appStore, selectWatchlistIds } from '@store/app-store.ts';
import { watchWithSelector } from 'zustand-lit';

@customElement('movies-list-component')
export class MoviesListComponent extends LitElement {
  @watchWithSelector({ store: appStore, selector: selectWatchlistIds })
  readonly watchlistIds!: Record<number, WatchlistState>;
  static styles = [tailwindStyles, css``];

  @property({ type: Array }) movies: Movie[] = [];
  @property({ type: Boolean }) isLoading!: boolean;
  @property({ type: Object }) error!: AppError | null;

  private formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { year: 'numeric' });
  }

  private renderErrorState(error: AppError): TemplateResult {
    return html`
      <div
        class="col-span-full flex justify-center items-center
        ${this.movies.length ? 'mt-2' : 'min-h-[25vh]'}"
      >
        <button @click=${error.retry} class="btn btn-ghost btn-circle w-14 h-auto" title="Retry">
          ${RetryIcon('w-14 h-14 text-primary')}
        </button>
      </div>
    `;
  }

  private renderLoadingIndicator(): TemplateResult {
    return html`
      <div
        class="col-span-full flex justify-center items-center
          ${this.movies.length ? 'mt-2' : 'min-h-[25vh]'}"
      >
        <span class="loading loading-dots w-14 text-primary"></span>
      </div>
    `;
  }

  private renderStatus(): TemplateResult | null {
    if (this.error) return this.renderErrorState(this.error);
    if (this.isLoading) return this.renderLoadingIndicator();
    return null;
  }

  private async handleWatchlistClick(event: Event, movie: Movie): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const { addToWatchlist, removeFromWatchlist } = appStore.getState();
    const isWatchlisted = Boolean(this.watchlistIds[movie.id]?.isWatchlist);

    await (isWatchlisted ? removeFromWatchlist(movie) : addToWatchlist(movie));
  }

  private renderWatchlistIcon(movie: Movie) {
    const watchlistItem = this.watchlistIds[movie.id];
    if (watchlistItem?.isLoading)
      return html` <span class="loading loading-spinner w-6 h-6 text-primary"></span> `;
    const isWatchlisted = Boolean(watchlistItem?.isWatchlist);
    return isWatchlisted ? FilledBookmarkIcon() : OutlineBookmarkIcon();
  }

  private disableContextMenu(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  private openMoviePreviewModal(event: Event, movie: Movie) {
    event.preventDefault();
    event.stopPropagation();

    appStore.getState().openMoviePreviewModal(movie);
  }

  private handleImageError(event: Event, clickHandler?: (e: Event) => void) {
    event.preventDefault();
    event.stopPropagation();

    const img = event.target as HTMLImageElement;

    if (img.dataset.fallback === 'true') return;
    const svg = new DOMParser().parseFromString(
      NoImageIcon().strings.join(''),
      'image/svg+xml'
    ).documentElement;

    svg.setAttribute('class', 'w-full h-full text-base-content/40 select-none cursor-pointer');
    if (clickHandler) svg.addEventListener('click', clickHandler);
    svg.dataset.fallback = 'true';
    img.replaceWith(svg);
  }

  render() {
    return html`
      <div
        class="flex flex-col gap-2 px-3 sm:grid sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:gap-4 sm:px-4 pt-0 pb-4 bg-base-300"
      >
        ${this.movies.map(
          (movie, index) => html`
            <div
              class="card bg-base-100 shadow-xl rounded-xl overflow-hidden flex sm:flex-col flex-row h-full"
            >
              <figure
                class="relative w-20 sm:w-auto flex-shrink-0 aspect-[2/3] overflow-hidden rounded-lg m-2 sm:m-0"
              >
                <img
                  fetchpriority=${index < 6 ? 'high' : 'auto'}
                  @click=${(event: Event) => this.openMoviePreviewModal(event, movie)}
                  draggable="false"
                  class="w-full h-full object-cover select-none cursor-pointer"
                  src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
                  alt="${movie.title}"
                  @contextmenu=${this.disableContextMenu}
                  @error=${(event: Event) =>
                    this.handleImageError(event, (ev: Event) =>
                      this.openMoviePreviewModal(ev, movie)
                    )}
                />
              </figure>
              <div class="card-body p-3 flex flex-col flex-grow min-w-0">
                <h2
                  class="card-title text-sm font-semibold text-base-content leading-tight line-clamp-2"
                >
                  <span
                    @click=${(event: Event) => this.openMoviePreviewModal(event, movie)}
                    class="inline cursor-pointer"
                  >
                    ${movie.title}
                    <span class="font-normal text-base-content/50">
                      ${movie.release_date ? `(${this.formatDate(movie.release_date)})` : ''}
                    </span>
                  </span>
                </h2>
                <!-- rating + meta row: all breakpoints -->
                <div class="flex items-center gap-1.5 text-xs mt-auto">
                  ${movie.vote_average != null
                    ? html`
                        ${StarIcon('w-3.5 h-3.5 text-warning flex-shrink-0')}
                        <span class="font-semibold text-base-content/80">
                          ${movie.vote_average.toFixed(1)}
                        </span>
                        <span class="text-base-content/30">·</span>
                      `
                    : ''}
                  <span class="text-base-content/50">${formatCompactCount(movie.vote_count)}</span>

                  <button
                    @click=${(event: Event) => this.handleWatchlistClick(event, movie)}
                    class="ml-auto flex items-center justify-center w-6 h-6 focus:outline-none"
                    title="Toggle watchlist"
                    ?disabled=${this.watchlistIds[movie.id]?.isLoading}
                  >
                    ${this.renderWatchlistIcon(movie)}
                  </button>
                </div>
              </div>
            </div>
          `
        )}
        ${this.renderStatus()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'movies-list-component': MoviesListComponent;
  }
}
