import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';
import { MovieCategory, MovieCategoryMap } from '../models/models';
import { watchWithSelector } from 'zustand-lit';
import { appStore, selectedCategory } from '../store/app-store';

@customElement('categories-component')
export class CategoriesComponent extends LitElement {
  @watchWithSelector({ store: appStore, selector: selectedCategory })
  readonly selectedCategory!: MovieCategory;

  static styles = css`
    ${tailwindStyles}
    /* Hide scrollbar but keep scroll functionality */
    .scrollbar-hide::-webkit-scrollbar {
      display: none; 
    }
    .scrollbar-hide {
      -ms-overflow-style: none; /* IE and Edge */
      scrollbar-width: none; /* Firefox */ 
    }
  `;

  private readonly categoriesMap: Record<MovieCategory, string> = MovieCategoryMap;

  private handleCategoryClick(category: MovieCategory) {
    if (category === this.selectedCategory) return;
    appStore.getState().setCategory(category);
  }

  render() {
    return html`
      <div class="flex overflow-x-auto gap-2 sm:gap-4 p-2 sm:p-4 scrollbar-hide">
        ${Object.entries(this.categoriesMap).map(
      ([category, label]) => html`
            <button
              class="flex-shrink-0 px-3 py-1 sm:px-4 sm:py-2 rounded-xl font-medium transition text-sm sm:text-base
                ${this.selectedCategory === category
          ? 'bg-primary text-primary-content shadow'
          : 'bg-base-200 hover:bg-base-300 text-base-content'}"
              @click=${() => this.handleCategoryClick(category as MovieCategory)}
            >
              ${label}
            </button>
          `
    )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'categories-component': CategoriesComponent;
  }
}
