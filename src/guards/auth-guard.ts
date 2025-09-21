import type { Commands, RouteContext } from "@vaadin/router";
import AuthService from "../services/auth.service";
import { authStore } from "../store/auth-store";

export async function authGuard(context: RouteContext, commands: Commands) {
  const authService = await AuthService.getInstance();

  // --------------------------
  // Pause app if offline
  // --------------------------
  if (!navigator.onLine) {
    // Show spinner
    authStore.getState().setLoading(true);

    // Remove app-root from DOM
    const appRoot = document.querySelector('app-root');
    if (appRoot) appRoot.remove();

    // Add a one-time listener to reload when back online
    window.addEventListener(
      "online",
      () => {
        window.location.reload();
      },
      { once: true }
    );

    return; // stop guard until internet returns
  }

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
    // If already on /login, do nothing (allow navigation)
    return undefined;
  }

  return undefined;
}
