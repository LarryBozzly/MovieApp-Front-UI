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

  render() {
    return html`
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        ${this.movies.map(movie => html`
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              class="w-full h-64 object-contain"
              src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
              alt="${movie.title}"
            >
            <div class="p-4">
              <h3 class="text-lg wrap-break-word font-semibold text-gray-800 mb-2">${movie.title}</h3>
              <p class="text-sm text-gray-600">${movie.release_date}</p>
              <div class="mt-2 flex items-center">
                <span class="text-yellow-500">★</span>
                <span class="ml-1 text-sm text-gray-600">${movie.vote_average.toFixed(1)}</span>
                <span class="ml-1 text-sm text-gray-600">${movie.popularity}</span>
              </div>
            </div>
          </div>
        `)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'trending-movies-component': TrendingMoviesComponent;
  }
}