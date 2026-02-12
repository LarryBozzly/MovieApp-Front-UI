import { LitElement, html, css } from 'lit';
import { tailwindStyles } from '../../utils/app.constants';
import { customElement, property, state } from 'lit/decorators.js';
import { MovieGenreMap } from '../../models/models';

@customElement('genre-badges')
export class GenreBadges extends LitElement {
  static styles = css`
    ${tailwindStyles}
    :host {
      width: 100%;
      display: block;
    }
  `;

  @property({ type: Array }) genreIds: number[] = [];
  @property({ type: Number }) maxVisible: number = 2;
  @property({ type: Boolean }) scrollable!: boolean;
  @state() private expanded = false;

  private toggleExpanded() {
    this.expanded = !this.expanded;
  }

  protected updated(changedProperties: Map<string | PropertyKey, unknown>): void {
    super.updated(changedProperties);

    if (
      changedProperties.has('genreIds') ||
      changedProperties.has('maxVisible') ||
      changedProperties.has('scrollable')
    ) {
      this.expanded = false;
    }
  }

  render() {
    if (this.scrollable) {
      // Scrollable version
      return html`
        <div class="flex gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap">
          ${this.genreIds.map(
            (id) => html`
              <span
                class="badge badge-outline bg-base-200/60 text-base-content/70 text-xs flex-shrink-0"
              >
                ${MovieGenreMap.get(id)}
              </span>
            `
          )}
        </div>
      `;
    }

    // Non-scrollable version with "+N more"
    const visibleGenres = this.expanded ? this.genreIds : this.genreIds.slice(0, this.maxVisible);
    const hiddenCount = this.genreIds.length - visibleGenres.length;

    return html`
      <div class="flex flex-wrap gap-2">
        ${visibleGenres.map(
          (id) => html`
            <span class="badge badge-outline bg-base-200/60 text-base-content/70 text-xs">
              ${MovieGenreMap.get(id)}
            </span>
          `
        )}
        ${hiddenCount > 0 && !this.expanded
          ? html`
              <span
                class="badge badge-outline bg-primary text-primary-content text-xs cursor-pointer hover:bg-primary-focus transition"
                @click=${this.toggleExpanded}
              >
                +${hiddenCount} more
              </span>
            `
          : null}
        ${this.expanded && this.genreIds.length > this.maxVisible
          ? html`
              <span
                class="badge badge-outline bg-secondary text-secondary-content text-xs cursor-pointer hover:bg-secondary-focus transition"
                @click=${this.toggleExpanded}
              >
                Show less
              </span>
            `
          : null}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'genre-badges': GenreBadges;
  }
}
