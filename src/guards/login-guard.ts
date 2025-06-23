import type { Commands, RouteContext } from "@vaadin/router";
import AuthService from "../services/auth.service";
import { authStore } from "../store/auth-store";

export async function loginGuard(_context: RouteContext, commands: Commands) {
    const isAuthorized = await new AuthService().isAuthorized();
    authStore.getState().setAuthorization(isAuthorized);
    return isAuthorized ? commands.redirect('/') : undefined;
}