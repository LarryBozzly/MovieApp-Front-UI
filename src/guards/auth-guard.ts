import type { Commands, RouteContext } from "@vaadin/router";
import AuthService from "../services/auth.service";

export async function authGuard(context: RouteContext, commands: Commands) {
    const isAuthorized = await new AuthService().isAuthorized();
    if (!isAuthorized) {
        if (context.pathname !== '/login') {
            return commands.redirect('/login');
        }
        // If already on /login, do nothing (allow navigation)
        return undefined;
    }

    return undefined;
}