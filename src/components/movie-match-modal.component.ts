import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { MovieMatchDirection, type Movie } from '../models/models';
import { tailwindStyles } from '../utils/app.constants';
import { watch } from 'zustand-lit';
import { authStore, type AuthState } from '../store/auth-store';
import { getPopularityClasses } from '../utils/popularity-ui-classes.functions';
import './genre-badges.component';
import Hammer from 'hammerjs';

@customElement('movie-match-modal-component')
export class MovieMatchModalComponent extends LitElement {
  @watch(authStore) authState!: AuthState;

  static styles = css`
    ${tailwindStyles}
  `;

  private cleanupFns: (() => void)[] = [];
  private dialogRef?: HTMLDialogElement;
  private manager!: HammerManager;
  @property({ type: Array }) movies: Movie[] = [];
  @state() private currentIndex = 0;
  @state() private isSwiping = false;

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
    modalContent.style.willChange = 'transform';
    if (!modalContent) return;

    this.manager = new Hammer.Manager(container, {
      inputClass: Hammer.TouchMouseInput,
      touchAction: 'pan-y',
    });

    const pan = new Hammer.Pan({
      threshold: 0,
      direction: Hammer.DIRECTION_HORIZONTAL,
    });
    this.manager.add(pan);

    let currentX = 0;

    // --- Gesture-decision flags ---
    // gestureStartedInOverview: true if pointerdown began inside the description
    // gestureDecided: true after we decide horizontal vs vertical for this gesture
    // ignorePan: true if we decided it is vertical (so ignore Hammer pan movement)
    let gestureStartedInOverview = false;
    let gestureDecided = false;
    let ignorePan = false;

    this.manager.on('panstart pancancel', (_e) => {
      // reset per-gesture flags on panstart/pancancel (panstart happens when hammer decides to start)
      // But we keep gestureStartedInOverview as set by pointerdown (below).
      gestureDecided = false;
      ignorePan = false;
      currentX = 0;
      this.isSwiping = true;
    });

    let lastPanTime = 0;
    this.manager.on('panmove', (e) => {
      // throttle to ~60fps
      if (performance.now() - lastPanTime < 16) return; // ~60fps
      lastPanTime = performance.now();

      // If the gesture started in the overview, we need to decide intent.
      if (gestureStartedInOverview && !gestureDecided) {
        const absX = Math.abs(e.deltaX);
        const absY = Math.abs(e.deltaY);
        const threshold = 8;
        if (absX >= threshold || absY >= threshold) {
          if (absY > absX) {
            // Vertical intent -> ignore Hammer pans for the rest of this gesture
            ignorePan = true;
            gestureDecided = true;
            // Do NOT call preventDefault() so browser can continue scrolling
            return;
          } else {
            // Horizontal intent -> allow Hammer to handle the pan smoothly
            ignorePan = false;
            gestureDecided = true;
            try {
              e.srcEvent?.preventDefault?.();
            } catch (err) {
              /* some environments may not allow; it's best-effort */
            }
          }
        } else {
          // Not enough movement yet — don't do anything
          return;
        }
      }

      if (gestureStartedInOverview && ignorePan) {
        // User started inside overview and intent is vertical -> do nothing (native scroll)
        return;
      }

      // Normal pan handling (either started outside overview OR decided horizontal)
      currentX = e.deltaX;
      const maxRotate = 15;
      const rotate = Math.max(-maxRotate, Math.min(maxRotate, currentX / 10));

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
      // At panend we only proceed if we didn't ignore the pan
      if (gestureStartedInOverview && ignorePan) {
        // Reset flags and do nothing (native scroll handled it)
        gestureStartedInOverview = false;
        gestureDecided = false;
        ignorePan = false;
        currentX = 0;
        return;
      }

      const tempCurrentX = currentX;
      currentX = 0;
      const threshold = 150;
      const velocity = Math.abs(e.velocityX);
      const shouldDismiss = Math.abs(tempCurrentX) > threshold || velocity > 0.5;

      if (shouldDismiss) {
        const direction = tempCurrentX > 0 ? 1 : -1;
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

      // Reset flags for the next gesture
      gestureStartedInOverview = false;
      gestureDecided = false;
      ignorePan = false;
    });

    // --- Listen for pointerdown inside the overview area to mark where the gesture started ---
    const overview = this.renderRoot.querySelector('#scroll-overview') as HTMLElement;
    if (overview) {
      this.addToCleanup(
        overview,
        'pointerdown',
        (_ev: PointerEvent) => {
          gestureStartedInOverview = true;
          gestureDecided = false;
          ignorePan = false;
        },
        { passive: true }
      );

      this.addToCleanup(
        overview,
        'touchstart',
        (_ev: TouchEvent) => {
          gestureStartedInOverview = true;
          gestureDecided = false;
          ignorePan = false;
        },
        { passive: true }
      );

      this.addToCleanup(window, 'pointerup', () => {
        gestureStartedInOverview = false;
        gestureDecided = false;
        ignorePan = false;
        this.isSwiping = false;
      });

      this.addToCleanup(window, 'touchend', () => {
        gestureStartedInOverview = false;
        gestureDecided = false;
        ignorePan = false;
        this.isSwiping = false;
      });
    }

    // Also track Hammer manager cleanup
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

  render() {
    const movie = this.currentMovie;

    if (!movie) {
      return html`
        <div class="p-6 text-center bg-base-100 rounded-3xl shadow-xl max-w-sm mx-auto my-4">
          <h2 class="text-2xl font-bold text-base-content">No more movies</h2>
          <p class="text-base-content/70">You’ve reviewed all the available titles.</p>
        </div>
      `;
    }

    return html`
      <div
        class="rounded-xl overflow-hidden shadow-lg bg-base-100 border border-base-300 flex flex-col max-h-[80vh]"
      >
        <figure-video-component
          class="pt-7.5 px-4"
          .movie=${movie}
          style=${this.isSwiping ? 'pointer-events: none;' : ''}
        ></figure-video-component>

        <div class="p-4 flex flex-col flex-1 gap-3 overflow-hidden">
          <div>
            <h3 class="text-xl font-bold text-base-content">
              ${movie.title}
              <span class="text-base-content/60 text-sm">
                (${movie.release_date ? new Date(movie.release_date).getFullYear() : ''})
              </span>
            </h3>
            <div class="flex gap-2 mt-1 overflow-hidden whitespace-nowrap flex-shrink-0">
              <genre-badges .genreIds=${movie.genre_ids} .scrollable=${false}></genre-badges>
            </div>
            <div class="flex items-center gap-3 mt-1">
              <span class="text-yellow-500 text-lg">★</span>
              <span class="text-base text-base-content/80 font-medium">
                ${movie.vote_average?.toFixed(1)}
              </span>
              <span
                class="badge badge-outline text-sm ${getPopularityClasses(
                  movie.percentage_popularity
                )}"
              >
                Popularity: ${movie.percentage_popularity}%
              </span>
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
