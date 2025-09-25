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

    // Remove app-root to "freeze" the app
    const appRoot = document.querySelector('app-root');
    if (appRoot) appRoot.remove();

    authService.stopRefreshTimer();

    // Inject offline spinner
    let spinner = document.getElementById('offline-spinner');
    if (!spinner) {
      spinner = document.createElement('div');
      spinner.id = 'offline-spinner';
      spinner.innerHTML = `
        <div class="fixed top-0 left-0 w-full h-screen flex items-center justify-center bg-black/65 z-[9999]">
          <span class="loading loading-spinner text-white w-16 h-16"></span>
        </div>
      `;
      document.body.appendChild(spinner);
    }

    // Reload once online
    window.addEventListener(
      'online',
      () => {
        spinner?.remove();         // remove spinner
        window.location.reload();  // reload app
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
