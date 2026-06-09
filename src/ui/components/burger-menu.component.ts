import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { tailwindStyles } from '@utils/app.constants';
import { Router } from '@vaadin/router';
import { MenuIcon, CloseIcon } from '@ui/icons';

interface MenuItem {
  label: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { label: 'Sign Up', path: '/signup' },
  { label: 'Login', path: '/login' },
  { label: 'Terms', path: '/terms' },
  { label: 'Privacy', path: '/privacy' },
];

@customElement('burger-menu-component')
export class BurgerMenuComponent extends LitElement {
  @state() private isOpen = false;

  static styles = css`
    ${tailwindStyles}
    .menu a:active {
      background-color: rgba(0, 0, 0, 0.05) !important;
    }
  `;

  private toggle() {
    this.isOpen = !this.isOpen;
  }

  private close() {
    this.isOpen = false;
  }

  private navigate(path: string) {
    this.close();
    Router.go(path);
  }

  private handleOverlayClick() {
    this.close();
  }

  render() {
    return html`
      <div class="flex items-center gap-3">
        <nav class="hidden md:flex items-center gap-1">
          ${menuItems.map(
            (item) => html`
              <a
                href="${item.path}"
                class="desktop-link btn btn-ghost btn-sm text-xs uppercase tracking-wider font-bold text-primary no-underline"
              >
                ${item.label}
              </a>
            `
          )}
        </nav>

        <button class="btn btn-ghost btn-circle md:hidden" @click=${this.toggle} aria-label="Menu">
          ${this.isOpen ? CloseIcon('w-6 h-6 text-base-content') : MenuIcon()}
        </button>

        ${this.isOpen ? this.renderDrawer() : ''}
      </div>
    `;
  }

  private renderDrawer() {
    return html`
      <div
        class="fixed top-16 right-0 bottom-0 left-0 z-[100] md:hidden"
        @click=${this.handleOverlayClick}
      >
        <div class="absolute inset-0 bg-black/40"></div>
        <div class="absolute inset-0 bg-base-100" @click=${(e: Event) => e.stopPropagation()}>
          <ul class="menu p-4 gap-1 w-full">
            ${menuItems.map(
              (item) => html`
                <li>
                  <a
                    @click=${() => this.navigate(item.path)}
                    class="flex items-center px-4 py-3 text-primary font-semibold rounded-lg"
                  >
                    ${item.label}
                  </a>
                </li>
              `
            )}
          </ul>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'burger-menu-component': BurgerMenuComponent;
  }
}
