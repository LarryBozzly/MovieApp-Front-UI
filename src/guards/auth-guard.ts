import type { Commands, RouteContext } from "@vaadin/router";
import AuthService from "../services/auth.service";
import { authStore } from "../store/auth-store";

export async function authGuard(context: RouteContext, commands: Commands) {
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
    // If already on /login, do nothing (allow navigation)
    return undefined;
  }

  return undefined;
}
