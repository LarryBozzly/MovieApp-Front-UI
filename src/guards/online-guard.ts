import type { Commands, RouteContext } from "@vaadin/router";

export async function onlineGuard(_context: RouteContext, _commands: Commands) {
    if (navigator.onLine) return;

    // Wait until online before continuing navigation
    await new Promise<void>((resolve) => {
        const handleOnline = () => {
            window.removeEventListener("online", handleOnline);
            resolve();
        };
        window.addEventListener("online", handleOnline);
    });

    return; // continue after resolving
}
