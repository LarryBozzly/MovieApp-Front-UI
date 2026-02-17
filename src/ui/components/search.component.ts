import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ref } from 'lit/directives/ref.js';
import { tailwindStyles } from '@utils/app.constants';
import { watch } from 'zustand-lit';
import { appStore, type AppState } from '@store/app-store';
import { MovieCategory } from '@models/models';
import { debounce } from '@utils/debounce';
import { SearchIcon } from '@ui/icons';

@customElement('search-component')
export class SearchComponent extends LitElement {
  @watch(appStore) appState!: AppState;
  @property() query!: string;

  private inputRef: HTMLInputElement | undefined;

  static styles = css`
    ${tailwindStyles}
    .clear-icon {
      color: var(--color-primary);
      cursor: pointer;
      transition: opacity 0.2s;
      flex-shrink: 0;
    }
  `;

  private debouncedDispatch = debounce((query: string) => {
    this.dispatchEvent(
      new CustomEvent('onSearchInput', {
        detail: { query },
        bubbles: true,
        composed: true,
      })
    );
  }, 200);

  private handleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value === '') return this.clearSearch();

    this.debouncedDispatch(input.value);
  }

  private clearSearch(): void {
    this.dispatchEvent(
      new CustomEvent('onCategoryChanged', {
        detail: { category: MovieCategory.TRENDING },
        bubbles: true,
        composed: true,
      })
    );
    this.inputRef?.focus();
  }

  private focusInput(): void {
    this.inputRef?.focus();
  }

  render() {
    const hasText = this.query.length > 0;
    return html`
      <label class="w-full input flex items-center gap-2 ">
        ${SearchIcon()}
        <input
          type="text"
          class="grow"
          placeholder="Search"
          .value=${this.query}
          ${ref((el) => (this.inputRef = el as HTMLInputElement))}
          @input=${this.handleInput}
          @pointerup=${this.focusInput}
        />

        <svg
          class=${classMap({
            'clear-icon': true,
            'opacity-100': hasText,
            'opacity-0': !hasText,
            'pointer-events-auto': hasText,
            'pointer-events-none': !hasText,
          })}
          @pointerup=${this.clearSearch}
          height="1.2em"
          width="1.2em"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
          />
        </svg>
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'search-component': SearchComponent;
  }
}
