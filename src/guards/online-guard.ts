async function waitForOnlineOnce(): Promise<void> {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve();
    } else {
      const handleOnline = () => {
        window.removeEventListener("online", handleOnline);
        resolve();
      };
      window.addEventListener("online", handleOnline);
    }
  });
}

// This flag ensures we only block on the very first guard call
let hasWaited = false;

import type { Commands, RouteContext } from "@vaadin/router";

export async function onlineGuard(_context: RouteContext, _commands: Commands) {
  if (!hasWaited) {
    await waitForOnlineOnce();
    hasWaited = true; // ✅ next navigations won't be blocked
  }
  return undefined; // allow routing to continue
}
