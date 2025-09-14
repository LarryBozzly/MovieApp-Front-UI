import type { Commands, RouteContext } from "@vaadin/router";
import AuthService from "../services/auth.service";
import { authStore } from "../store/auth-store";

// Helper: wait until online
async function waitForOnline(): Promise<void> {
  if (navigator.onLine) return;

  await new Promise<void>((resolve) => {
    window.addEventListener(
      "online",
      () => resolve(),
      { once: true }
    );
  });
}

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
    if (!navigator.onLine) {
      console.log("[AuthGuard] Offline → waiting to come online");
      await waitForOnline();
      console.log("[AuthGuard] Back online → updating state");

      // ✅ Once back online, trigger refresh
      await authStore.getState().refresh();

      // Let user stay on current route
      return undefined;
    }

    // ✅ Online → normal redirect to login
    if (context.pathname !== "/login") {
      return commands.redirect("/login");
    }

    return undefined; // Already on /login
  }

  // Authorized → allow navigation
  return undefined;
}
