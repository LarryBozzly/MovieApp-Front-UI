import { routes } from '@routes/app.routes';
import { authGuard } from '@guards/auth-guard';
import { publicGuard } from '@guards/public-guard';

export interface NavigationState {
  isHome: boolean;
  isPublicPage: boolean;
  isPrivatePage: boolean;
  path: string;
}

class NavigationService {
  private static instance: NavigationService;
  private path = typeof window !== 'undefined' ? window.location.pathname : '';
  private listeners: Set<(path: string) => void> = new Set();

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', this.handleRouteChange);
      window.addEventListener('vaadin-router-location-changed', this.handleRouteChange);
    }
  }

  public static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  public getPath(): string {
    return this.path;
  }

  public onRouteChange(callback: (path: string) => void): void {
    this.listeners.add(callback);
  }

  public removeRouteChangeListener(callback: (path: string) => void): void {
    this.listeners.delete(callback);
  }

  public destroy(): void {
    window.removeEventListener('popstate', this.handleRouteChange);
    window.removeEventListener('vaadin-router-location-changed', this.handleRouteChange);
    this.listeners.clear();
  }

  private handleRouteChange = (): void => {
    this.path = window.location.pathname;
    for (const listener of this.listeners) {
      listener(this.path);
    }
  };

  private getPrivatePages(): string[] {
    const pages: string[] = [];

    routes.forEach((route) => {
      if (route.action === authGuard) {
        if (route.path) pages.push(route.path);
        if (Array.isArray(route.children)) {
          route.children.forEach((child) => {
            if (child.path) pages.push(child.path);
          });
        }
      }
    });

    return pages;
  }

  private getPublicPages(): string[] {
    const pages: string[] = [];

    routes.forEach((route) => {
      if (route.action === publicGuard) {
        if (route.path) pages.push(route.path);
      }
    });

    return pages;
  }

  private matchesPage(page: string): boolean {
    if (page === '/') return this.path === '/';
    return this.path === page || this.path.startsWith(page + '/');
  }

  public isPublicPage(): boolean {
    return this.getPublicPages().some((p) => p && this.matchesPage(p));
  }

  public isPrivatePage(): boolean {
    return this.getPrivatePages().some((p) => p && this.matchesPage(p));
  }

  public isHome(): boolean {
    return this.path === '/';
  }
}

export default NavigationService;
