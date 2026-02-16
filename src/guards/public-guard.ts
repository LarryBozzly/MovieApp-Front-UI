import type { Commands, RouteContext } from '@vaadin/router';
import { authStore } from '@store/auth-store';
import AuthService from '@services/auth.service';
import { updateSW } from '@utils/update-sw';

// οnly for unauthenticated users, if authenticated redirect to home page
export async function publicGuard(_context: RouteContext, commands: Commands) {
  updateSW();
  const isAuthorized = AuthService.getInstance().isAuthorized();
  authStore.getState().setAuthorization(isAuthorized);
  return isAuthorized ? commands.redirect('/') : undefined;
}
