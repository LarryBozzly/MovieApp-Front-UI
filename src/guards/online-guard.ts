import type { Commands, RouteContext, PreventResult } from "@vaadin/router";

export function onlineGuard(context: RouteContext, commands: Commands): PreventResult | undefined {
  if (navigator.onLine) return undefined; // online, allow navigation

  alert("You are offline. The app will resume when back online.");

  const resumeRoute = () => {
    window.removeEventListener("online", resumeRoute);
    // reload the page to the same path
    window.location.href = context.pathname;
  };

  window.addEventListener("online", resumeRoute);

  return commands.prevent(); // stop navigation for now
}
