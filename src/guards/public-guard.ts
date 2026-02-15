import type { Commands, RouteContext } from '@vaadin/router';
import { authStore } from '@store/auth-store';
import AuthService from '@services/auth.service';

function getOutlet(): HTMLElement | null {
  return document.querySelector('app-root')?.shadowRoot?.getElementById('outlet') ?? null;
}

export async function publicGuard(context: RouteContext, commands: Commands) {
  const isAuthorized = AuthService.getInstance().isAuthorized();
  authStore.getState().setAuthorization(isAuthorized);
  if (isAuthorized) return commands.redirect('/');

  if (window.location.pathname !== context.pathname) {
    const outlet = getOutlet();
    outlet?.style.setProperty('opacity', '0');
    commands.prevent();
    window.location.href = context.pathname;
  }
  return undefined;
}
