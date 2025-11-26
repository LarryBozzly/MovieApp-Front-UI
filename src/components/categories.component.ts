import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';
import { MovieCategory, MovieCategoryMap } from '../models/models';
import '../components/search.component';
import { OutlineChevronLeftIcon, SearchIcon } from './icons/icons';

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
  @state() private searchOpen = false;

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

  private openSearch() {
    this.searchOpen = true;
  }

  private closeSearch() {
    this.searchOpen = false;
  }

  render() {
    if (!this.selectIsOnInitLoaded) return html``;

    return html`
      <div class="p-4 flex items-center gap-3 w-full">
        ${!this.searchOpen
          ? html`
              <div class="flex items-center overflow-x-auto gap-2 scrollbar-hide w-full">
                <button class="btn" @click=${this.openSearch}>
                  ${SearchIcon('w-6 h-6 text-primary')}
                </button>

                ${Object.entries(this.categoriesMap).map(
                  ([category, label]) => html`
                    <button
                      class="flex-shrink-0 btn btn-sm rounded-md
                        ${this.selectedCategory === category
                        ? 'btn-primary'
                        : 'btn-neutral-content'}"
                      @click=${() => this.handleCategoryClick(category as MovieCategory)}
                    >
                      ${label}
                    </button>
                  `
                )}
              </div>
            `
          : ''}
        ${this.searchOpen
          ? html`
              <div class="flex flex-row gap-2 w-full">
                <button class="btn" @click=${this.closeSearch}>
                  ${OutlineChevronLeftIcon('w-8 h-8 text-primary')}
                </button>
                <search-component></search-component>
              </div>
            `
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'categories-component': CategoriesComponent;
  }
}
