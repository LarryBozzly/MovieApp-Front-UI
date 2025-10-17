import { LitElement, html, css } from 'lit';
import { tailwindStyles } from '../utils/app.constants';
import { customElement, property } from 'lit/decorators.js';
import { MovieGenreMap } from '../models/models';

@customElement('genre-badges')
export class GenreBadges extends LitElement {
    static styles = css`
        ${tailwindStyles}
    `;
    @property({ type: Array }) genreIds: number[] = [];
    @property({ type: Number }) limit = 4; // max badges before "+N more"

    render() {
        const displayed = this.genreIds.slice(0, this.limit);
        const remaining = this.genreIds.length - displayed.length;

        return html`
      <div class="flex flex-wrap gap-2">
        ${displayed.map(
            (id) => html`
            <span class="badge badge-outline bg-base-200/60 text-base-content/70 text-xs">${MovieGenreMap.get(id)}</span>
          `
        )}
        ${remaining > 0
                ? html`<span class="badge badge-outline badge-info text-xs">+${remaining} more</span>`
                : ''}
      </div>
    `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'genre-badges': GenreBadges;
    }
}
