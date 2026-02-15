import type { Commands, RouteContext } from '@vaadin/router';
import { authStore } from '@store/auth-store';
import AuthService from '@services/auth.service';

export async function publicGuard(context: RouteContext, commands: Commands) {
  const isAuthorized = await AuthService.getInstance().isAuthorized();
  authStore.getState().setAuthorization(isAuthorized);
  if (isAuthorized) return commands.redirect('/');
  if (context.redirectFrom === '/') {
    document.body.style.opacity = '0';
    window.location.replace(context.pathname);
    return commands.prevent();
  }
  return undefined;
}
