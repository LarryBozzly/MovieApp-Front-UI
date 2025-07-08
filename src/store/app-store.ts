import { createStore, type StoreApi } from 'zustand/vanilla';
import type { Movie, MoviesResponse } from '../models/models';
import type HttpService from '../services/http.service';
import type AuthService from '../services/auth.service';
import type { AuthState } from './auth-store';
import { tryCatch } from '../utils/try-catch';
import { Router } from '@vaadin/router';
import { createEffect } from '../utils/create-effect.functions';
import type ModalService from '../services/modal.service';

export interface AppState {
    deps?: {
        httpService: HttpService;
        authService: AuthService;
        authStore: StoreApi<AuthState>;
        modalService: ModalService;
    };
    page: number;
    movies: Movie[];
    isLoading: boolean;
    storeInit: (deps: Required<AppState>['deps']) => void;
    setLoading: (loading: boolean) => void;
    setPage: (value: number) => void;
    setMovies: (movies: Movie[]) => void;
    fetchTrendingMovies: (page: number) => Promise<void>;
    openSendInvitationModal: () => Promise<void>;
    openReceivedInvitationModal: (fromTag: string) => Promise<void>;
    openStartMovieMatchModal: (movies: Movie[]) => Promise<void>;
    openMovieMatchModal: (movie: Movie) => Promise<void>;
    closeModal: () => Promise<void>;
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
            httpService.get<MoviesResponse>('/movie/now_playing', params)
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
    openSendInvitationModal: createEffect(store, async (deps, _store) => {
        const { modalService } = deps;

        await import('../components/send-invite-modal.component');
        modalService.open({ tag: 'send-invite-modal-component' });
    }),
    openReceivedInvitationModal: createEffect(store, async (deps, _store, fromTag: string) => {
        const { modalService } = deps;

        await import('../components/invitation-notification-modal.component');
        modalService.open({ tag: 'invitation-notification-modal-component', props: { tag: fromTag } });
    }),
    openStartMovieMatchModal: createEffect(store, async (deps, _store, movies: Movie[]) => {
        const { modalService } = deps;

        await import('../components/movie-match-modal.component');
        modalService.open({ tag: 'movie-match-modal-component', props: { movies } });
    }),
    openMovieMatchModal: createEffect(store, async (deps, _store, movie: Movie) => {
        const { modalService } = deps;

        await import('../components/movie-match-result-modal.component');
        modalService.open({ tag: 'movie-match-result-modal', props: { movie } });
    }),
    closeModal: createEffect(store, async (deps, _store) => {
        const { modalService } = deps;
        modalService.close();
    }),
}));

// selectors 
export const selectIsLoading = (state: AppState) => state.isLoading;
export const selectMovies = (state: AppState) => state.movies;
export const selectPage = (state: AppState) => state.page;