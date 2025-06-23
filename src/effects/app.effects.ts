import type { LoginRequest, LoginResponse } from '../models/models';
import HttpService from '../services/http.service';
import { tryCatch } from '../utils/try-catch';
import { env } from '../config';
import { Router } from '@vaadin/router';
import AuthService from '../services/auth.service';
import { authStore } from '../store/auth-store';

export class AppEffects {
    private httpService: HttpService;
    private authService: AuthService;
    constructor() {
        this.httpService = new HttpService(env.MOVIEDB_API_BASE_URL);
        this.authService = new AuthService();
    }

    async login(loginData: LoginRequest) {
        authStore.getState().setLoading(true);

        const { error } = await tryCatch(
            this.httpService.post<LoginResponse>('/login', loginData)
        );
        const isAuthorized = await this.authService.isAuthorized();
        authStore.getState().setAuthorization(isAuthorized);
        authStore.getState().setLoading(false);

        if (error) return;

        if (isAuthorized) {
            Router.go('/');
        }
    }

    async logout() {
        authStore.getState().setLoading(true);
        await tryCatch(this.httpService.get('/logout'));

        authStore.getState().setLoading(false);

        authStore.getState().setAuthorization(false);
        Router.go('/login');
    }
}

export const appEffects = new AppEffects();