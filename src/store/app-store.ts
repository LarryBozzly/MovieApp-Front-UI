import { createStore, type StoreApi } from 'zustand/vanilla';
import type { Movie, TrendingMovieListResponse } from '../models/models';
import type HttpService from '../services/http.service';
import type AuthService from '../services/auth.service';
import type { AuthState } from './auth-store'; // <-- Import the type, not the instance
import { tryCatch } from '../utils/try-catch';
import { Router } from '@vaadin/router';

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

export const appStore = createStore<AppState>((set, get) => ({
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
    fetchTrendingMovies: async (page: number) => {
        const deps = get().deps;
        if (!deps) throw new Error('Dependencies not set!');

        const { httpService, authService, authStore } = deps;
        const { setPage, setLoading, setMovies } = get();
        setPage(page);
        setLoading(true);

        const params = { language: 'en-US', page: get().page };

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
    }
}));

// selectors 
export const selectIsLoading = (state: AppState) => state.isLoading;
export const selectMovies = (state: AppState) => state.movies;
export const selectPage = (state: AppState) => state.page;