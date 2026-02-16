import type { Commands, RouteContext } from '@vaadin/router';
import { authStore } from '@store/auth-store';
import AuthService from '@services/auth.service';

export async function publicGuard(_context: RouteContext, commands: Commands) {
  const isAuthorized = AuthService.getInstance().isAuthorized();
  authStore.getState().setAuthorization(isAuthorized);
  return isAuthorized ? commands.redirect('/') : undefined;
}
