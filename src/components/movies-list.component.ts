import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { FavoriteState, Movie } from '../models/models.ts';
import { tailwindStyles } from '../utils/app.constants.ts';
import { getPopularityClasses } from '../utils/popularity-ui-classes.functions.ts';
import { FilledHeartIcon, NoImageIcon, OutlineHeartIcon } from './icons/icons.ts';
import { appStore, selectFavoriteIds } from '../store/app-store.ts';
import { watchWithSelector } from 'zustand-lit';

@customElement('movies-list-component')
export class MoviesListComponent extends LitElement {
  @watchWithSelector({ store: appStore, selector: selectFavoriteIds }) readonly favoritesIds!: Record<number, FavoriteState>
  static styles = css`
    ${tailwindStyles}
  `;

  @property() movies: Movie[] = [];
  @property() isLoading!: boolean;

  private formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { year: 'numeric' });
  }

  private async handleHeartClick(event: Event, movie: Movie): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const { addToFavorites, removeFromFavorites } = appStore.getState();
    const isFavorited = Boolean(this.favoritesIds[movie.id]?.isFavorite);

    await (isFavorited ? removeFromFavorites(movie) : addToFavorites(movie));
  }

  private renderHeartIcon(movie: Movie) {
    const favoriteListItem = this.favoritesIds[movie.id];
    if (favoriteListItem?.isLoading) return html`<span class="loading loading-spinner w-5 h-5 text-primary"></span>`;
    const isFavorited = Boolean(favoriteListItem?.isFavorite);
    return isFavorited ? FilledHeartIcon() : OutlineHeartIcon();
  }

  private disableContextMenu(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    return false
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

    svg.setAttribute('class', 'w-full h-64 text-base-content/40 select-none cursor-pointer');
    if (clickHandler) svg.addEventListener('click', clickHandler);
    svg.dataset.fallback = 'true';
    img.replaceWith(svg);
  }

  render() {
    return html`
      <div class="grid bg-base-300 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-0 px-4 pb-4">
        ${this.movies.map(movie => html`
          <div class="card bg-base-100 shadow-xl rounded-xl overflow-hidden flex flex-col h-full">
            <figure class="flex-shrink-0">
              <img
               @click=${(event: Event) => this.openMoviePreviewModal(event, movie)}
                draggable="false"
                class="h-64 object-contain select-none cursor-pointer"
                src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
                alt="${movie.title}"
                @contextmenu=${this.disableContextMenu}
                @error=${(event: Event) => this.handleImageError(event, (ev: Event) => this.openMoviePreviewModal(ev, movie))}
              />
            </figure>
            <div class="card-body p-4 flex flex-col flex-grow">
              <h2 class="card-title text-xl font-bold text-base-content mb-1 leading-tight line-clamp-2">
                <span
                  @click=${(event: Event) => this.openMoviePreviewModal(event, movie)}
                  class="inline cursor-pointer"
                >
                  ${movie.title}
                </span>
              </h2>
              <p class="text-sm text-base-content/50 mb-2">${this.formatDate(movie.release_date)}</p>
              <div class="flex items-center gap-3 mt-auto">
                <span class="text-yellow-500 text-lg">★</span>
                <span class="text-base text-base-content/70 font-medium">${movie.vote_average?.toFixed(1)}</span>
                <span class="badge badge-outline text-xs ${getPopularityClasses(movie.percentage_popularity)}">
                  Popularity: ${movie.percentage_popularity}%
                </span>

              <button
                @click=${(event: Event) => this.handleHeartClick(event, movie)}
                class="ml-auto focus:outline-none"
                title="Toggle Favorite"
                ?disabled=${this.favoritesIds[movie.id]?.isLoading}
              >
                ${this.renderHeartIcon(movie)}
              </button>
              </div>
            </div>
          </div>
        `)}

      ${this.isLoading ? html`
          <div class="col-span-full flex justify-center items-center
                ${this.movies.length ? 'mt-2' : 'min-h-[25vh]'}">
          <span class="loading loading-dots w-14 text-primary"></span>
        </div>
      ` : null}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'movies-list-component': MoviesListComponent;
  }
}