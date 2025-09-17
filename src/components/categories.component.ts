import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';

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

  // Default categories, but you can pass in others if needed
  @property({ type: Array })
  categories: string[] = ['Popular', 'Top Rated', 'Upcoming'];

  @state()
  private selectedCategory: string = this.categories[0];

  private handleCategoryClick(category: string) {
    this.selectedCategory = category;

    // Emit event to parent with the selected category
    this.dispatchEvent(
      new CustomEvent('category-selected', {
        detail: { category },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <div class="flex overflow-x-auto gap-2 sm:gap-4 p-2 sm:p-4 scrollbar-hide">
        ${this.categories.map((cat) => html`
            <button
              class="flex-shrink-0 px-3 py-1 sm:px-4 sm:py-2 rounded-xl font-medium transition text-sm sm:text-base
                ${this.selectedCategory === cat
        ? 'bg-primary text-primary-content shadow'
        : 'bg-base-200 hover:bg-base-300 text-base-content'}"
              @click=${() => this.handleCategoryClick(cat)}
            >
              ${cat}
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
