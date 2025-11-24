import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';
import { MovieCategory, MovieCategoryMap } from '../models/models';
import '../components/search.component';

@customElement('categories-component')
export class CategoriesComponent extends LitElement {
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

  @property() selectedCategory!: MovieCategory;
  @property() selectIsOnInitLoaded!: boolean;

  private readonly categoriesMap: Record<MovieCategory, string> = MovieCategoryMap;

  private handleCategoryClick(category: MovieCategory) {
    if (category === this.selectedCategory) return;

    this.dispatchEvent(
      new CustomEvent('onCategoryChanged', {
        detail: { category },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    if (!this.selectIsOnInitLoaded) return html``;
    return html`
      <div class="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex overflow-x-auto gap-2 sm:gap-4 scrollbar-hide order-2 sm:order-1">
          ${Object.entries(this.categoriesMap).map(
            ([category, label]) => html`
              <button
                class="flex-shrink-0 btn btn-sm rounded-md
                ${this.selectedCategory === category ? 'btn-primary' : 'btn-neutral-content'}"
                @click=${() => this.handleCategoryClick(category as MovieCategory)}
              >
                ${label}
              </button>
            `
          )}
        </div>

        <div class="w-full sm:w-80 order-1 sm:order-2">
          <search-component></search-component>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'categories-component': CategoriesComponent;
  }
}
