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
  selectNotifications,
  selectPage,
  selectQuery,
  type AppState,
} from '../store/app-store';

import '@ui/components/movies-list.component';
import '@ui/components/categories.component';
import '@ui/components/invite-fab.component';
import { tailwindStyles } from '../utils/app.constants';
import { watch, watchWithSelector } from 'zustand-lit';
import { MovieCategory, type Movie, type Notification, type UserProfile } from '@models/models';
import { authStore, selectUserProfile } from '@store/auth-store';

@customElement('home-page')
export class HomePage extends LitElement {
  @watch(appStore) appState!: AppState;
  @watchWithSelector({ store: appStore, selector: selectIsLoading }) readonly isLoading!: boolean;
  @watchWithSelector({ store: appStore, selector: selectMovies }) readonly movies!: Movie[];
  @watchWithSelector({ store: appStore, selector: selectPage }) readonly page!: number;
  @watchWithSelector({ store: appStore, selector: selectQuery }) readonly query!: string;
  @watchWithSelector({ store: appStore, selector: selectMaxPage }) readonly maxPage!: number;
  @watchWithSelector({ store: appStore, selector: selectedCategory })
  readonly selectedCategory!: MovieCategory;
  @watchWithSelector({ store: appStore, selector: selectIsOnInitLoaded })
  readonly selectIsOnInitLoaded!: boolean;
  @watchWithSelector({ store: appStore, selector: selectisNavbarVisible })
  readonly isNavbarVisible!: boolean;
  @watchWithSelector({ store: authStore, selector: selectUserProfile })
  readonly userProfile!: UserProfile;
  @watchWithSelector({ store: appStore, selector: selectNotifications })
  readonly notifications!: Notification[];

  static styles = css`
    ${tailwindStyles}

    :host {
      display: flex;
      flex-direction: column;
      height: 100dvh;
      font-family: system-ui, sans-serif;
    }

    main {
      position: absolute;
      inset: 64px 0px 0px; /* height of navbar */
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
  `;

  private observer?: IntersectionObserver;
  private _removeScrollListener?: () => void;
  private resizeObserver?: ResizeObserver;

  @query('#sentinel') private sentinel!: HTMLElement;
  @query('main') private mainContent!: HTMLElement;
  @query('movies-list-component') private moviesListComponent!: HTMLElement;

  async firstUpdated() {
    if (!this.movies.length) {
      this.appState.onInit();
    }

    this.setupInfiniteScroll();
    this.setupScrollListener();
    this._setupResizeObserver();
  }

  private scrollToTop() {
    this.mainContent?.scrollTo({ top: 0, behavior: 'auto' });
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
    } else if (this.selectedCategory === MovieCategory.WATCHLIST) {
      await this.appState.fetchWatchlistMovies(nextPage);
    } else {
      await this.appState.fetchFindMovie(nextPage, this.query);
    }
  }

  private setupScrollListener() {
    if (!this.mainContent) return;

    const onScroll = () => {
      const hideNavbar = this.mainContent.scrollTop < 18;
      this.appState.setNavbarVisibility(hideNavbar);
    };

    onScroll();
    this.mainContent.addEventListener('scroll', onScroll);
    this._removeScrollListener = () => this.mainContent.removeEventListener('scroll', onScroll);
  }

  // IntersectionObserver setup
  private _setupObserver() {
    if (!this.sentinel || !this.mainContent) return;

    if (this.observer) {
      this.observer.disconnect();
    }

    const getRootMargin = () => {
      if (!this.moviesListComponent) return '0px 0px 0px 0px';
      const contentHeight = this.moviesListComponent.scrollHeight;
      return `0px 0px ${contentHeight * 0.5}px 0px`; // 50% of content height
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

    this.observer.observe(this.sentinel);
  }

  private setupInfiniteScroll() {
    this._setupObserver();
  }

  private _recreateObserver() {
    this._setupObserver();
  }

  private _setupResizeObserver() {
    if (!this.moviesListComponent) return;

    this.resizeObserver = new ResizeObserver(() => {
      this._recreateObserver();
    });

    this.resizeObserver.observe(this.moviesListComponent);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
    this.resizeObserver?.disconnect();
    this._removeScrollListener?.();
    this.appState.setNavbarVisibility(true);
  }

  render() {
    return html`
      <div
        style="z-index: 1;"
        id="fixed top-0 left-0 w-full flex"
        class="${this.isNavbarVisible ? 'pt-[64px] bg-transparent' : 'bg-base-100 custom-shadow'}"
      >
        <categories-component
          .notifications=${this.notifications}
          .isNavbarVisible=${this.isNavbarVisible}
          .userProfile=${this.userProfile}
          .selectIsOnInitLoaded=${this.selectIsOnInitLoaded}
          .selectedCategory=${this.selectedCategory}
          .query=${this.query}
          @onCategoryChanged=${this.onCategoryChanged}
          @onSearchInput=${this.onSearchInput}
        ></categories-component>
      </div>

      <main>
        <movies-list-component
          class="block pt-18"
          .isLoading=${this.isLoading}
          .movies=${this.movies}
        ></movies-list-component>

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
