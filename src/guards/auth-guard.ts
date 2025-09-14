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

  // ❌ Not authorized
  if (!authService.isAuthorized()) {
    // 🛑 If offline → skip redirect, let user stay on current page
    if (!navigator.onLine) {
      console.log("[AuthGuard] Offline → skipping redirect to login");
      return undefined;
    }

    // ✅ Online → normal redirect
    if (context.pathname !== "/login") {
      return commands.redirect("/login");
    }

    // Already on /login → allow
    return undefined;
  }

  // Authorized → allow navigation
  return undefined;
}
