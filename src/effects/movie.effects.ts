import type { TrendingMovieListResponse } from '../models/models';
import HttpService from '../services/http.service';
import { tryCatch } from '../utils/try-catch';
import { env } from '../config';
import { appStore } from '../store/app-store';

export class MovieEffects {
    private httpService: HttpService;

    constructor() {
        this.httpService = new HttpService(env.MOVIEDB_API_BASE_URL, env.MOVIEDB_API_KEY);
    }

    async fetchTrendingMovies(page: number) {
        appStore.getState().setPage(page);

        const params = { language: 'en-US', page: appStore.getState().page };

        const { data, error } = await tryCatch(
            this.httpService.get<TrendingMovieListResponse>('/movie/now_playing', params)
        );

        if (error) {
            console.error('Failed to fetch trending movies:', error);
            return;
        }

        const movies = data?.results ?? [];
        appStore.getState().setMovies(movies);
    }
}

export const movieEffects = new MovieEffects();