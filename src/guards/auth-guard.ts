import type { Commands, RouteContext } from "@vaadin/router";
import AuthService from "../services/auth.service";
import { authStore } from "../store/auth-store";

/**
 * Auth guard for Vaadin Router that handles offline scenarios.
 * - If online: normal auth flow + redirect to /login if not authorized.
 * - If offline: stay on current route, set loading state, auto-retry when connection is restored.
 */
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
    if (navigator.onLine) {
      // ✅ Online: redirect if not on login
      if (context.pathname !== "/login") {
        return commands.redirect("/login");
      }
    } else {
      // ⚠️ Offline: stay on current page and set loading state
      authStore.getState().setLoading(true);

      // Listen for the connection to come back online
      window.addEventListener(
        "online",
        async () => {
          authStore.getState().setLoading(false);

          // Re-run the auth guard by programmatically redirecting to the same path
          // This triggers Vaadin Router and the guard again
          commands.redirect(context.pathname);
        },
        { once: true } // Only run once
      );

      return undefined; // Do not redirect while offline
    }
  }

  return undefined; // Authorized or offline → allow navigation
}
