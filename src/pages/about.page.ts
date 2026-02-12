import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { tailwindStyles } from '../utils/app.constants';
import '../ui/components/invite-fab.component';

@customElement('about-page')
export class AboutPage extends LitElement {
  static styles = css`
    ${tailwindStyles} :host {
      display: block;
      height: 100dvh;
      position: relative;
    }

    .scroll-container {
      position: absolute;
      top: 4rem; /* height of navbar */
      left: 0;
      right: 0;
      bottom: 0;
      overflow-y: auto;
      scroll-behavior: smooth;
    }
  `;

  render() {
    return html`
      <div class="scroll-container">
        <main class="p-4 max-w-4xl mx-auto">
          <div class="bg-base-100 shadow-lg rounded-xl p-6">
            <h2 class="text-lg font-bold text-base-content mb-2">Film data</h2>
            <p class="text-base-content mb-4">
              All film-related metadata used in <strong>Movviator</strong>, including cast and crew
              information, synopses, release dates, trailers, ratings, and poster artwork, is
              supplied by <strong>The Movie Database (TMDB)</strong>.
            </p>

            <p class="text-base-content mb-6">
              Changes made on TMDB will be reflected in Movviator once TMDB processes and publishes
              the updates.
            </p>

            <div class="flex flex-col items-center gap-3 border-t border-base-300 pt-4 mt-6">
              <img src="/images/tmdb-logo.svg" alt="TMDB Logo" class="h-6 w-auto" />
              <p class="text-sm text-base-content/60 text-center">
                Movviator uses the TMDB API but is not endorsed or certified by TMDB.
              </p>
            </div>
          </div>
        </main>
        <invite-fab></invite-fab>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'about-page': AboutPage;
  }
}
