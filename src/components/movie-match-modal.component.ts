import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { MovieGenreMap, MovieMatchDirection, type Movie } from '../models/models';
import { tailwindStyles } from '../utils/app.constants';
import { watch } from 'zustand-lit';
import { authStore, type AuthState } from '../store/auth-store';
import { getPopularityClasses } from '../utils/popularity-ui-classes.functions';
import Hammer from 'hammerjs';

@customElement('movie-match-modal-component')
export class MovieMatchModalComponent extends LitElement {
  @watch(authStore) authState!: AuthState;

  static styles = css`
    ${tailwindStyles}
  `;

  @property({ type: Array }) movies: Movie[] = [];

  @state() private currentIndex = 0;

  private get currentMovie(): Movie | undefined {
    return this.movies[this.currentIndex];
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

  firstUpdated() {
    const container = this as HTMLElement;
    const modalContent = this.closest('.modal-box') as HTMLElement;
    if (!modalContent) return;

    // 1. Get the scrollable description element (must have id="scroll-overview" in render)
    const descriptionEl = this.renderRoot.querySelector('#scroll-overview') as HTMLElement;

    // Optional: Reapply touch-action (Rely on JS logic below, but keep this for browser hint)
    if (descriptionEl) {
      // Tells the browser to handle vertical movement natively here.
      descriptionEl.style.touchAction = 'pan-y';
    }

    // 2. Initialize Hammer Manager (Card only allows horizontal swipe)
    const mainManager = new Hammer.Manager(container, {
      inputClass: Hammer.TouchMouseInput,
      touchAction: 'pan-x', // Global rule for the card container
    });

    const pan = new Hammer.Pan({
      threshold: 0,
      direction: Hammer.DIRECTION_HORIZONTAL
    });
    mainManager.add(pan);

    let currentX = 0;
    let isScrollIntent = false; // Flag: true if the gesture started as a scroll

    mainManager.on('panstart', (e) => {
      isScrollIntent = false;
      const path = e.srcEvent?.composedPath() as EventTarget[] | undefined;

      // 🛑 CRITICAL CHECK: If touch started inside the scroll area, assume scroll intent.
      if (descriptionEl && path?.includes(descriptionEl)) {
        // Since touch-action: pan-y is set on descriptionEl, 
        // the browser should handle it, but we use an explicit JS check as a fail-safe.
        // We look for vertical dominance in the *initial* move.
        const isVerticalDominant = Math.abs(e.deltaY) > Math.abs(e.deltaX) * 1.5;
        if (isVerticalDominant) {
          isScrollIntent = true;
          return; // Stop processing this gesture as a swipe
        }
      }

      modalContent.style.transition = 'none';
    });

    mainManager.on('panmove', (e) => {
      // 🛑 FIX: If we determined this was a scroll, DO NOT update the card position.
      if (isScrollIntent) {
        return;
      }

      // Card Swipe Movement Logic
      currentX = e.deltaX;
      const maxRotate = 15;
      const rotate = Math.max(-maxRotate, Math.min(maxRotate, currentX / 10));

      modalContent.style.transition = 'none';
      modalContent.style.transformOrigin = 'bottom center';
      modalContent.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;

      // Prevents page scrolling/default interaction when actively swiping
      if (e.srcEvent?.cancelable) {
        e.srcEvent.preventDefault();
      }
    });

    mainManager.on('panend', (e) => {
      const tempCurrentX = currentX;
      currentX = 0; // Reset for next gesture

      // 🛑 FIX: If this was a scroll, reset the card position immediately and exit.
      if (isScrollIntent) {
        modalContent.style.transition = 'transform 0.3s cubic-bezier(0.25, 1.25, 0.5, 1)';
        modalContent.style.transform = 'translateX(0) rotate(0)';
        return;
      }

      // Card Swipe Dismissal Logic
      const threshold = 150;
      const velocity = Math.abs(e.velocityX);
      const shouldDismiss = Math.abs(tempCurrentX) > threshold || velocity > 0.5;

      if (shouldDismiss) {
        const direction = tempCurrentX > 0 ? 1 : -1;
        modalContent.style.transition = 'transform 0.4s ease-out';
        modalContent.style.transform = `translateX(${direction * 1000}px) rotate(${direction * 15}deg)`;

        setTimeout(() => {
          this.swipe(direction > 0 ? MovieMatchDirection.Like : MovieMatchDirection.Dislike);
          modalContent.style.transform = '';
        }, 180);
      } else {
        // Return to center
        modalContent.style.transition = 'transform 0.3s cubic-bezier(0.25, 1.25, 0.5, 1)';
        modalContent.style.transform = 'translateX(0) rotate(0)';
      }
    });

  }

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
      <div class="rounded-xl overflow-hidden shadow-lg bg-base-100 border border-base-300 flex flex-col max-h-[80vh]">
        <img
          src="https://image.tmdb.org/t/p/w500${movie.poster_path}"
          alt="${movie.title}"
          class="w-full h-64 object-contain bg-base-200 flex-shrink-0 pointer-events-none"
        />

      <div class="p-4 flex flex-col flex-1 gap-3 overflow-hidden">
        <div>
          <h3 class="text-xl font-bold text-base-content">
            ${movie.title}
            <span class="text-base-content/60 text-sm">
              (${movie.release_date ? new Date(movie.release_date).getFullYear() : ''})
            </span>
          </h3>
          <div class="flex gap-2 mt-1 overflow-x-auto whitespace-nowrap flex-shrink-0">
            ${movie.genre_ids.map((id) => html`
              <span class="badge badge-outline text-xs border-base-content/40 text-base-content/80">
                ${MovieGenreMap.get(id)}
              </span>
            `)}
          </div>
          <div class="flex items-center gap-3 mt-1">
            <span class="text-yellow-500 text-lg">★</span>
            <span class="text-base text-base-content/80 font-medium">${movie.vote_average?.toFixed(1)}</span>
            <span class="badge badge-outline text-sm ${getPopularityClasses(movie.percentage_popularity)}">
              Popularity: ${movie.percentage_popularity}%
            </span>
          </div>
        </div>

        <div id="scroll-overview" class="overflow-y-auto rounded-lg border border-base-300 bg-base-200/60 p-2 flex-1 text-sm text-base-content/70">
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