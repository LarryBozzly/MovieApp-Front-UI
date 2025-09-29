import type { Commands, RouteContext } from "@vaadin/router";
import AuthService from "../services/auth.service";
import { authStore } from "../store/auth-store";
import { safeRefresh } from "../utils/safe-refresh";

export async function authGuard(context: RouteContext, commands: Commands) {
  const authService = await AuthService.getInstance();


  const refreshFn = authStore.getState().refresh;

  if (authService.isAuthorized() && !authStore.getState().isAuthorized) {
    // Use the protected wrapper
    await safeRefresh(refreshFn);
  }

  // Case 2: Not authorized in service but has refresh token flag (needs full re-auth).
  if (!authService.isAuthorized() && authService.hasRefreshTokenFlag()) {
    await safeRefresh(refreshFn);
  }

  // Case 3: Not authorized and no refresh attempt is possible/needed.
  if (!authService.isAuthorized()) {
    if (context.pathname !== "/login") {
      return commands.redirect("/login");
    }
    return undefined;
  }

  return undefined;
}
