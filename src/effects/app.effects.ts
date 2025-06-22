import type { LoginRequest, LoginResponse } from '../models/models';
import HttpService from '../services/http.service';
import { tryCatch } from '../utils/try-catch';
import { env } from '../config';
import { Router } from '@vaadin/router';

export class AppEffects {
    private httpService: HttpService;

    constructor() {
        this.httpService = new HttpService(env.MOVIEDB_API_BASE_URL);
    }

    async login(loginData: LoginRequest) {
        const { data, error } = await tryCatch(
            this.httpService.post<LoginResponse>('/login', loginData)
        );

        if (error) return;

        if (data) Router.go('/');
    }
}

export const appEffects = new AppEffects();