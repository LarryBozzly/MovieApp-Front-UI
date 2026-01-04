import { createStore, type StoreApi } from 'zustand/vanilla';
import {
  ERROR_NAMES,
  MovieCategory,
  type WatchlistMoviesResponse,
  type WatchlistState,
  type Movie,
  type MovieListResponse,
  type MoviesResponse,
  type Notification,
} from '../models/models';
import type HttpService from '../services/http.service';
import type AuthService from '../services/auth.service';
import type { AuthState } from './auth-store';
import { tryCatch } from '../utils/try-catch';
import { createEffect } from '../utils/create-effect.functions';
import type ModalService from '../services/modal.service';
import type BottomSheetService from '../services/bottom-sheet.service';
import '../components/send-invite-modal.component';
import '../components/invitation-notification-modal.component';
import '../components/movie-match-modal.component';
import '../components/movie-match-result-modal.component';
import '../components/movie-preview-modal.component';
import '../components/error-modal.component';
import '../components/edit-tag-modal.component';

export interface AppState {
  deps?: {
    httpService: HttpService;
    authService: AuthService;
    authStore: StoreApi<AuthState>;
    modalService: ModalService;
    bottomSheetService: BottomSheetService;
  };
  globalAbortController: AbortController;
  category: MovieCategory | undefined;
  onInitLoaded: boolean;
  isNavbarVisible: boolean;
  page: number;
  maxPage: number;
  movies: Movie[];
  watchlistIds: Record<number, WatchlistState>;
  notifications: Notification[];
  query: string;
  isLoading: boolean;
  storeInit: (deps: Required<AppState>['deps']) => void;
  setLoading: (loading: boolean) => void;
  setOnInitLoaded: (onInitLoaded: boolean) => void;
  setPage: (value: number) => void;
  setQuery: (query: string) => void;
  setMaxPage: (maxPage: number) => void;
  setNavbarVisibility: (isNavbarVisible: boolean) => void;
  setCategory: (category: MovieCategory | undefined) => void;
  setMovies: (movies: Movie[]) => void;
  clearMovies: () => void;
  triggerAbort: () => Promise<void>;
  setWatchlistIds: (ids: Record<number, WatchlistState>) => void;
  setNotifications: (notifications: Notification[]) => void;
  onInit: () => Promise<void>;
  fetchTrendingMovies: (page: number) => Promise<void>;
  fetchTopRatedMovies: (page: number) => Promise<void>;
  fetchWatchlistMovies: (page: number) => Promise<void>;
  fetchFindMovie: (page: number, query: string) => Promise<void>;
  fetchCategoryMovies: (
    category: MovieCategory | undefined,
    page: number,
    query?: string
  ) => Promise<void>;
  addToWatchlist: (movie: Movie) => Promise<void>;
  removeFromWatchlist: (movie: Movie) => Promise<void>;
  openSendInvitationModal: () => Promise<void>;
  openReceivedInvitationModal: (notification: Notification) => Promise<void>;
  openStartMovieMatchModal: (movies: Movie[]) => Promise<void>;
  openMovieMatchModal: (movie: Movie) => Promise<void>;
  openMoviePreviewModal: (movie: Movie) => Promise<void>;
  openEditTagModal: (tag: string) => Promise<void>;
  openErrorModal: (message: string) => Promise<void>;
  closeModal: () => Promise<void>;
}

export const appStore = createStore<AppState>((set, _get, store) => ({
  page: 1,
  maxPage: 1,
  movies: [],
  watchlistIds: {},
  notifications: [],
  query: '',
  isLoading: false,
  deps: undefined,
  globalAbortController: new AbortController(),
  category: undefined,
  onInitLoaded: false,
  isNavbarVisible: true,
  // reducers
  storeInit: (deps) => set({ deps }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setOnInitLoaded: (onInitLoaded: boolean) => set({ onInitLoaded }),
  setPage: (value: number) => set((state) => ({ ...state, page: value })),
  setNavbarVisibility: (isNavbarVisible: boolean) =>
    set((state) => ({ ...state, isNavbarVisible })),
  setQuery: (query: string) => set((state) => ({ ...state, query })),
  setMaxPage: (maxPage: number) => set((state) => ({ ...state, maxPage })),
  setCategory: (category: MovieCategory | undefined) => set((state) => ({ ...state, category })),
  setMovies: (movies: Movie[]) =>
    set((state) => ({ ...state, movies: [...state.movies, ...movies] })),
  clearMovies: () => set({ movies: [] }),
  setWatchlistIds: (ids: Record<number, WatchlistState>) =>
    set((state) => ({
      watchlistIds: {
        ...state.watchlistIds,
        ...ids,
      },
    })),
  setNotifications: (notifications: Notification[]) =>
    set((state) => ({ ...state, notifications })),
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
  fetchCategoryMovies: createEffect(
    store,
    async (_deps, store, category: MovieCategory | undefined, page: number, query?: string) => {
      const {
        fetchTopRatedMovies,
        fetchTrendingMovies,
        fetchWatchlistMovies,
        fetchFindMovie,
        setQuery,
        setCategory,
        clearMovies,
        triggerAbort,
      } = store.getState();
      triggerAbort();
      setCategory(category);
      clearMovies();
      setQuery('');
      if (category === MovieCategory.TRENDING) {
        await fetchTrendingMovies(page);
      } else if (category === MovieCategory.TOP_RATED) {
        await fetchTopRatedMovies(page);
      } else if (category === MovieCategory.WATCHLIST) {
        await fetchWatchlistMovies(page);
      } else {
        await fetchFindMovie(page, query ?? '');
      }
    }
  ),
  fetchTrendingMovies: createEffect(store, async (deps, store, page: number) => {
    const { httpService } = deps;
    const { setPage, setMaxPage, setLoading, setMovies, globalAbortController } = store.getState();
    setPage(page);
    setLoading(true);

    const params = { language: 'en-US', page };

    const { data, error } = await tryCatch(
      httpService.get<MoviesResponse>('/movie/now_playing', params, {
        signal: globalAbortController.signal,
      })
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
      httpService.get<MoviesResponse>('/movie/top_rated', params, {
        signal: globalAbortController.signal,
      })
    );
    if (error?.name === ERROR_NAMES.ABORT) return;

    setLoading(false);
    setMaxPage(data?.total_pages ?? 1);
    const movies = data?.results ?? [];
    setMovies(movies);
  }),
  fetchFindMovie: createEffect(store, async (deps, store, page: number, query: string) => {
    const { httpService } = deps;
    const { setPage, setMaxPage, setLoading, setQuery, setMovies, globalAbortController } =
      store.getState();
    setPage(page);
    setQuery(query);
    setLoading(true);

    const params = { query: encodeURIComponent(query) };

    const { data, error } = await tryCatch(
      httpService.get<MoviesResponse>('/movie/find', params, {
        signal: globalAbortController.signal,
      })
    );
    if (error?.name === ERROR_NAMES.ABORT) return;

    setLoading(false);
    setMaxPage(data?.total_pages ?? 1);
    const movies = data?.results ?? [];
    setMovies(movies);
  }),
  fetchWatchlistMovies: createEffect(store, async (deps, store, page: number) => {
    const { httpService } = deps;
    const { setPage, setMaxPage, setLoading, setMovies, globalAbortController } = store.getState();
    setPage(page);
    setLoading(true);

    const params = { language: 'en-US', page };

    const { data, error } = await tryCatch(
      httpService.get<MovieListResponse>('/movie/watchlist', params, {
        signal: globalAbortController.signal,
      })
    );

    if (error?.name === ERROR_NAMES.ABORT) return;

    setLoading(false);
    setMaxPage(data?.total_pages ?? 1);
    const movies = data?.items ?? [];
    setMovies(movies);
  }),
  addToWatchlist: createEffect(store, async (deps, store, movie: Movie) => {
    const { httpService } = deps;
    const { setLoading, setWatchlistIds } = store.getState();

    const currentWatchlist = { ...selectWatchlistIds(store.getState()) }; // clone
    const prev = currentWatchlist[movie.id];

    setLoading(true);
    setWatchlistIds({
      [movie.id]: { isWatchlist: prev?.isWatchlist ?? false, isLoading: true },
    });

    const { data } = await tryCatch(
      httpService.post<WatchlistMoviesResponse>('/movie/watchlist', { ...movie })
    );

    setLoading(false);
    setWatchlistIds({
      [movie.id]: { isWatchlist: data?.success ?? false, isLoading: false },
    });
  }),
  removeFromWatchlist: createEffect(store, async (deps, store, movie: Movie) => {
    const { httpService } = deps;
    const { setLoading, setWatchlistIds } = store.getState();

    const currentWatchlist = { ...selectWatchlistIds(store.getState()) }; // clone
    const prev = currentWatchlist[movie.id];

    setLoading(true);
    setWatchlistIds({
      [movie.id]: { isWatchlist: prev?.isWatchlist ?? true, isLoading: true },
    });

    const { data } = await tryCatch(
      httpService.delete<WatchlistMoviesResponse>(`/movie/watchlist/${movie.id}`)
    );

    setLoading(false);
    setWatchlistIds({
      [movie.id]: { isWatchlist: data?.success ? false : true, isLoading: false },
    });
  }),
  openSendInvitationModal: createEffect(store, async (deps, _store) => {
    const { modalService } = deps;
    modalService.open({ tag: 'send-invite-modal-component' });
  }),
  openReceivedInvitationModal: createEffect(
    store,
    async (deps, _store, notification: Notification) => {
      const { modalService } = deps;
      modalService.open({
        tag: 'invitation-notification-modal-component',
        props: { notification },
      });
    }
  ),
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
      },
    });
  }),
  openMoviePreviewModal: createEffect(store, async (deps, store, movie: Movie) => {
    const { modalService } = deps;
    const { closeModal } = store.getState();

    modalService.open({
      tag: 'movie-preview-modal',
      props: {
        movie,
        onClose: closeModal,
      },
    });
  }),
  openEditTagModal: createEffect(store, async (deps, store, tag: string) => {
    const { modalService } = deps;
    const { closeModal } = store.getState();

    modalService.open({
      tag: 'edit-tag-modal-component',
      props: {
        tag,
        onClose: closeModal,
      },
    });
  }),
  openErrorModal: createEffect(store, async (deps, store, message: string) => {
    const { modalService } = deps;
    const { closeModal } = store.getState();

    modalService.open({
      tag: 'error-modal',
      props: {
        message,
        onClose: closeModal,
      },
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
export const selectWatchlistIds = (state: AppState) => state.watchlistIds;
export const selectPage = (state: AppState) => state.page;
export const selectQuery = (state: AppState) => state.query;
export const selectMaxPage = (state: AppState) => state.maxPage;
export const selectedCategory = (state: AppState) => state.category;
export const selectisNavbarVisible = (state: AppState) => state.isNavbarVisible;
export const selectNotifications = (state: AppState) => state.notifications;
