import type { Commands, RouteContext } from "@vaadin/router";
import { authStore } from "../store/auth-store";

export async function loginGuard(_context: RouteContext, commands: Commands) {
    const isAuthorized = authStore.getState().isAuthorized;
    return isAuthorized ? commands.redirect('/') : undefined;
}