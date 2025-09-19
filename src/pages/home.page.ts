import { LitElement, html, css } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import {
  appStore,
  selectedCategory,
  selectIsLoading,
  selectMovies,
  selectPage,
  type AppState
} from '../store/app-store';

import '../components/movies-list.component';
import '../components/categories.component';
import { tailwindStyles } from '../utils/app.constants';
import { watch, watchWithSelector } from 'zustand-lit';
import { MovieCategory, type Movie } from '../models/models';

@customElement('home-page')
export class HomePage extends LitElement {
  @watch(appStore) appState!: AppState;
  @watchWithSelector({ store: appStore, selector: selectIsLoading }) readonly isLoading!: boolean;
  @watchWithSelector({ store: appStore, selector: selectMovies }) readonly movies!: Movie[];
  @watchWithSelector({ store: appStore, selector: selectPage }) readonly page!: number;
  @watchWithSelector({ store: appStore, selector: selectedCategory }) readonly selectedCategory!: MovieCategory;

  static styles = css`
   ${tailwindStyles}
    :host {
      width: 100%;
      display: block;
      min-height: 100vh;
      background: #f0f0f0;
      font-family: system-ui, sans-serif;
    }
  `;

  get showHeart(): boolean {
    return this.selectedCategory !== MovieCategory.FAVORITES;
  }

  private observer!: IntersectionObserver;
  @query('#sentinel') private sentinel!: HTMLElement;

  async firstUpdated() {
    if (!this.movies.length) {
      this.appState.onInit();
    }
    this.setupInfiniteScroll();
  }

  private onCategoryChanged(e: CustomEvent<{ category: MovieCategory }>) {
    const category = e.detail.category;
    appStore.getState().setCategory(category);
    appStore.getState().clearMovies();
    this.appState.fetchCategoryMovies(category, 1);
  }

  private setupInfiniteScroll() {
    this.observer = new IntersectionObserver(
      async (entries) => {
        const [target] = entries;
        if (target.isIntersecting && !this.isLoading) {
          await this.appState.fetchCategoryMovies(this.selectedCategory, this.page + 1);
        }
      },
      {
        root: null,
        rootMargin: '50%',
        threshold: 0.1
      }
    );

    if (this.sentinel) {
      this.observer.observe(this.sentinel);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
  }

  render() {
    return html`
      <categories-component 
        .selectedCategory=${this.selectedCategory}
        @onCategoryChanged=${this.onCategoryChanged}>
      </categories-component>

      <movies-list-component
        .isLoading=${this.isLoading}
        .hasHeartIcon=${this.showHeart}
        .movies=${this.movies}>
      </movies-list-component>

      <div id="sentinel" class="w-full"></div>
    `;
  }
} 

declare global {
  interface HTMLElementTagNameMap {
    'home-page': HomePage;
  }
}
