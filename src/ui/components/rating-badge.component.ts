import { LitElement, css, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { tailwindStyles } from '@utils/app.constants.ts';
import { StarIcon } from '@ui/icons';

type RatingSize = 'sm' | 'md';

/* radius chosen so the circle circumference is exactly 100,
   which lets the score map 1:1 onto stroke-dashoffset */
const RING_RADIUS = 15.9155;

@customElement('rating-badge')
export class RatingBadge extends LitElement {
  static styles = css`
    ${tailwindStyles}
    :host {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }
  `;

  @property({ type: Number }) voteAverage: number | null = null;
  @property({ type: Number }) voteCount = 0;
  @property({ type: String }) size: RatingSize = 'sm';

  private get percent(): number {
    return Math.round((this.voteAverage ?? 0) * 10);
  }

  private get ringColorClass(): string {
    if (this.percent >= 75) return 'stroke-success';
    if (this.percent >= 50) return 'stroke-warning';
    return 'stroke-error';
  }

  private formatVoteCount(count: number): string {
    if (count >= 1_000_000) {
      return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (count >= 1_000) {
      return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return count.toString();
  }

  private renderRing(): TemplateResult {
    const isSmall = this.size === 'sm';
    const ringSize = isSmall ? 'w-11 h-11' : 'w-14 h-14';
    const strokeWidth = isSmall ? '3' : '3.5';
    const percentLabelSize = isSmall ? 'text-xs' : 'text-sm';
    const percentSignSize = isSmall ? 'text-[0.5rem]' : 'text-[0.625rem]';

    return html`
      <div
        class="relative ${ringSize} rounded-full bg-black/60 backdrop-blur-sm"
        role="img"
        aria-label="Rated ${this.percent} percent"
      >
        <svg viewBox="0 0 36 36" class="${ringSize} -rotate-90">
          <circle
            cx="18"
            cy="18"
            r="${RING_RADIUS}"
            fill="none"
            stroke="rgba(255, 255, 255, 0.25)"
            stroke-width="${strokeWidth}"
          />
          <circle
            cx="18"
            cy="18"
            r="${RING_RADIUS}"
            fill="none"
            class="${this.ringColorClass}"
            stroke-width="${strokeWidth}"
            stroke-linecap="round"
            stroke-dasharray="100"
            stroke-dashoffset=${100 - this.percent}
          />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="${percentLabelSize} font-bold text-white leading-none">
            ${this.percent}<span class="${percentSignSize} font-medium">%</span>
          </span>
        </div>
      </div>
    `;
  }

  private renderVoteChip(): TemplateResult | null {
    if (this.voteCount <= 0) return null;

    const isSmall = this.size === 'sm';
    const iconSize = isSmall ? 'w-2.5 h-2.5' : 'w-3 h-3';
    const textSize = isSmall ? 'text-[0.625rem]' : 'text-xs';

    return html`
      <div
        class="flex items-center gap-1 rounded-full bg-base-100/80 backdrop-blur-sm px-1.5 py-0.5"
        title="${this.voteCount.toLocaleString('en-US')} votes"
      >
        ${StarIcon(`${iconSize} text-warning`)}
        <span class="${textSize} font-medium text-base-content/80 leading-none">
          ${this.formatVoteCount(this.voteCount)}
        </span>
      </div>
    `;
  }

  render() {
    if (this.voteAverage == null) return html``;

    return html`
      <div class="flex flex-col items-center gap-1">
        ${this.renderRing()} ${this.renderVoteChip()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rating-badge': RatingBadge;
  }
}
