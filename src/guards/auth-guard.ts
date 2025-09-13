import type { Commands, RouteContext } from "@vaadin/router";
import AuthService from "../services/auth.service";
import { authStore } from "../store/auth-store";

export async function authGuard(context: RouteContext, commands: Commands) {
  // 1️⃣ Check if offline first
  if (!navigator.onLine) {
    // Enter loading state
    authStore.getState().setLoading(true);

    // Wait for internet to come back before retrying auth
    window.addEventListener(
      "online",
      async () => {
        authStore.getState().setLoading(false);
        // Retry refresh when back online
        const authService = await AuthService.getInstance();
        if (!authService.isAuthorized() && authService.hasRefreshTokenFlag()) {
          await authStore.getState().refresh();
        }
      },
      { once: true }
    );

    // Stay on current route, do not redirect
    return undefined;
  }

  // 2️⃣ Normal auth flow (online)
  const authService = await AuthService.getInstance();

  if (authService.isAuthorized() && !authStore.getState().isAuthorized) {
    await authStore.getState().refresh();
  }

  if (!authService.isAuthorized() && authService.hasRefreshTokenFlag()) {
    await authStore.getState().refresh();
  }

  if (!authService.isAuthorized()) {
    if (context.pathname !== "/login") {
      return commands.redirect("/login");
    }
    return undefined; // already on login, allow
  }

  return undefined; // authorized, allow navigation
}
