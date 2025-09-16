import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';

@customElement('categories-component')
export class CategoriesComponent extends LitElement {
  static styles = css`
    ${tailwindStyles}
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
      <div class="flex gap-4 p-4 justify-center">
        ${this.categories.map(
          (cat) => html`
            <button
              class="px-4 py-2 rounded-xl font-medium transition
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
