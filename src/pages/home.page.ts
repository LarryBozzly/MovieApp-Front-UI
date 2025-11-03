import { LitElement, html, css } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import {
  appStore,
  selectedCategory,
  selectIsLoading,
  selectisNavbarVisible,
  selectIsOnInitLoaded,
  selectMaxPage,
  selectMovies,
  selectPage,
  selectQuery,
  type AppState
} from '../store/app-store';

import '../components/movies-list.component';
import '../components/categories.component';
import '../components/invite-fab.component';
import { tailwindStyles } from '../utils/app.constants';
import { watch, watchWithSelector } from 'zustand-lit';
import { MovieCategory, type Movie } from '../models/models';

@customElement('home-page')
export class HomePage extends LitElement {
  @watch(appStore) appState!: AppState;
  @watchWithSelector({ store: appStore, selector: selectIsLoading }) readonly isLoading!: boolean;
  @watchWithSelector({ store: appStore, selector: selectMovies }) readonly movies!: Movie[];
  @watchWithSelector({ store: appStore, selector: selectPage }) readonly page!: number;
  @watchWithSelector({ store: appStore, selector: selectQuery }) readonly query!: string;
  @watchWithSelector({ store: appStore, selector: selectMaxPage }) readonly maxPage!: number;
  @watchWithSelector({ store: appStore, selector: selectedCategory }) readonly selectedCategory!: MovieCategory;
  @watchWithSelector({ store: appStore, selector: selectIsOnInitLoaded }) readonly selectIsOnInitLoaded!: boolean;
  @watchWithSelector({ store: appStore, selector: selectisNavbarVisible }) readonly isNavbarVisible!: boolean;

  static styles = css`
    ${tailwindStyles}
    :host {
      display: flex;
      flex-direction: column;
      height: 100dvh;
      font-family: system-ui, sans-serif;
    }
    main {
     position: fixed;
     inset: 0;
     top:64px;
     overflow: auto;
     -webkit-overflow-scrolling: touch;
    }
  `;

  private observer!: IntersectionObserver;
  private _removeScrollListener?: () => void;
  @query('#sentinel') private sentinel!: HTMLElement;
  @query('main') private mainContent!: HTMLElement;

  async firstUpdated() {
    if (!this.movies.length) {
      this.appState.onInit();
    }
    this.setupInfiniteScroll();
    this.setupScrollListener();
  }

  private scrollToTop() {
    this.mainContent.scrollTo({ top: 0, behavior: "auto" });
  }

  private onCategoryChanged(e: CustomEvent<{ category: MovieCategory }>) {
    const category = e.detail.category;
    this.scrollToTop();
    this.appState.fetchCategoryMovies(category, 1);
  }

  private onSearchInput(e: CustomEvent<{ query: string }>) {
    const query = e.detail.query;
    this.scrollToTop();
    this.appState.fetchCategoryMovies(undefined, 1, query);
  }

  private async loadNextPage() {
    if (this.page >= this.maxPage) return;
    const nextPage = this.page + 1;

    if (this.selectedCategory === MovieCategory.TRENDING) {
      await this.appState.fetchTrendingMovies(nextPage);
    } else if (this.selectedCategory === MovieCategory.TOP_RATED) {
      await this.appState.fetchTopRatedMovies(nextPage);
    } else if (this.selectedCategory === MovieCategory.FAVORITES) {
      await this.appState.fetchFavoriteMovies(nextPage);
    } else {
      await this.appState.fetchFindMovie(nextPage, this.query);
    }
  }

  private setupScrollListener() {
    const onScroll = () => {
      const hideNavbar = this.mainContent.scrollTop < 17;
      this.appState.setNavbarVisibility(hideNavbar);
    };

    onScroll();
    this.mainContent.addEventListener('scroll', onScroll);
    this._removeScrollListener = () => this.mainContent.removeEventListener('scroll', onScroll);
  }

  private setupInfiniteScroll() {
    const getRootMargin = () => {
      const appWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--app-width')) || 800;
      return `0px 0px ${appWidth / 2}px 0px`;
    };

    this.observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || this.isLoading) return;
        await this.loadNextPage();
      },
      {
        root: this.mainContent,
        rootMargin: getRootMargin(),
        threshold: 0,
      }
    );

    if (this.sentinel) this.observer.observe(this.sentinel);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
    this._removeScrollListener?.();
  }

  render() {
    return html`
      <main>
        <div class="w-full z-25 fixed ${this.isNavbarVisible ? '' : 'top-0 bg-base-100 custom-shadow'}">
          <categories-component
            .selectIsOnInitLoaded=${this.selectIsOnInitLoaded}
            .selectedCategory=${this.selectedCategory}
            @onCategoryChanged=${this.onCategoryChanged}
            @onSearchInput=${this.onSearchInput}>
          </categories-component>
        </div>
        <movies-list-component
           class="block pt-[116px] sm:pt-[72px]"
          .isLoading=${this.isLoading}
          .movies=${this.movies}>
        </movies-list-component>

        <div id="sentinel"></div>
      </main>

      <invite-fab></invite-fab>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'home-page': HomePage;
  }
}
