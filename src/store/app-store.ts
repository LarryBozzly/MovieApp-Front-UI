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
  type MovieVideosResponse,
  type AppError,
  VideoSite,
  VideoType,
  NotificationType,
} from '@models/models';
import type { ToastType } from '@services/toast-service';
import type HttpService from '@services/http.service';
import type AuthService from '@services/auth.service';
import type { AuthState } from '@store/auth-store';
import { tryCatch } from '@utils/try-catch';
import { createEffect } from '@utils/create-effect.functions';
import type ModalService from '@services/modal.service';
import type AppVersionService from '@services/app-version.service';
import type ToastService from '@services/toast-service';
import type OnboardingService from '@services/onboarding.service';
import type VFXService from '@services/vfx.service';

export interface AppState {
  deps?: {
    httpService: HttpService;
    authService: AuthService;
    authStore: StoreApi<AuthState>;
    modalService: ModalService;
    onboardingService: OnboardingService;
    appVersionService: AppVersionService;
    toastService: ToastService;
    vfxService: VFXService;
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
  error: AppError | null;
  storeInit: (deps: Required<AppState>['deps']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: AppError | null) => void;
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
  fetchMovieTrailer: (movieId: number) => Promise<string | undefined>;
  fetchFindMovie: (page: number, query: string) => Promise<void>;
  fetchCategoryMovies: (
    category: MovieCategory | undefined,
    page: number,
    query?: string
  ) => Promise<void>;
  updateNotifications: (newNotifications: Notification[]) => Promise<void>;
  addToWatchlist: (movie: Movie) => Promise<void>;
  removeFromWatchlist: (movie: Movie) => Promise<void>;
  openMovieExplorerModal: () => Promise<void>;
  openSendInvitationModal: () => Promise<void>;
  openOnboardingSendInvitationModal: () => Promise<void>;
  openReceivedInvitationModal: (notification: Notification) => Promise<void>;
  openStartMovieMatchModal: (movies: Movie[]) => Promise<void>;
  openOnboardingStartMovieMatchModal: (movies: Movie[]) => Promise<void>;
  openMovieMatchModal: (movie: Movie, solo: boolean) => Promise<void>;
  openMoviePreviewModal: (movie: Movie) => Promise<void>;
  openEditTagModal: (tag: string) => Promise<void>;
  openErrorModal: (message: string) => Promise<void>;
  closeModal: () => Promise<void>;
  showToast: (message: string, type: ToastType) => Promise<void>;
}

export const appStore = createStore<AppState>((set, _get, store) => ({
  page: 1,
  maxPage: 1,
  movies: [],
  watchlistIds: {},
  notifications: [],
  query: '',
  isLoading: false,
  error: null,
  deps: undefined,
  globalAbortController: new AbortController(),
  category: undefined,
  onInitLoaded: false,
  isNavbarVisible: true,
  // reducers
  storeInit: (deps) => set({ deps }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: AppError | null) => set({ error }),
  setOnInitLoaded: (onInitLoaded: boolean) => set({ onInitLoaded }),
  setPage: (value: number) => set((state) => ({ ...state, page: value })),
  setNavbarVisibility: (isNavbarVisible: boolean) =>
    set((state) => ({ ...state, isNavbarVisible })),
  setQuery: (query: string) => set((state) => ({ ...state, query })),
  setMaxPage: (maxPage: number) => set((state) => ({ ...state, maxPage })),
  setCategory: (category: MovieCategory | undefined) => set((state) => ({ ...state, category })),
  setMovies: (movies: Movie[]) =>
    set((state) => ({
      ...state,
      movies: [...new Map([...state.movies, ...movies].map((m) => [m.id, m])).values()],
    })),
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
  onInit: createEffect(store, async (deps, store) => {
    const { appVersionService, modalService, onboardingService } = deps;
    const { fetchCategoryMovies, setOnInitLoaded, closeModal, page } = store.getState();
    await fetchCategoryMovies(MovieCategory.TRENDING, page);
    appVersionService.checkAndShowUpdateModal(modalService, closeModal);
    setOnInitLoaded(true);
    onboardingService.startOnboarding();
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
    const {
      setPage,
      setMaxPage,
      setLoading,
      setMovies,
      setError,
      globalAbortController,
      fetchTrendingMovies,
    } = store.getState();
    setLoading(true);
    setError(null);

    const params = { language: 'en-US', page };

    const { data, error } = await tryCatch(
      httpService.get<MoviesResponse>('/movie/now_playing', params, {
        signal: globalAbortController.signal,
      })
    );
    if (error?.name === ERROR_NAMES.ABORT) return;

    setLoading(false);
    if (error) {
      setError({
        ...error,
        retry: () => fetchTrendingMovies(page),
      });
    }
    setPage(page);
    setMaxPage(data?.total_pages ?? 1);
    const movies = data?.results ?? [];
    setMovies(movies);
  }),
  fetchTopRatedMovies: createEffect(store, async (deps, store, page: number) => {
    const { httpService } = deps;
    const {
      setPage,
      setMaxPage,
      setLoading,
      setMovies,
      setError,
      globalAbortController,
      fetchTopRatedMovies,
    } = store.getState();
    setLoading(true);
    setError(null);

    const params = { language: 'en-US', page };

    const { data, error } = await tryCatch(
      httpService.get<MoviesResponse>('/movie/top_rated', params, {
        signal: globalAbortController.signal,
      })
    );
    if (error?.name === ERROR_NAMES.ABORT) return;

    setLoading(false);
    if (error) {
      setError({
        ...error,
        retry: () => fetchTopRatedMovies(page),
      });
    }

    setPage(page);
    setMaxPage(data?.total_pages ?? 1);
    const movies = data?.results ?? [];
    setMovies(movies);
  }),
  fetchFindMovie: createEffect(store, async (deps, store, page: number, query: string) => {
    const { httpService } = deps;
    const {
      setPage,
      setMaxPage,
      setLoading,
      setQuery,
      setMovies,
      setError,
      globalAbortController,
      fetchFindMovie,
    } = store.getState();
    setQuery(query);
    setLoading(true);
    setError(null);

    const params = { query: encodeURIComponent(query) };

    const { data, error } = await tryCatch(
      httpService.get<MoviesResponse>('/movie/find', params, {
        signal: globalAbortController.signal,
      })
    );
    if (error?.name === ERROR_NAMES.ABORT) return;

    setLoading(false);
    if (error) {
      setError({
        ...error,
        retry: () => fetchFindMovie(page, query),
      });
    }

    setPage(page);
    setMaxPage(data?.total_pages ?? 1);
    const movies = data?.results ?? [];
    setMovies(movies);
  }),
  fetchWatchlistMovies: createEffect(store, async (deps, store, page: number) => {
    const { httpService } = deps;
    const {
      setPage,
      setMaxPage,
      setLoading,
      setMovies,
      setError,
      globalAbortController,
      fetchWatchlistMovies,
    } = store.getState();
    setLoading(true);
    setError(null);

    const params = { language: 'en-US', page };

    const { data, error } = await tryCatch(
      httpService.get<MovieListResponse>('/movie/watchlist', params, {
        signal: globalAbortController.signal,
      })
    );

    if (error?.name === ERROR_NAMES.ABORT) return;

    setLoading(false);
    if (error) {
      setError({
        ...error,
        retry: () => fetchWatchlistMovies(page),
      });
    }

    setPage(page);
    setMaxPage(data?.total_pages ?? 1);
    const movies = data?.items ?? [];
    setMovies(movies);
  }),
  fetchMovieTrailer: createEffect(store, async (deps, store, movieId: number) => {
    const { httpService } = deps;
    const { setLoading, globalAbortController } = store.getState();
    setLoading(true);

    const { data, error } = await tryCatch(
      httpService.get<MovieVideosResponse>(
        `/movie/${movieId}/videos`,
        {},
        {
          signal: globalAbortController.signal,
        }
      )
    );
    if (error?.name === ERROR_NAMES.ABORT) return;

    setLoading(false);

    return data?.results?.find(
      (video) => video.site === VideoSite.YouTube && video.type === VideoType.Trailer
    )?.key;
  }),
  updateNotifications: createEffect(
    store,
    async (deps, store, newNotifications: Notification[]) => {
      const { toastService } = deps;
      const { setNotifications, notifications } = store.getState();

      const existingIds = new Set(notifications.map((notification) => notification.id));
      const hasInvitation = newNotifications.some(
        (notification) =>
          !existingIds.has(notification.id) && notification.type === NotificationType.INVITATION
      );

      if (hasInvitation) toastService.show('You have new invitations.', { type: 'info' });

      setNotifications(newNotifications);
    }
  ),
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
  openMovieExplorerModal: createEffect(store, async (deps, _store) => {
    const { modalService } = deps;
    modalService.open({
      tag: 'movie-explorer-modal-component',
      modalMode: 'modal',
      className: 'modal-bottom sm:modal-middle',
    });
  }),
  openSendInvitationModal: createEffect(store, async (deps, _store) => {
    const { modalService } = deps;
    modalService.open({
      tag: 'send-invite-modal-component',
      modalMode: 'modal',
      className: 'modal-bottom sm:modal-middle',
    });
  }),
  openOnboardingSendInvitationModal: createEffect(store, async (deps, _store) => {
    const { modalService } = deps;
    modalService.open({
      tag: 'send-invite-modal-component',
      modalMode: 'nonModal',
      className: 'modal-bottom sm:modal-middle',
    });
  }),
  openReceivedInvitationModal: createEffect(
    store,
    async (deps, _store, notification: Notification) => {
      const { modalService } = deps;
      modalService.open({
        tag: 'invitation-notification-modal-component',
        props: { notification },
        modalMode: 'modal',
      });
    }
  ),
  openStartMovieMatchModal: createEffect(store, async (deps, _store, movies: Movie[]) => {
    const { modalService } = deps;
    modalService.open({
      tag: 'movie-match-modal-component',
      props: { movies },
      modalMode: 'modal',
    });
  }),
  openOnboardingStartMovieMatchModal: createEffect(store, async (deps, _store, movies: Movie[]) => {
    const { modalService } = deps;
    modalService.open({
      tag: 'movie-match-modal-component',
      props: { movies },
      modalMode: 'nonModal',
    });
  }),
  openMovieMatchModal: createEffect(store, async (deps, store, movie: Movie, solo: boolean) => {
    const { modalService, vfxService } = deps;
    const { closeModal } = store.getState();
    const title = solo ? "It's a Hit!" : "It's a Match!";
    modalService.open({
      tag: 'movie-match-result-modal',
      modalMode: 'modal',
      props: {
        title,
        movie,
        onClose: closeModal,
      },
    });

    vfxService.popcornBurst();
  }),
  openMoviePreviewModal: createEffect(store, async (deps, store, movie: Movie) => {
    const { modalService } = deps;
    const { closeModal } = store.getState();
    modalService.open({
      tag: 'movie-preview-modal',
      modalMode: 'modal',
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
      className: 'modal-bottom sm:modal-middle',
      modalMode: 'modal',
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
      modalMode: 'modal',
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
  showToast: createEffect(store, async (deps, _store, message: string, type: ToastType) => {
    const { toastService } = deps;
    toastService.show(message, { type });
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
export const selectError = (state: AppState) => state.error;
