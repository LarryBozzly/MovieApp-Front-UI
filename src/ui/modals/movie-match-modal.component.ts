import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  MovieMatchDirection,
  type GestureArea,
  type Movie,
  type WatchlistState,
} from '../../models/models.ts';
import { tailwindStyles } from '@utils/app.constants.ts';
import { watch, watchWithSelector } from 'zustand-lit';
import { authStore, type AuthState } from '@store/auth-store.ts';
import '@ui/components/genre-badges.component.ts';
import '@ui/components/figure-video.component.ts';
import Hammer from 'hammerjs';
import { appStore, selectWatchlistIds } from '@store/app-store.ts';
import { FilledBookmarkIcon, OutlineBookmarkIcon } from '@ui/icons';

@customElement('movie-match-modal-component')
export class MovieMatchModalComponent extends LitElement {
  @watch(authStore) authState!: AuthState;
  @watchWithSelector({ store: appStore, selector: selectWatchlistIds })
  readonly watchlistIds!: Record<number, WatchlistState>;

  static styles = css`
    ${tailwindStyles}
  `;

  private cleanupFns: (() => void)[] = [];
  private dialogRef?: HTMLDialogElement;
  private manager!: HammerManager;
  @property({ type: Array }) movies: Movie[] = [];
  @state() private currentIndex = 0;
  @state() private isSwiping = false;
  @state() private canScrollLeft = false;
  @state() private canScrollRight = false;

  private closeHandler = () => {
    // Reset content visibility when the dialog is closed
    this.currentIndex = Number.MAX_SAFE_INTEGER;
    this.currentIndex = 0;
  };

  private get currentMovie(): Movie | undefined {
    return this.movies[this.currentIndex];
  }

  private get nextMovie(): Movie | undefined {
    return this.movies[this.currentIndex + 1];
  }

  private getPosterUrl(movie: Movie): string {
    // Matches the size used in the render method ('w500')
    return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  }

  private prefetchNextImage() {
    const nextMovie = this.nextMovie;

    if (nextMovie && nextMovie.poster_path) {
      const nextPosterUrl = this.getPosterUrl(nextMovie);
      const img = new Image();
      img.src = nextPosterUrl;
    }
  }

  protected updated(changedProperties: Map<string | PropertyKey, unknown>): void {
    super.updated(changedProperties);

    if (changedProperties.has('currentIndex')) {
      // Trigger pre-fetch for the movie *after* the one we just swiped to
      this.prefetchNextImage();
      const overview = this.renderRoot.querySelector('#scroll-overview') as HTMLElement | null;
      if (overview) overview.scrollTop = 0;
    }
  }

  private nudge() {
    const modalContent = this.closest('.modal-box') as HTMLElement;
    const nudgeTransition = 'transform 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)';
    const defaultTransition = 'transform 0.3s cubic-bezier(0.25, 1.25, 0.5, 1)';
    modalContent.style.willChange = 'transform';
    modalContent.style.transformOrigin = 'bottom center';
    modalContent.style.transition = nudgeTransition;
    modalContent.style.transform = 'translate3d(30px, 0, 0) rotate(10deg)';
    setTimeout(() => {
      modalContent.style.transform = 'translate3d(0, 0, 0) rotate(0)';
    }, 300);
    setTimeout(() => {
      modalContent.style.transform = 'translate3d(-30px, 0, 0) rotate(-10deg)';
    }, 600);
    setTimeout(() => {
      modalContent.style.transform = 'translate3d(0, 0, 0) rotate(0)';
      modalContent.style.transition = defaultTransition;
    }, 900);
  }

  private async swipe(direction: MovieMatchDirection) {
    const movie = this.currentMovie;
    if (!movie) return;

    this.currentIndex++;

    if (direction === MovieMatchDirection.Like) {
      await this.authState.sendMovieSelection(movie);
    }

    if (direction === MovieMatchDirection.Dislike) {
      await this.authState.sendMovieRejection(movie);
    }

    if (this.currentIndex === this.movies.length) {
      // All movies reviewed – trigger completion event or notify server
    }
  }

  async firstUpdated() {
    await this.updateComplete;

    const container = this as HTMLElement;
    const modalContent = this.closest('.modal-box') as HTMLElement;
    if (!modalContent) return;

    modalContent.style.willChange = 'transform';

    this.manager = new Hammer.Manager(container, {
      inputClass: Hammer.TouchMouseInput,
      touchAction: 'pan-y',
    });

    this.manager.add(
      new Hammer.Pan({
        threshold: 0,
        direction: Hammer.DIRECTION_HORIZONTAL,
      })
    );

    let currentX = 0;
    let lastPanTime = 0;

    const gesture = {
      area: 'none' as GestureArea,
      decided: false,
      ignorePan: false,
    };

    const resetGesture = () => {
      gesture.area = 'none';
      gesture.decided = false;
      gesture.ignorePan = false;
      currentX = 0;
      this.isSwiping = false;
    };

    const decideIntent = (absX: number, absY: number, directionX: 'left' | 'right') => {
      const threshold = 8;

      if (gesture.decided || (absX < threshold && absY < threshold)) return;

      // ===== OVERVIEW =====
      if (gesture.area === 'overview') {
        gesture.ignorePan = absY > absX;
      }

      // ===== BADGE =====
      if (gesture.area === 'badge') {
        if (absX > absY) {
          const canSwipe =
            (directionX === 'right' && !this.canScrollLeft) ||
            (directionX === 'left' && !this.canScrollRight) ||
            (!this.canScrollLeft && !this.canScrollRight);

          gesture.ignorePan = !canSwipe;
        } else {
          gesture.ignorePan = false;
        }
      }

      gesture.decided = true;
    };

    // ==============================
    // HAMMER EVENTS
    // ==============================
    this.manager.on('panstart pancancel', () => {
      gesture.decided = false;
      gesture.ignorePan = false;
      currentX = 0;
      this.isSwiping = true;
    });

    this.manager.on('panmove', (e) => {
      // throttle ~60fps
      if (performance.now() - lastPanTime < 16) return;
      lastPanTime = performance.now();

      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      const directionX = e.deltaX > 0 ? 'right' : 'left';

      decideIntent(absX, absY, directionX);

      if (gesture.ignorePan) return;

      currentX = e.deltaX;

      const rotate = Math.max(-15, Math.min(15, currentX / 10));

      modalContent.style.transition = 'none';
      modalContent.style.transformOrigin = 'bottom center';
      modalContent.style.transform = `translate3d(${currentX}px, 0, 0) rotate(${rotate}deg)`;

      if (e.srcEvent?.cancelable) {
        try {
          e.srcEvent.preventDefault();
        } catch {}
      }
    });

    this.manager.on('panend', (e) => {
      this.isSwiping = false;

      if (gesture.ignorePan) {
        resetGesture();
        return;
      }

      const tempX = currentX;
      currentX = 0;

      const shouldDismiss = Math.abs(tempX) > 150 || Math.abs(e.velocityX) > 0.5;

      if (shouldDismiss) {
        const direction = tempX > 0 ? 1 : -1;

        modalContent.style.transition = 'transform 0.4s ease-out';
        modalContent.style.transform = `translate3d(${direction * 1000}px, 0, 0) rotate(${direction * 15}deg)`;

        setTimeout(() => {
          this.swipe(direction > 0 ? MovieMatchDirection.Like : MovieMatchDirection.Dislike);
          modalContent.style.transform = '';
        }, 180);
      } else {
        modalContent.style.transition = 'transform 0.3s cubic-bezier(0.25, 1.25, 0.5, 1)';
        modalContent.style.transform = 'translate3d(0, 0, 0) rotate(0)';
      }

      resetGesture();
    });

    // ==============================
    // POINTER BINDINGS
    // ==============================
    const overview = this.renderRoot.querySelector('#scroll-overview') as HTMLElement;
    if (overview) {
      this.addToCleanup(
        overview,
        'pointerdown',
        () => {
          gesture.area = 'overview';
          gesture.decided = false;
          gesture.ignorePan = false;
        },
        { passive: true }
      );

      this.addToCleanup(
        overview,
        'touchstart',
        () => {
          gesture.area = 'overview';
          gesture.decided = false;
          gesture.ignorePan = false;
        },
        { passive: true }
      );
    }

    const badges = this.renderRoot.querySelector('genre-badges') as HTMLElement;
    if (badges) {
      this.addToCleanup(
        badges,
        'pointerdown',
        () => {
          gesture.area = 'badge';
          gesture.decided = false;
          gesture.ignorePan = false;
        },
        { passive: true }
      );

      this.addToCleanup(
        badges,
        'touchstart',
        () => {
          gesture.area = 'badge';
          gesture.decided = false;
          gesture.ignorePan = false;
        },
        { passive: true }
      );
    }

    // ==============================
    // CLEANUP + NUDGE
    // ==============================
    this.cleanupFns.push(() => this.manager.destroy());

    if (this.currentIndex === 0) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      this.nudge();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.dialogRef = this.closest('dialog') ?? undefined;
    this.dialogRef?.addEventListener('close', this.closeHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.dialogRef?.removeEventListener('close', this.closeHandler);
    this.dialogRef = undefined;
    this.cleanupFns.forEach((fn) => {
      try {
        fn();
      } catch {}
    });
    this.cleanupFns = [];
  }

  private addToCleanup = <K extends keyof HTMLElementEventMap>(
    target: HTMLElement | Window,
    type: K,
    listener: (ev: any) => void,
    options?: AddEventListenerOptions
  ) => {
    target.addEventListener(type, listener, options);
    this.cleanupFns.push(() => target.removeEventListener(type, listener, options));
  };

  private async handleWatchlistClick(event: Event, movie: Movie): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const { addToWatchlist, removeFromWatchlist } = appStore.getState();
    const isWatchlisted = Boolean(this.watchlistIds[movie.id]?.isWatchlist);

    await (isWatchlisted ? removeFromWatchlist(movie) : addToWatchlist(movie));
  }

  private renderWatchlistIcon(movie: Movie) {
    const watchlistItem = this.watchlistIds[movie.id];
    if (watchlistItem?.isLoading)
      return html` <span class="loading loading-spinner w-5 h-5 text-primary"></span> `;
    const isWatchlisted = Boolean(watchlistItem?.isWatchlist);
    return isWatchlisted ? FilledBookmarkIcon() : OutlineBookmarkIcon();
  }

  private onScrollChanged(e: CustomEvent<{ canScrollLeft: boolean; canScrollRight: boolean }>) {
    this.canScrollLeft = e.detail.canScrollLeft;
    this.canScrollRight = e.detail.canScrollRight;
  }

  render() {
    const movie = this.currentMovie;

    if (!movie) {
      return html`
        <div class="p-6 text-center bg-base-100 rounded-lg shadow-xl max-w-sm mx-auto">
          <h2 class="text-2xl font-bold text-base-content">No more movies</h2>
          <p class="text-base-content/70">You’ve reviewed all the available titles.</p>
        </div>
      `;
    }

    return html`
      <div
        class="rounded-lg overflow-hidden shadow-lg bg-base-100 border border-base-300 flex flex-col max-h-[calc(var(--app-height)*0.95)]"
      >
        <figure-video-component
          class="pt-7.5 px-4"
          .movie=${movie}
          .voteAverage=${movie.vote_average}
          .voteCount=${movie.vote_count}
          style=${this.isSwiping ? 'pointer-events: none;' : ''}
        ></figure-video-component>

        <div class="p-4 flex flex-col flex-1 gap-3 overflow-hidden">
          <div>
            <div class="flex items-start justify-between gap-3">
              <h3 class="text-xl font-bold text-base-content">
                ${movie.title}
                <span class="text-base-content/60 text-sm">
                  (${movie.release_date ? new Date(movie.release_date).getFullYear() : ''})
                </span>
              </h3>
              <button
                @click=${(event: Event) => this.handleWatchlistClick(event, movie)}
                class="shrink-0 focus:outline-none"
                title="Toggle watchlist"
                ?disabled=${this.watchlistIds[movie.id]?.isLoading}
              >
                ${this.renderWatchlistIcon(movie)}
              </button>
            </div>
            <div class="flex gap-2 mt-1 overflow-hidden whitespace-nowrap flex-shrink-0">
              <genre-badges
                @onScrollChange=${this.onScrollChanged}
                .genreIds=${movie.genre_ids}
                .movieId=${movie.id}
              ></genre-badges>
            </div>
          </div>

          <div
            id="scroll-overview"
            class="overflow-y-auto rounded-lg border border-base-300 bg-base-200/60 p-2 flex-1 text-sm text-base-content/70"
          >
            ${movie.overview || 'No description available.'}
          </div>

          <div class="flex justify-between gap-4 pt-2 flex-shrink-0">
            <button
              @click=${() => this.swipe(MovieMatchDirection.Dislike)}
              class="btn btn-outline btn-error flex-1 text-base font-semibold py-3"
            >
              👎 Dislike
            </button>

            <button
              @click=${() => this.swipe(MovieMatchDirection.Like)}
              class="btn btn-primary flex-1 text-base font-semibold py-3"
            >
              👍 Like
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'movie-match-modal-component': MovieMatchModalComponent;
  }
}
