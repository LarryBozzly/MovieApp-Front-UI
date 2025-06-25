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
          <div class="card bg-base-100 shadow-sm w-full">
            <figure>
              <img
                class="h-64 object-contain"
                src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
                alt="${movie.title}"
              />
            </figure>
            <div class="card-body">
              <h2 class="card-title">
                ${movie.title}
              </h2>
              <p class="text-sm text-gray-600">${this.formatDate(movie.release_date)}</p>
              <div class="flex items-center gap-2 mt-2">
                <span class="text-yellow-500">★</span>
                <span class="text-sm text-gray-600">${movie.vote_average.toFixed(1)}</span>
                <span class="badge badge-outline">${movie.popularity}</span>
              </div>
            </div>
          </div>
        `)}
       ${this.isLoading ? html`
          <div class="col-span-full flex justify-center items-center ${this.movies.length ? 'min-h-[10vh]' : 'min-h-[100vh]'}">
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