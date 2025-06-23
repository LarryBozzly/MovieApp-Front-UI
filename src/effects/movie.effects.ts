import type { TrendingMovieListResponse } from '../models/models';
import HttpService from '../services/http.service';
import { tryCatch } from '../utils/try-catch';
import { env } from '../config';
import { appStore } from '../store/app-store';
import AuthService from '../services/auth.service';
import { Router } from '@vaadin/router';
import { authStore } from '../store/auth-store';

export class MovieEffects {
    private httpService: HttpService;
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
        this.httpService = new HttpService(env.MOVIEDB_API_BASE_URL);
    }

    async fetchTrendingMovies(page: number) {
        appStore.getState().setPage(page);
        appStore.getState().setLoading(true);

        const params = { language: 'en-US', page: appStore.getState().page };

        const { data, error } = await tryCatch(
            this.httpService.get<TrendingMovieListResponse>('/movie/now_playing', params)
        );
        appStore.getState().setLoading(false);

        if (error) {
            const isAuthorized = await this.authService.isAuthorized();
            authStore.getState().setAuthorization(isAuthorized);
            if (!isAuthorized) {
                Router.go('/login')
            }
            return;
        }

        const movies = data?.results ?? [];
        appStore.getState().setMovies(movies);
    }
}

export const movieEffects = new MovieEffects();