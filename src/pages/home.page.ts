import { LitElement, html, css } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { connect } from 'zustand-lit';
import { appStore } from '../store/app-store';
import '../components/trending-movies.component';
import { tailwindStyles } from '../utils/app.constants';

@customElement('home-page')
export class HomePage extends connect(LitElement, appStore) {
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
    if (!this.$state.movies.length) {
      await this.$state.fetchTrendingMovies(this.$state.page);
    }
    this.setupInfiniteScroll();
  }

  private setupInfiniteScroll() {
    this.observer = new IntersectionObserver(
      async (entries) => {
        const [target] = entries;
        if (target.isIntersecting && !this.$state.isLoading) {
          await this.$state.fetchTrendingMovies(this.$state.page + 1);
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
      <trending-movies-component .isLoading=${this.$state.isLoading} .movies="${this.$state.movies}"></trending-movies-component>
      <div id="sentinel" class="w-full"></div>
    `;
  }
}