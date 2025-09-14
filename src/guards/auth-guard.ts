import type { Commands, RouteContext } from "@vaadin/router";
import AuthService from "../services/auth.service";
import { authStore } from "../store/auth-store";

export async function authGuard(context: RouteContext, commands: Commands) {
  const authService = await AuthService.getInstance();

  // 🛑 If offline → let the user stay on the current route
  if (!navigator.onLine) {
    console.log("[AuthGuard] Offline → allowing navigation without redirect");
    return undefined; // do nothing, stay on the page
  }

  // ✅ Online: refresh store if needed
  if (authService.isAuthorized() && !authStore.getState().isAuthorized) {
    await authStore.getState().refresh();
  }

  if (!authService.isAuthorized() && authService.hasRefreshTokenFlag()) {
    await authStore.getState().refresh();
  }

  // ❌ Not authorized → redirect to login
  if (!authService.isAuthorized()) {
    if (context.pathname !== "/login") {
      return commands.redirect("/login");
    }
    // Already on login → allow
    return undefined;
  }

  return undefined; // Authorized → allow navigation
}
