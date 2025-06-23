import type { Commands, RouteContext } from "@vaadin/router";
import { authStore } from "../store/auth-store";

export async function authGuard(context: RouteContext, commands: Commands) {
    const isAuthorized = authStore.getState().isAuthorized;
    if (!isAuthorized) {
        if (context.pathname !== '/login') {
            return commands.redirect('/login');
        }
        // If already on /login, do nothing (allow navigation)
        return undefined;
    }

    return undefined;
}