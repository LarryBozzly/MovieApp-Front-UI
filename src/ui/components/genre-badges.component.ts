import { LitElement, html, css } from 'lit';
import { tailwindStyles } from '@utils/app.constants';
import { customElement, property, state } from 'lit/decorators.js';
import { MovieGenreMap } from '@models/models';
import { OutlineChevronLeftIcon, OutlineChevronRightIcon } from '@ui/icons';
import { ref, createRef } from 'lit/directives/ref.js';

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

  @state() private canScrollRight = false;
  @state() private canScrollLeft = false;

  private scrollContainerRef = createRef<HTMLDivElement>();
  private resizeObserver?: ResizeObserver;

  protected firstUpdated(): void {
    const el = this.scrollContainerRef.value;
    if (!el) return;

    this.checkOverflow();

    this.resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => this.checkOverflow());
    });

    this.resizeObserver.observe(el);
  }

  protected updated(changedProperties: Map<string | PropertyKey, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has('genreIds')) {
      this.checkOverflow();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  private checkOverflow() {
    const el = this.scrollContainerRef.value;
    if (!el) return;

    const { scrollWidth, clientWidth, scrollLeft } = el;

    this.canScrollLeft = scrollLeft > 0;
    this.canScrollRight = scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth - 1;
  }

  private scrollByDirection(direction: 'left' | 'right') {
    const el = this.scrollContainerRef.value;
    if (!el) return;

    const scrollAmount = Math.floor(el.clientWidth * 0.35);

    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }

  render() {
    return html`
      <div class="relative">
        <div
          ${ref(this.scrollContainerRef)}
          class="flex gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap py-1"
          @scroll=${this.checkOverflow}
        >
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

        <div
          class="absolute top-0 bottom-0 flex items-center justify-center cursor-pointer z-20 left-0 border-r border-base-content/70 bg-base-100 
          ${this.canScrollLeft ? '' : 'hidden'}"
          @click=${() => this.scrollByDirection('left')}
        >
          ${OutlineChevronLeftIcon('w-6 h-6 text-base-content/70')}
        </div>

        <div
          class="absolute top-0 bottom-0 flex items-center justify-center cursor-pointer z-20 right-0 border-l border-base-content/70 bg-base-100 
          ${this.canScrollRight ? '' : 'hidden'}"
          @click=${() => this.scrollByDirection('right')}
        >
          ${OutlineChevronRightIcon('w-6 h-6 text-base-content/70')}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'genre-badges': GenreBadges;
  }
}
