import { LitElement, html, css } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { appStore, selectIsLoading, selectMovies, selectPage, type AppState } from '../store/app-store';
import '../components/trending-movies.component';
import '../components/categories.component';
import { tailwindStyles } from '../utils/app.constants';
import { watch, watchWithSelector } from 'zustand-lit';
import type { Movie } from '../models/models';

@customElement('home-page')
export class HomePage extends LitElement {
  @watch(appStore) appState!: AppState;
  @watchWithSelector({ store: appStore, selector: selectIsLoading }) readonly isLoading!: boolean;
  @watchWithSelector({ store: appStore, selector: selectMovies }) readonly movies!: Movie[];
  @watchWithSelector({ store: appStore, selector: selectPage }) readonly page!: number;

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

  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
  }

  render() {
    return html`
      <categories-component></categories-component>
      <trending-movies-component .isLoading=${this.isLoading} .movies="${this.movies}"></trending-movies-component>
      <div id="sentinel" class="w-full"></div>
    `;
  }
}