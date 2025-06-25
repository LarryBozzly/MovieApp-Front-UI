import { createStore, type StoreApi } from 'zustand/vanilla';
import type { Movie, TrendingMovieListResponse } from '../models/models';
import type HttpService from '../services/http.service';
import type AuthService from '../services/auth.service';
import type { AuthState } from './auth-store';
import { tryCatch } from '../utils/try-catch';
import { Router } from '@vaadin/router';
import { createEffect } from '../utils/create-effect.functions';

export interface AppState {
    deps?: {
        httpService: HttpService;
        authService: AuthService;
        authStore: StoreApi<AuthState>;
    };
    page: number;
    movies: Movie[];
    isLoading: boolean;
    storeInit: (deps: Required<AppState>['deps']) => void;
    setLoading: (loading: boolean) => void;
    setPage: (value: number) => void;
    setMovies: (movies: Movie[]) => void;
    fetchTrendingMovies: (page: number) => Promise<void>;
}

export const appStore = createStore<AppState>((set, _get, store) => ({
    page: 1,
    movies: [],
    isLoading: false,
    deps: undefined,
    // reducers
    storeInit: (deps) => set({ deps }),
    setLoading: (isLoading: boolean) => set({ isLoading }),
    setPage: (value: number) => set((state) => ({ ...state, page: value })),
    setMovies: (movies: Movie[]) => set((state) => ({ ...state, movies: [...state.movies, ...movies] })),
    // effects
    fetchTrendingMovies: createEffect(store, async (deps, store, page: number) => {
        const { httpService, authService, authStore } = deps;
        const { setPage, setLoading, setMovies } = store.getState();
        setPage(page);
        setLoading(true);

        const params = { language: 'en-US', page };

        const { data, error } = await tryCatch(
            httpService.get<TrendingMovieListResponse>('/movie/now_playing', params)
        );

        setLoading(false);

        if (error) {
            const isAuthorized = await authService.isAuthorized();
            authStore.getState().setAuthorization(isAuthorized);
            if (!isAuthorized) {
                Router.go('/login');
            }
            return;
        }
        const movies = data?.results ?? [];
        setMovies(movies);
    }),
}));

// selectors 
export const selectIsLoading = (state: AppState) => state.isLoading;
export const selectMovies = (state: AppState) => state.movies;
export const selectPage = (state: AppState) => state.page;