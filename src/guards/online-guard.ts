import type { Commands, RouteContext } from "@vaadin/router";
import { Router } from "@vaadin/router";

export function onlineGuard(context: RouteContext, commands: Commands) {
  if (!navigator.onLine) {
    // Wait for online event
    window.addEventListener(
      "online",
      () => {
        // Once online, retry the navigation to the same path
        Router.go(context.pathname);
      },
      { once: true }
    );

    // Optionally show a message overlay
    alert("You are offline. The app will reload when back online.");

    // Prevent the current navigation until online
    return commands.prevent();
  }

  // Allow navigation if online
  return undefined;
}
