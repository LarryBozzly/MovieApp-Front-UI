import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';
import {
  MovieCategory,
  MovieCategoryMap,
  type Notification,
  type UserProfile,
} from '../models/models';
import { OutlineChevronLeftIcon, SearchIcon } from './icons/icons';
import '../components/search.component';
import '../components/profile-button.component';

@customElement('categories-component')
export class CategoriesComponent extends LitElement {
  static styles = css`
    ${tailwindStyles}
  `;

  @property() selectedCategory!: MovieCategory;
  @property({ type: Boolean }) selectIsOnInitLoaded!: boolean;
  @property({ type: Boolean }) isNavbarVisible!: boolean;
  @property({ type: Object }) userProfile!: UserProfile;
  @property({ type: Array }) notifications: Notification[] = [];
  @property() query!: string;

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

  connectedCallback() {
    super.connectedCallback();
    this.searchOpen = this.query.length > 0;
  }

  private openSearch() {
    this.searchOpen = true;
  }

  private closeSearch() {
    this.searchOpen = false;
    const hasCategory = Boolean(this.selectedCategory);
    this.handleCategoryClick(hasCategory ? this.selectedCategory : MovieCategory.TRENDING);
  }

  render() {
    if (!this.selectIsOnInitLoaded) return html``;

    return html`
      <div class="p-2 h-16 flex items-center gap-3 w-full">
        ${!this.searchOpen
          ? html`
              <button class="btn btn-ghost btn-circle" @click=${this.openSearch}>
                ${SearchIcon('w-6 h-6 text-primary')}
              </button>
              <div
                class="flex items-center overflow-x-auto gap-2 scrollbar-hide w-full scroll-fade"
              >
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
                <button class="btn btn-ghost btn-circle" @click=${this.closeSearch}>
                  ${OutlineChevronLeftIcon('w-8 h-8 text-primary')}
                </button>
                <search-component .query=${this.query}></search-component>
              </div>
            `
          : ''}
        ${!this.isNavbarVisible
          ? html` <profile-button-component
              .notifications=${this.notifications}
              .userProfile=${this.userProfile}
            ></profile-button-component>`
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
