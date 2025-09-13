import type { Commands, RouteContext } from "@vaadin/router";
import AuthService from "../services/auth.service";
import { authStore } from "../store/auth-store";

export async function authGuard(context: RouteContext, commands: Commands) {
  const authService = await AuthService.getInstance();

  // Refresh store if needed
  if (authService.isAuthorized() && !authStore.getState().isAuthorized) {
    await authStore.getState().refresh();
  }

  if (!authService.isAuthorized() && authService.hasRefreshTokenFlag()) {
    await authStore.getState().refresh();
  }

  // Only redirect to login if user is NOT authorized
  if (!authService.isAuthorized()) {
    // ✅ Only redirect if online
    if (navigator.onLine) {
      if (context.pathname !== "/login") {
        return commands.redirect("/login");
      }
    } else {
      // Offline: optionally set a loading state
      authStore.getState().setLoading(true);
      // Stay on current page and wait for network
      return undefined;
    }
  }

  return undefined; // Authorized or offline → allow navigation
}
