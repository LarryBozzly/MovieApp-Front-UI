import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { tailwindStyles } from '@utils/app.constants';
import { setPageMeta } from '@utils/setPageMeta';

@customElement('landing-page')
export class LandingPage extends LitElement {
  static styles = css`
    ${tailwindStyles}

    :host {
      display: flex;
      flex-direction: column;
      height: 100dvh; /* full viewport height */
      --pb-safe: env(safe-area-inset-bottom);
    }

    .pb-safe {
      padding-bottom: var(--pb-safe, 1rem);
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
      flex: 1; /* grows to fill available space */
      overflow-y: auto;
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

  connectedCallback() {
    super.connectedCallback();
    setPageMeta({
      title: 'Movviator – Find the Perfect Movie to Watch Together',
      description:
        'Movviator helps you and your loved ones find the perfect movie to watch together. Match based on your watchlist and preferences, and never argue about movie night again.',
      robots: 'index, follow',
      ogImage: '/images/landing/hero_people.webp',
      canonicalUrl: 'https://movviator.tech/',
    });
  }

  render() {
    return html`
      <div class="scroll-container bg-base-200 font-sans text-base-content">
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
              <div class="bg-base-100 border border-base-300 rounded-2xl overflow-hidden shadow-sm">
                <div class="bg-primary/10 flex items-center justify-center py-12 px-8">
                  <img
                    src="/images/landing/director.webp"
                    alt="Browse Catalogs"
                    class="w-40 md:w-44 object-contain"
                  />
                </div>

                <div class="p-8 text-center">
                  <h3 class="text-xl font-bold mb-3">Browse Catalogs</h3>
                  <p class="opacity-70 leading-relaxed">
                    Explore extensive catalogs of trending and top-rated movies. Filter by genre and
                    discover hidden gems.
                  </p>
                </div>
              </div>

              <!-- Card 2 -->
              <div class="bg-base-100 border border-base-300 rounded-2xl overflow-hidden shadow-sm">
                <div class="bg-secondary/10 flex items-center justify-center py-12 px-8">
                  <img
                    src="/images/landing/cards.webp"
                    alt="Match with Friends"
                    class="w-40 md:w-44 object-contain"
                  />
                </div>

                <div class="p-8 text-center">
                  <h3 class="text-xl font-bold mb-3">Match with Friends</h3>
                  <p class="opacity-70 leading-relaxed">
                    Connect with friends and swipe on movies. We'll notify you instantly when you
                    match on the same film.
                  </p>
                </div>
              </div>

              <!-- Card 3 -->
              <div class="bg-base-100 border border-base-300 rounded-2xl overflow-hidden shadow-sm">
                <div class="bg-accent/10 flex items-center justify-center py-12 px-8">
                  <img
                    src="/images/landing/popcorn.webp"
                    alt="Watch Together"
                    class="w-40 md:w-44 object-contain"
                  />
                </div>

                <div class="p-8 text-center">
                  <h3 class="text-xl font-bold mb-3">Watch Together</h3>
                  <p class="opacity-70 leading-relaxed">
                    No more endless scrolling or arguments. Pick from your matches and enjoy movie
                    night together.
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
        <!-- Footer CTA - cohesive with Features section -->
        <div class="py-20 px-6 bg-gradient-to-br from-[#6a11cb] to-[#2575fc] text-center">
          <div class="max-w-3xl mx-auto mb-10">
            <h2 class="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to find your next favorite movie?
            </h2>
            <p class="text-xl text-white/80">
              Connect with friends, match on movies, and make every movie night unforgettable.
            </p>
          </div>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/signup"
              class="btn btn-lg bg-white text-primary hover:bg-gray-100 border-none font-bold px-8 rounded-md "
            >
              Create Free Account
            </a>
            <a
              href="/login"
              class="btn btn-lg btn-outline text-white hover:bg-white hover:text-black focus:bg-white focus:text-black 
                active:bg-white active:text-black
                hover:scale-105 focus:scale-105 active:scale-105
                hover:ring-primary/50 focus:ring-primary/50 active:ring-primary/50
                shadow-none
                font-semibold px-8 rounded-md transition-all duration-300"
            >
              Login
            </a>
          </div>
        </div>
        <!-- Footer -->
        <footer class="bg-neutral text-neutral-content mt-auto">
          <div class="max-w-6xl mx-auto px-6 py-16 flex flex-col items-center">
            <!-- Links + Contact -->
            <div
              class="flex flex-col md:flex-row justify-evenly w-full max-w-4xl mb-10 text-center md:text-left gap-8"
            >
              <!-- Links -->
              <div class="flex flex-col gap-3 items-center md:items-start">
                <h4 class="text-sm font-semibold uppercase tracking-wide opacity-80 mb-2">Links</h4>
                <a href="/terms" class="text-sm font-medium hover:text-white transition-colors">
                  Terms of Use
                </a>
                <a href="/privacy" class="text-sm font-medium hover:text-white transition-colors">
                  Privacy Policy
                </a>

                <a href="/contact" class="text-sm font-medium hover:text-white transition-colors">
                  Contact Page
                </a>
              </div>
              <!-- Contact -->
              <div class="flex flex-col gap-3 items-center md:items-start">
                <h4 class="text-sm font-semibold uppercase tracking-wide opacity-80 mb-2">
                  Contact
                </h4>
                <a
                  href="mailto:contact@movviator.tech"
                  class="text-sm font-semibold text-white hover:underline underline-offset-4"
                >
                  contact@movviator.tech
                </a>
              </div>
            </div>
            <!-- Legal -->
            <div class="text-center text-sm opacity-70 leading-relaxed max-w-4xl space-y-4 mb-6">
              <p>
                By using <span class="text-white font-semibold">Movviator</span>, you agree to our
                Terms of Use and Privacy Policy. All film-related metadata is supplied by
                <span class="text-white font-semibold">The Movie Database (TMDB)</span>.
              </p>

              <p class="text-xs italic opacity-60">
                Changes made on TMDB will be reflected in Movviator once TMDB processes the updates.
              </p>
            </div>
            <!-- Divider -->
            <div class="border-t border-neutral-content/20 w-full max-w-4xl mb-6"></div>
            <!-- TMDB -->
            <div class="flex flex-col items-center gap-3">
              <img src="/images/tmdb-logo.svg" alt="TMDB Logo" class="h-8 w-auto" />
              <p class="text-center text-sm opacity-60">
                Movviator uses the TMDB API but is not endorsed or certified by TMDB.
              </p>
            </div>
            <!-- Copyright -->
            <p class="text-center text-xs opacity-50 mt-6">
              © ${new Date().getFullYear()} Movviator. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'landing-page': LandingPage;
  }
}
