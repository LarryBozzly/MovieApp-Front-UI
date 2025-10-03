import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { tailwindStyles } from '../utils/app.constants';
import { watch, watchWithSelector } from 'zustand-lit';
import { appStore, selectQuery, type AppState } from '../store/app-store';
import { MovieCategory } from '../models/models';

@customElement('search-component')
export class SearchComponent extends LitElement {
    @watch(appStore) appState!: AppState;
    @watchWithSelector({ store: appStore, selector: selectQuery }) readonly query!: string;


    static styles = css`
        ${tailwindStyles}
        .clear-icon {
            color: var(--color-primary);
            cursor: pointer;
            transition: opacity 0.2s;
            flex-shrink: 0; 
        }
    `;

    private handleInput(event: Event) {
        const input = event.target as HTMLInputElement;

        this.dispatchEvent(
            new CustomEvent('onSearchInput', {
                detail: {
                    query: input.value,
                },
                bubbles: true,
                composed: true,
            })
        );
    }

    private clearSearch() {
        this.dispatchEvent(
            new CustomEvent('onCategoryChanged', {
                detail: { category: MovieCategory.TRENDING },
                bubbles: true,
                composed: true,
            })
        );
        this.renderRoot.querySelector('input')?.focus();
    }

    render() {
        const hasText = this.query.length > 0;
        return html`
            <label class="w-full input input-bordered input-primary flex items-center gap-2 focus:outline-primary">
                
                <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g
                    stroke-linejoin="round"
                    stroke-linecap="round"
                    stroke-width="2.5"
                    fill="none"
                    stroke="currentColor"
                    >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                    </g>
                </svg>
                
                <input 
                    type="text" 
                    class="grow" 
                    placeholder="Search" 
                    .value=${this.query}
                    @input=${this.handleInput}
                />
                
                <svg 
                    class=${classMap({ 'clear-icon': true, 'opacity-100': hasText, 'opacity-0': !hasText, 'pointer-events-auto': hasText, 'pointer-events-none': !hasText, })}
                    @click=${this.clearSearch}
                    height="1.2em" 
                    width="1.2em" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24"
                >
                    <path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
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