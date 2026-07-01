import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { tailwindStyles } from '@utils/app.constants';

@customElement('footer-component')
export class FooterComponent extends LitElement {
  static styles = css`
    ${tailwindStyles}
  `;

  render() {
    return html`
      <footer class="text-base-content mt-auto">
        <div class="max-w-6xl mx-auto px-6 py-16 flex flex-col items-center">
          <!-- Links + Contact -->
          <div
            class="flex flex-col md:flex-row justify-evenly w-full max-w-4xl mb-10 text-center md:text-left gap-8"
          >
            <!-- Links -->
            <div class="flex flex-col gap-3 items-center md:items-start">
              <h4 class="text-sm font-semibold uppercase tracking-wide opacity-80 mb-2">Links</h4>
              <a
                href="/terms"
                class="text-sm font-medium hover:text-base-content transition-colors"
              >
                Terms of Use
              </a>
              <a
                href="/privacy"
                class="text-sm font-medium hover:text-base-content transition-colors"
              >
                Privacy Policy
              </a>

              <a
                href="/contact"
                class="text-sm font-medium hover:text-base-content transition-colors"
              >
                Contact Page
              </a>
            </div>
            <!-- Contact -->
            <div class="flex flex-col gap-3 items-center md:items-start">
              <h4 class="text-sm font-semibold uppercase tracking-wide opacity-80 mb-2">Contact</h4>
              <a
                href="mailto:contact@movviator.com"
                class="text-sm font-semibold text-base-content hover:underline underline-offset-4"
              >
                contact@movviator.com
              </a>
            </div>
          </div>
          <!-- Legal -->
          <div class="text-center text-sm opacity-70 leading-relaxed max-w-4xl space-y-4 mb-6">
            <p>
              By using <span class="text-base-content font-semibold">Movviator</span>, you agree to
              our Terms of Use and Privacy Policy. All film-related metadata is supplied by
              <span class="text-base-content font-semibold">The Movie Database (TMDB)</span>.
            </p>

            <p class="text-xs italic opacity-60">
              Changes made on TMDB will be reflected in Movviator once TMDB processes the updates.
            </p>
          </div>
          <!-- Divider -->
          <div class="border-t border-base-content/20 w-full max-w-4xl mb-6"></div>
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
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'footer-component': FooterComponent;
  }
}
