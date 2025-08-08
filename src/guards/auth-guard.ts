import type { Commands, RouteContext } from "@vaadin/router";
import AuthService from "../services/auth.service";
import { authStore } from "../store/auth-store";

const authService = new AuthService();

export async function authGuard(context: RouteContext, commands: Commands) {
    let isAuthorized = authService.isAuthorized();

    if (context.pathname === '/login' && isAuthorized) {
        return commands.redirect('/');
    }

    // If refresh token flag exists and not on /login, always try refresh
    if (authService.hasRefreshTokenFlag() && context.pathname !== '/login') {
        await authStore.getState().refresh();
        isAuthorized = authStore.getState().isAuthorized;
    }

    // If still unauthorized and not on /login, redirect login
    if (!isAuthorized && context.pathname !== '/login') {
        return commands.redirect('/login');
    }

    return undefined;
}
