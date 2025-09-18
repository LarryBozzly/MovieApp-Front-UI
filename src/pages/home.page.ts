import { LitElement, html, css } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { appStore, selectedCategory, selectIsLoading, selectMovies, selectPage, type AppState } from '../store/app-store';
import '../components/trending-movies.component';
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

  private observer!: IntersectionObserver;
  @query('#sentinel') private sentinel!: HTMLElement;

  constructor() {
    super();
  }

  async firstUpdated() {
    if (!this.movies.length) {
      this.appState.onInit();
    }
    this.setupInfiniteScroll();
  }

  private setupInfiniteScroll() {
    this.observer = new IntersectionObserver(
      async (entries) => {
        const [target] = entries;
        if (target.isIntersecting && !this.isLoading) {
          await this.appState.fetchTrendingMovies(this.page + 1);
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

  private renderCategoryComponent() {
    switch (this.selectedCategory) {
      case MovieCategory.TRENDING:
        return html`
          <trending-movies-component
            .isLoading=${this.isLoading}
            .hasHeartIcon=${true}
            .movies=${this.movies}>
          </trending-movies-component>
        `;
      case MovieCategory.TOP_RATED:
        return html`
          <top-rated-movies-component
            .isLoading=${this.isLoading}
            .movies=${this.movies}>
          </top-rated-movies-component>
        `;
      case MovieCategory.FAVORITES:
        return html`
          <favorites-movies-component
            .isLoading=${this.isLoading}
            .movies=${this.movies}>
          </favorites-movies-component>
        `;
      default:
        return null;
    }
  }


  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
  }

  render() {
    return html`
      <categories-component .selectedCategory=${this.selectedCategory}></categories-component>
      ${this.renderCategoryComponent()}
      <div id="sentinel" class="w-full"></div>
    `;
  }
}