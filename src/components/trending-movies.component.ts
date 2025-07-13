import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Movie } from '../models/models';
import { tailwindStyles } from '../utils/app.constants';

@customElement('trending-movies-component')
export class TrendingMoviesComponent extends LitElement {
  static styles = css`
    ${tailwindStyles}
  `;

  @property() movies: Movie[] = [];
  @property() isLoading!: boolean;

  private formatDate(dateString: string): string {
    if (!dateString) return 'N/A'; // Handle cases where dateString might be empty
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  render() {
    return html`
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
        ${this.movies.map(movie => html`
          <div class="card bg-base-100 shadow-xl rounded-xl overflow-hidden flex flex-col h-full">
            <figure class="flex-shrink-0">
              <img
                class="h-64 object-contain"
                src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
                alt="${movie.title}"
              />
            </figure>
            <div class="card-body p-4 flex flex-col flex-grow">
              <h2 class="card-title text-xl font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
                ${movie.title}
              </h2>
              <p class="text-sm text-gray-600 mb-2">${this.formatDate(movie.release_date)}</p>
              <div class="flex items-center gap-3 mt-auto">
                <span class="text-yellow-500 text-lg">★</span>
                <span class="text-base text-gray-700 font-medium">${movie.vote_average.toFixed(1)}</span>
                <span class="badge badge-outline text-xs bg-gray-100 text-gray-600 border-gray-200">
                  Popularity: ${movie.percentage_popularity}
                </span>
              </div>
            </div>
          </div>
        `)}
        ${this.isLoading ? html`
          <div class="col-span-full flex justify-center items-center ${this.movies.length ? 'min-h-[10vh]' : 'min-h-[calc(100vh-theme(spacing.16))]'}">
            <span class="loading loading-dots w-14 text-primary"></span>
          </div>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'trending-movies-component': TrendingMoviesComponent;
  }
}