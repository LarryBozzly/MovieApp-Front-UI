import { createStore, type StoreApi } from 'zustand/vanilla';
import type { FavoriteMoviesIdsResponse, FavoriteMoviesResponse, FavoriteState, Movie, MoviesResponse } from '../models/models';
import type HttpService from '../services/http.service';
import type AuthService from '../services/auth.service';
import type { AuthState } from './auth-store';
import { tryCatch } from '../utils/try-catch';
import { createEffect } from '../utils/create-effect.functions';
import type ModalService from '../services/modal.service';
import '../components/send-invite-modal.component';
import '../components/invitation-notification-modal.component';
import '../components/movie-match-modal.component';
import '../components/movie-match-result-modal.component';

export interface AppState {
    deps?: {
        httpService: HttpService;
        authService: AuthService;
        authStore: StoreApi<AuthState>;
        modalService: ModalService;
    };
    page: number;
    movies: Movie[];
    favoritesIds: Record<number, FavoriteState>;
    isLoading: boolean;
    storeInit: (deps: Required<AppState>['deps']) => void;
    setLoading: (loading: boolean) => void;
    setPage: (value: number) => void;
    setMovies: (movies: Movie[]) => void;
    setFavoritesIds: (ids: Record<number, FavoriteState>) => void;
    fetchTrendingMovies: (page: number) => Promise<void>;
    fetchFavoritesIds: () => Promise<void>;
    addToFavorites: (movie: Movie) => Promise<void>;
    removeFromFavorites: (movie: Movie) => Promise<void>;
    openSendInvitationModal: () => Promise<void>;
    openReceivedInvitationModal: (fromTag: string) => Promise<void>;
    openStartMovieMatchModal: (movies: Movie[]) => Promise<void>;
    openMovieMatchModal: (movie: Movie) => Promise<void>;
    closeModal: () => Promise<void>;
}

export const appStore = createStore<AppState>((set, _get, store) => ({
    page: 1,
    movies: [],
    favoritesIds: {},
    isLoading: false,
    deps: undefined,
    // reducers
    storeInit: (deps) => set({ deps }),
    setLoading: (isLoading: boolean) => set({ isLoading }),
    setPage: (value: number) => set((state) => ({ ...state, page: value })),
    setMovies: (movies: Movie[]) => set((state) => ({ ...state, movies: [...state.movies, ...movies] })),
    setFavoritesIds: (ids: Record<number, FavoriteState>) => set((state) => ({
        favoritesIds: {
            ...state.favoritesIds,
            ...ids,
        },
    })),
    fetchTrendingMovies: createEffect(store, async (deps, store, page: number) => {
        const { httpService } = deps;
        const { setPage, setLoading, setMovies } = store.getState();
        setPage(page);
        setLoading(true);

        const params = { language: 'en-US', page };

        const { data } = await tryCatch(
            httpService.get<MoviesResponse>('/movie/now_playing', params)
        );

        setLoading(false);
        const movies = data?.results ?? [];
        setMovies(movies);
    }),
    fetchFavoritesIds: createEffect(store, async (deps, store) => {
        const { httpService } = deps;
        const { setLoading, setFavoritesIds } = store.getState();
        setLoading(true);

        const { data } = await tryCatch(
            httpService.get<FavoriteMoviesIdsResponse>('/movie/favorites/ids')
        );

        setLoading(false);
        if (data?.mediaIds.length) {
            const idsRecord: Record<number, FavoriteState> = {};
            data.mediaIds.forEach((id) => {
                idsRecord[id] = { isFavorite: true, isLoading: false };
            });

            setFavoritesIds(idsRecord);
        }
    }),
    addToFavorites: createEffect(store, async (deps, store, movie: Movie) => {
        const { httpService } = deps;
        const { setLoading, setFavoritesIds } = store.getState();

        const currentFavorites = { ...selectFavoriteIds(store.getState()) }; // clone
        const prev = currentFavorites[movie.id];

        setLoading(true);
        setFavoritesIds({
            [movie.id]: { isFavorite: prev?.isFavorite ?? false, isLoading: true },
        });

        const body = { mediaId: movie.id };
        const { data } = await tryCatch(
            httpService.post<FavoriteMoviesResponse>('/movie/favorites', body)
        );

        setLoading(false);
        setFavoritesIds({
            [movie.id]: { isFavorite: data?.success ?? false, isLoading: false },
        });

    }),
    removeFromFavorites: createEffect(store, async (deps, store, movie: Movie) => {
        const { httpService } = deps;
        const { setLoading, setFavoritesIds } = store.getState();

        const currentFavorites = { ...selectFavoriteIds(store.getState()) }; // clone
        const prev = currentFavorites[movie.id];

        setLoading(true);
        setFavoritesIds({
            [movie.id]: { isFavorite: prev?.isFavorite ?? true, isLoading: true },
        });


        const { data } = await tryCatch(
            httpService.delete<FavoriteMoviesResponse>(`/movie/favorites/${movie.id}`)
        );

        setLoading(false);
        setFavoritesIds({
            [movie.id]: { isFavorite: data?.success ? false : true, isLoading: false },
        });
    }),
    openSendInvitationModal: createEffect(store, async (deps, _store) => {
        const { modalService } = deps;
        modalService.open({ tag: 'send-invite-modal-component' });
    }),
    openReceivedInvitationModal: createEffect(store, async (deps, _store, fromTag: string) => {
        const { modalService } = deps;
        modalService.open({ tag: 'invitation-notification-modal-component', props: { tag: fromTag } });
    }),
    openStartMovieMatchModal: createEffect(store, async (deps, _store, movies: Movie[]) => {
        const { modalService } = deps;

        modalService.open({ tag: 'movie-match-modal-component', props: { movies } });
    }),
    openMovieMatchModal: createEffect(store, async (deps, store, movie: Movie) => {
        const { modalService } = deps;
        const { closeModal } = store.getState();

        modalService.open({
            tag: 'movie-match-result-modal',
            props: {
                movie,
                onClose: closeModal,
            }
        });
    }),
    closeModal: createEffect(store, async (deps, _store) => {
        const { modalService } = deps;
        modalService.close();
    }),
}));

// selectors 
export const selectIsLoading = (state: AppState) => state.isLoading;
export const selectMovies = (state: AppState) => state.movies;
export const selectFavoriteIds = (state: AppState) => state.favoritesIds;
export const selectPage = (state: AppState) => state.page;