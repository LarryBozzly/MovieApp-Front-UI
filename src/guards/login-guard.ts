import type { Commands, RouteContext } from "@vaadin/router";
import AuthService from "../services/auth.service";

export async function loginGuard(_context: RouteContext, commands: Commands) {
    const isAuthorized = await new AuthService().isAuthorized();
    return isAuthorized ? commands.redirect('/') : undefined;
}