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
        const { error } = await tryCatch(
            this.httpService.post<LoginResponse>('/login', loginData)
        );
        const isAuthorized = await this.authService.isAuthorized();

        if (error) return;

        if (isAuthorized) {
            authStore.getState().setAuthorization(isAuthorized)
            Router.go('/');
        }
    }

    async logout() {
        const { error } = await tryCatch(this.httpService.get('/logout'));

        if (error) return;
        
        const isAuthorized = await this.authService.isAuthorized();
        authStore.getState().setAuthorization(isAuthorized)

        Router.go('/login');
    }
}

export const appEffects = new AppEffects();