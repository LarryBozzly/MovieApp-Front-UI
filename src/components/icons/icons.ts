import { html } from 'lit';
import type { TemplateResult } from 'lit';

export const FilledHeartIcon = (className = 'w-6 h-6 text-primary'): TemplateResult => html`
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="${className}">
    <path fill-rule="evenodd" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.13 2.44h1.74C14.09 5.01 15.76 4 17.5 4 20 4 22 6 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" clip-rule="evenodd"/>
  </svg>
`;

export const OutlineHeartIcon = (className = 'w-6 h-6 text-primary opacity-50 hover:opacity-100 transition-opacity duration-200'): TemplateResult => html`
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="${className}">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.13 2.44h2.74C14.09 5.01 15.76 4 17.5 4 20 4 22 6 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21z"/>
  </svg>
`;
