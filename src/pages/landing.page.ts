import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { tailwindStyles } from '@utils/app.constants';

@customElement('landing-page')
export class LandingPage extends LitElement {
  static styles = css`
    ${tailwindStyles}

    :host {
      display: block;
      height: 100dvh;
      position: relative;
    }

    .scroll-container {
      position: absolute;
      top: 4rem;
      left: 0;
      right: 0;
      bottom: 0;
      overflow-y: auto;
      overflow-x: hidden;
      scroll-behavior: smooth;
    }

    @keyframes heroTextIn {
      from {
        transform: translateY(-40px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes heroImageIn {
      from {
        transform: translateY(40px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .hero-text {
      animation: heroTextIn 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    .hero-image-wrapper {
      width: 100%;
      display: flex;
      justify-content: center;
      margin-top: 2rem;
      margin-bottom: -5rem; /* overlap next section slightly */
      position: relative;
      z-index: 10;
    }

    .hero-image {
      width: 100%;
      max-width: 900px;
      aspect-ratio: 894 / 481;
      height: auto;
      object-fit: contain;
      animation: heroImageIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      min-width: 400px;
    }

    @media (min-width: 768px) {
      .hero-image-wrapper {
        margin-bottom: -7rem;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .hero-text,
      .hero-image {
        animation: none;
      }
    }
  `;

  render() {
    return html`
      <div class="scroll-container flex flex-col bg-base-200 font-sans text-base-content">
        <!-- Hero Section -->
        <div
          class="relative bg-gradient-to-br from-[#6a11cb] to-[#2575fc] text-white flex flex-col items-center px-6 pt-16"
        >
          <div class="max-w-5xl mx-auto text-center hero-text">
            <h1
              class="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight"
            >
              Find the Perfect Movie <br class="hidden md:block" />
              to Watch Together
            </h1>
            <p
              class="text-base sm:text-lg md:text-2xl mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed"
            >
              Movviator helps you and your loved ones find the perfect movie to watch together.
              Match based on your watchlist and your preferences, and never argue about movie night
              again!
            </p>
            <div class="flex flex-col items-center gap-3 mb-12">
              <a
                href="/signup"
                class="btn btn-lg bg-white text-[#6a11cb] hover:bg-gray-100 border-none font-bold px-8 no-underline"
              >
                Create Free Account
              </a>
              <p class="text-sm sm:text-base text-white/90">
                Already have an account?
                <a href="/login" class="font-semibold text-white underline underline-offset-4">
                  Log in here
                </a>
              </p>
            </div>
          </div>

          <!-- Image BELOW text -->
          <div class="hero-image-wrapper px-4">
            <img
              src="/images/landing/hero_people.webp"
              alt="Couple watching movies"
              class="hero-image"
            />
          </div>
        </div>

        <!-- Features Section -->
        <div class="pt-32 pb-20 px-6 bg-base-200">
          <div class="max-w-6xl mx-auto">
            <div class="text-center mb-16">
              <h2 class="text-3xl md:text-4xl font-bold mb-4">How Movviator Works</h2>
              <p class="text-xl opacity-70">Three simple steps to your next movie night.</p>
            </div>

            <div class="grid md:grid-cols-3 gap-10">
              <div class="card bg-base-100 shadow-xl border border-base-300">
                <div class="card-body items-center text-center">
                  <div
                    class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-3xl"
                  >
                    🎬
                  </div>
                  <h3 class="card-title text-xl mb-2">Browse Catalogs</h3>
                  <p class="opacity-70">
                    Explore extensive catalogs of trending and top-rated movies. Filter by genre and
                    find hidden gems.
                  </p>
                </div>
              </div>

              <div class="card bg-base-100 shadow-xl border border-base-300">
                <div class="card-body items-center text-center">
                  <div
                    class="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4 text-3xl"
                  >
                    🤝
                  </div>
                  <h3 class="card-title text-xl mb-2">Match with Friends</h3>
                  <p class="opacity-70">
                    Connect with friends and swipe on movies. We'll tell you instantly when you both
                    like the same film.
                  </p>
                </div>
              </div>

              <div class="card bg-base-100 shadow-xl border border-base-300">
                <div class="card-body items-center text-center">
                  <div
                    class="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 text-3xl"
                  >
                    🍿
                  </div>
                  <h3 class="card-title text-xl mb-2">Watch Together</h3>
                  <p class="opacity-70">
                    No more endless scrolling or arguments. Pick from your matches and enjoy the
                    show.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Section -->
        <div class="py-16 px-6 bg-base-100">
          <div class="max-w-4xl mx-auto text-center">
            <h2 class="text-3xl font-bold mb-10">Join the Community</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div class="text-4xl font-bold text-primary mb-2">1M+</div>
                <div class="text-sm uppercase tracking-wide opacity-60">Movies</div>
              </div>
              <div>
                <div class="text-4xl font-bold text-primary mb-2">Endless</div>
                <div class="text-sm uppercase tracking-wide opacity-60">Matches</div>
              </div>
              <div>
                <div class="text-4xl font-bold text-primary mb-2">100%</div>
                <div class="text-sm uppercase tracking-wide opacity-60">Personalized</div>
              </div>
              <div>
                <div class="text-4xl font-bold text-primary mb-2">24/7</div>
                <div class="text-sm uppercase tracking-wide opacity-60">Movie Night</div>
              </div>
            </div>
          </div>
        </div>
        <pre>test</pre>
        <!-- Footer CTA - cohesive with Features section -->
        <div class="py-20 px-6 bg-base-200 text-center">
          <div class="max-w-3xl mx-auto mb-10">
            <h2 class="text-3xl md:text-4xl font-bold mb-4 text-base-content">
              Ready to find your next favorite movie?
            </h2>
            <p class="text-xl opacity-70">
              Connect with friends, match on movies, and make every movie night unforgettable.
            </p>
          </div>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/signup"
              class="btn btn-lg bg-primary text-white hover:bg-primary-focus font-bold px-8 rounded-md transition-colors duration-300"
            >
              Create Free Account
            </a>
            <a
              href="/login"
              class="btn btn-outline btn-lg text-primary hover:bg-primary/10 font-semibold px-8 rounded-md transition-colors duration-300"
            >
              Log in
            </a>
          </div>
        </div>
      </div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'landing-page': LandingPage;
  }
}
