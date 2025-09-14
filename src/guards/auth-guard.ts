import type { Commands, RouteContext } from "@vaadin/router";
import AuthService from "../services/auth.service";
import { authStore } from "../store/auth-store";

export async function authGuard(context: RouteContext, commands: Commands) {
  const authService = await AuthService.getInstance();

  // 🛑 If offline → freeze navigation and don't redirect
  if (!navigator.onLine) {
    console.log("[AuthGuard] Offline → skipping redirect");
    authStore.getState().setLoading(true); // optional: show your loading overlay
    return commands.prevent(); // stops navigation change
  }

  // ✅ Online: refresh store if needed
  if (authService.isAuthorized() && !authStore.getState().isAuthorized) {
    await authStore.getState().refresh();
  }

  if (!authService.isAuthorized() && authService.hasRefreshTokenFlag()) {
    await authStore.getState().refresh();
  }

  // ❌ Not authorized → only redirect if online
  if (!authService.isAuthorized()) {
    if (context.pathname !== "/login") {
      return commands.redirect("/login");
    }
    // If already on /login, stay there
    return undefined;
  }

  return undefined; // Authorized, let navigation continue
}
