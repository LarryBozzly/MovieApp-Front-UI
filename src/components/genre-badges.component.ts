import { LitElement, html, css } from 'lit';
import { tailwindStyles } from '../utils/app.constants';
import { customElement, property } from 'lit/decorators.js';
import { MovieGenreMap } from '../models/models';

@customElement('genre-badges')
export class GenreBadges extends LitElement {
  static styles = css`
    ${tailwindStyles}
    :host {
      width: 100%;
    }
  `;
  @property({ type: Array }) genreIds: number[] = [];

  render() {
    return html`
      <div class="flex items-center overflow-x-auto gap-2 scrollbar-hide w-full scroll-fade">
        ${this.genreIds.map(
          (id) => html`
            <span class="badge badge-outline bg-base-200/60 text-base-content/70 text-xs">
              ${MovieGenreMap.get(id)}
            </span>
          `
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'genre-badges': GenreBadges;
  }
}
