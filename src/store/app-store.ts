import { createStore, type StoreApi } from 'zustand/vanilla';
import { ERROR_NAMES, MovieCategory, type FavoriteMoviesResponse, type FavoriteState, type Movie, type MovieListResponse, type MoviesResponse } from '../models/models';
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
    globalAbortController: AbortController;
    category: MovieCategory | undefined;
    onInitLoaded: boolean;
    page: number;
    maxPage: number;
    movies: Movie[];
    favoritesIds: Record<number, FavoriteState>;
    query: string;
    isLoading: boolean;
    storeInit: (deps: Required<AppState>['deps']) => void;
    setLoading: (loading: boolean) => void;
    setOnInitLoaded: (onInitLoaded: boolean) => void;
    setPage: (value: number) => void;
    setQuery: (query: string) => void;
    setMaxPage: (maxPage: number) => void;
    setCategory: (category: MovieCategory | undefined) => void;
    setMovies: (movies: Movie[]) => void;
    clearMovies: () => void;
    triggerAbort: () => Promise<void>
    setFavoritesIds: (ids: Record<number, FavoriteState>) => void;
    onInit: () => Promise<void>;
    fetchTrendingMovies: (page: number) => Promise<void>;
    fetchTopRatedMovies: (page: number) => Promise<void>;
    fetchFavoriteMovies: (page: number) => Promise<void>;
    fetchFindMovie: (page: number, query: string) => Promise<void>;
    fetchCategoryMovies: (category: MovieCategory | undefined, page: number, query?: string) => Promise<void>;
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
    maxPage: 1,
    movies: [],
    favoritesIds: {},
    query: '',
    isLoading: false,
    deps: undefined,
    globalAbortController: new AbortController(),
    category: undefined,
    onInitLoaded: false,
    // reducers
    storeInit: (deps) => set({ deps }),
    setLoading: (isLoading: boolean) => set({ isLoading }),
    setOnInitLoaded: (onInitLoaded: boolean) => set({ onInitLoaded }),
    setPage: (value: number) => set((state) => ({ ...state, page: value })),
    setQuery: (query: string) => set((state) => ({ ...state, query })),
    setMaxPage: (maxPage: number) => set((state) => ({ ...state, maxPage })),
    setCategory: (category: MovieCategory | undefined) => set((state) => ({ ...state, category })),
    setMovies: (movies: Movie[]) => set((state) => ({ ...state, movies: [...state.movies, ...movies] })),
    clearMovies: () => set({ movies: [] }),
    setFavoritesIds: (ids: Record<number, FavoriteState>) => set((state) => ({
        favoritesIds: {
            ...state.favoritesIds,
            ...ids,
        },
    })),
    onInit: createEffect(store, async (_deps, store) => {
        const { fetchCategoryMovies, setOnInitLoaded, page } = store.getState();
        await fetchCategoryMovies(MovieCategory.TRENDING, page);
        setOnInitLoaded(true);
    }),
    triggerAbort: createEffect(store, async (_deps, store) => {
        const { globalAbortController } = store.getState();
        globalAbortController.abort();
        set({ globalAbortController: new AbortController() });
    }),
    fetchCategoryMovies: createEffect(store, async (_deps, store, category: MovieCategory | undefined, page: number, query?: string) => {
        const { fetchTopRatedMovies, fetchTrendingMovies, fetchFavoriteMovies, fetchFindMovie, setQuery, setCategory, clearMovies, triggerAbort } = store.getState();
        triggerAbort();
        setCategory(category);
        clearMovies();
        setQuery('');
        if (category === MovieCategory.TRENDING) {
            await fetchTrendingMovies(page);
        } else if (category === MovieCategory.TOP_RATED) {
            await fetchTopRatedMovies(page);
        } else if (category === MovieCategory.FAVORITES) {
            await fetchFavoriteMovies(page);
        } else {
            await fetchFindMovie(page, query ?? '');
        }
    }),
    fetchTrendingMovies: createEffect(store, async (deps, store, page: number) => {
        const { httpService } = deps;
        const { setPage, setMaxPage, setLoading, setMovies, globalAbortController } = store.getState();
        setPage(page);
        setLoading(true);

        const params = { language: 'en-US', page };

        const { data, error } = await tryCatch(
            httpService.get<MoviesResponse>('/movie/now_playing', params, { signal: globalAbortController.signal })
        );
        if (error?.name === ERROR_NAMES.ABORT) return;

        setLoading(false);
        setMaxPage(data?.total_pages ?? 1);
        const movies = data?.results ?? [];
        setMovies(movies);
    }),
    fetchTopRatedMovies: createEffect(store, async (deps, store, page: number) => {
        const { httpService } = deps;
        const { setPage, setMaxPage, setLoading, setMovies, globalAbortController } = store.getState();
        setPage(page);
        setLoading(true);

        const params = { language: 'en-US', page };

        const { data, error } = await tryCatch(
            httpService.get<MoviesResponse>('/movie/top_rated', params, { signal: globalAbortController.signal })
        );
        if (error?.name === ERROR_NAMES.ABORT) return;

        setLoading(false);
        setMaxPage(data?.total_pages ?? 1);
        const movies = data?.results ?? [];
        setMovies(movies);
    }),
    fetchFindMovie: createEffect(store, async (deps, store, page: number, query: string) => {
        const { httpService } = deps;
        const { setPage, setMaxPage, setLoading, setQuery, setMovies, globalAbortController } = store.getState();
        setPage(page);
        setQuery(query);
        setLoading(true);

        const params = { query: encodeURIComponent(query) };

        const { data, error } = await tryCatch(
            httpService.get<MoviesResponse>('/movie/find', params, { signal: globalAbortController.signal })
        );
        if (error?.name === ERROR_NAMES.ABORT) return;

        setLoading(false);
        setMaxPage(data?.total_pages ?? 1);
        const movies = data?.results ?? [];
        setMovies(movies);
    }),
    fetchFavoriteMovies: createEffect(store, async (deps, store, page: number) => {
        const { httpService } = deps;
        const { setPage, setMaxPage, setLoading, setMovies, globalAbortController } = store.getState();
        setPage(page);
        setLoading(true);

        const params = { language: 'en-US', page };

        const { data, error } = await tryCatch(
            httpService.get<MovieListResponse>('/movie/favorites', params, { signal: globalAbortController.signal })
        );

        if (error?.name === ERROR_NAMES.ABORT) return;

        setLoading(false);
        setMaxPage(data?.total_pages ?? 1);
        const movies = data?.items ?? [];
        setMovies(movies);
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

        const { data } = await tryCatch(
            httpService.post<FavoriteMoviesResponse>('/movie/favorites', { ...movie })
        );

        await new Promise(resolve => setTimeout(resolve, 100));
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

        await new Promise(resolve => setTimeout(resolve, 100));
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
export const selectIsOnInitLoaded = (state: AppState) => state.onInitLoaded;
export const selectIsLoading = (state: AppState) => state.isLoading;
export const selectMovies = (state: AppState) => state.movies;
export const selectFavoriteIds = (state: AppState) => state.favoritesIds;
export const selectPage = (state: AppState) => state.page;
export const selectQuery = (state: AppState) => state.query;
export const selectMaxPage = (state: AppState) => state.maxPage;
export const selectedCategory = (state: AppState) => state.category;