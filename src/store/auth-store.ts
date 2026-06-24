import { createStore } from 'zustand/vanilla';
import type {
  GdprEraseResponse,
  LoginRequest,
  LoginResponse,
  Movie,
  Notification,
  PasswordResetResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateTagResponse,
  UserProfile,
  VerifyResponse,
} from '@models/models';
import type HttpService from '@services/http.service';
import type AuthService from '@services/auth.service';
import { tryCatch } from '@utils/try-catch';
import { Router } from '@vaadin/router';
import { createEffect } from '@utils/create-effect.functions';
import type WebSocketService from '@services/websocket.service';
import type DeviceInfoService from '@services/device-info.service';
import type ConnectivityService from '@services/connectivity.service';
import type ModalService from '@services/modal.service';
import type AppVersionService from '@services/app-version.service';
import type BroadcastChannelService from '../services/broadcast-channel.service';
import { env } from '@config';
import { AuthChannelEvent } from '@models/models';
import type OnboardingService from '@services/onboarding.service';
import type ToastService from '@services/toast-service';
import type { ToastType } from '@services/toast-service';

export interface AuthState {
  deps?: {
    httpService: HttpService;
    authService: AuthService;
    webSocketService: WebSocketService;
    deviceInfoService: DeviceInfoService;
    connectivityService: ConnectivityService;
    onboardingService: OnboardingService;
    modalService: ModalService;
    toastService: ToastService;
    appVersionService: AppVersionService;
    authChannelService: BroadcastChannelService<AuthChannelEvent>;
  };
  isAuthorized: boolean;
  isLoading: boolean;
  isRegistered: boolean;
  isVerified: boolean;
  isForgottenPasswordSent: boolean;
  isVerifiedPasswordCodeSent: boolean;
  isPasswordChanged: boolean;
  userProfile: UserProfile;
  isWSConnected: boolean;
  error: Error | null;
  storeInit: (deps: Required<AuthState>['deps']) => void;
  setAuthorization: (status: boolean) => void;
  setError: (error: Error | null) => void;
  setLoading: (loading: boolean) => void;
  setWSConnected: (isWSConnected: boolean) => void;
  setUserProfile: (userProfile: UserProfile) => void;
  setIsVerified: (isVerified: boolean) => void;
  setIsRegistered: (isRegistered: boolean) => void;
  setIsForgottenPasswordSent: (isForgottenPasswordSent: boolean) => void;
  setIsVerifiedPasswordCodeSent: (isVerifiedPasswordCodeSent: boolean) => void;
  setIsPasswordChanged: (isPasswordChanged: boolean) => void;
  openDeleteAccountConfirmModal: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  login: (loginData: LoginRequest) => Promise<void>;
  register: (loginData: RegisterRequest) => Promise<void>;
  verifyAccount: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyPasswordCode: (email: string, code: string) => Promise<void>;
  passwordChange: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateTag: (newTag: string) => Promise<void>;
  sendReadNotificationRequest: (notificationId: number) => Promise<void>;
  sendInvitationRequest: (toTag: string, genreIds: number[]) => Promise<void>;
  acceptInvitationResponse: (notification: Notification) => Promise<void>;
  rejectInvitationResponse: (notification: Notification) => Promise<void>;
  sendMovieSelection: (movie: Movie) => Promise<void>;
  sendMovieRejection: (movie: Movie) => Promise<void>;
  startSoloSession: (toTag: string, genres: number[]) => Promise<void>;
  initDeviceVisibilityListener: () => Promise<void>;
  initCrossTabListener: () => Promise<void>;
  closeModal: () => Promise<void>;
  showToast: (message: string, type: ToastType) => Promise<void>;
}

export const authStore = createStore<AuthState>((set, _get, store) => ({
  isAuthorized: false,
  isLoading: false,
  isVerified: false,
  isRegistered: false,
  isForgottenPasswordSent: false,
  isVerifiedPasswordCodeSent: false,
  isPasswordChanged: false,
  deps: undefined,
  userProfile: {
    id: 0,
    email: '',
    tag: '',
    createdAt: '',
  },
  isWSConnected: false,
  error: null,
  // reducers
  storeInit: (deps) => set({ deps }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: Error | null) => set({ error }),
  setWSConnected: (isWSConnected: boolean) => set({ isWSConnected }),
  setUserProfile: (userProfile: UserProfile) => set({ userProfile }),
  setIsVerified: (isVerified: boolean) => set({ isVerified }),
  setIsRegistered: (isRegistered: boolean) => set({ isRegistered }),
  setIsForgottenPasswordSent: (isForgottenPasswordSent: boolean) =>
    set({ isForgottenPasswordSent }),
  setIsVerifiedPasswordCodeSent: (isVerifiedPasswordCodeSent: boolean) =>
    set({ isVerifiedPasswordCodeSent }),
  setIsPasswordChanged: (isPasswordChanged: boolean) => set({ isPasswordChanged }),
  setAuthorization: (status: boolean) => set({ isAuthorized: status }),
  // effects
  openDeleteAccountConfirmModal: createEffect(store, async (deps, store) => {
    const { modalService } = deps;
    const { deleteAccount, closeModal } = store.getState();
    modalService.open({
      tag: 'confirm-action-modal',
      className: 'modal-bottom sm:modal-middle',
      modalMode: 'modal',
      props: {
        title: 'Delete my account',
        description:
          'Are you sure you want to delete your account? Once deleted, your account and all associated data will be permanently removed.',
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        danger: true,
        onConfirm: deleteAccount,
        onClose: closeModal,
      },
    });
  }),
  deleteAccount: createEffect(store, async (deps, store) => {
    const { httpService } = deps;
    const { setLoading, closeModal, showToast, logout } = store.getState();

    setLoading(true);
    const { error } = await tryCatch(httpService.delete<GdprEraseResponse>('/gdpr/erase'));
    setLoading(false);
    await closeModal();

    if (error) {
      await showToast('Something went wrong, please try again later', 'error');
      return;
    }

    await showToast('Account deleted', 'success');
    await logout();
  }),
  login: createEffect(store, async (deps, store, loginData) => {
    const { httpService, authService, webSocketService, authChannelService } = deps;
    const { setLoading, setAuthorization, setUserProfile, setError } = store.getState();

    setLoading(true);

    const { data, error } = await tryCatch(httpService.post<LoginResponse>('/login', loginData));
    const isAuthorized = authService.isAuthorized();
    setLoading(false);
    setAuthorization(isAuthorized);
    setError(error);

    if (error) return;

    const token = await authService.getToken();
    await webSocketService.connect(env.VITE_WS_URL, token);

    if (isAuthorized) {
      authChannelService.postMessage(AuthChannelEvent.LOGIN);
      authService.startRefreshTimer();
      setError(null);
      setUserProfile(data.data);
      Router.go('/');
    }
  }),
  register: createEffect(store, async (deps, store, registerData) => {
    const { httpService } = deps;
    const { setLoading, setError, setIsRegistered } = store.getState();

    setLoading(true);
    const { data, error } = await tryCatch(
      httpService.post<RegisterResponse>('/signup', registerData)
    );

    setLoading(false);
    setError(error);
    setIsRegistered(!!data);
  }),
  forgotPassword: createEffect(store, async (deps, store, email) => {
    const { httpService } = deps;
    const { setLoading, setIsForgottenPasswordSent, setError } = store.getState();

    setLoading(true);
    const { data, error } = await tryCatch(
      httpService.post<PasswordResetResponse>('/password/reset/request', { email })
    );

    setLoading(false);
    setError(error);
    setIsForgottenPasswordSent(!!data);
  }),
  verifyPasswordCode: createEffect(store, async (deps, store, email, code) => {
    const { httpService } = deps;
    const { setLoading, setIsVerifiedPasswordCodeSent, setError } = store.getState();

    setLoading(true);
    const { data, error } = await tryCatch(
      httpService.post<PasswordResetResponse>('/password/reset/verify', { email, code })
    );

    setLoading(false);
    setError(error);
    setIsVerifiedPasswordCodeSent(!!data);
  }),
  passwordChange: createEffect(store, async (deps, store, password) => {
    const { httpService } = deps;
    const { setLoading, setIsPasswordChanged, setError } = store.getState();

    setLoading(true);
    const { data, error } = await tryCatch(
      httpService.post<PasswordResetResponse>('/password/reset/confirm', { password })
    );

    setLoading(false);
    setError(error);
    setIsPasswordChanged(!!data);
    if (!error) setTimeout(() => Router.go('/'), 3000);
  }),
  verifyAccount: createEffect(store, async (deps, store, token) => {
    const { httpService } = deps;
    const { setLoading, setIsVerified, setError } = store.getState();

    setLoading(true);
    const { data, error } = await tryCatch(httpService.get<VerifyResponse>('/verify', { token }));

    setLoading(false);
    setError(error);
    setIsVerified(!!data);
    setTimeout(() => Router.go('/'), 3000);
  }),
  logout: createEffect(store, async (deps, store) => {
    const { httpService, webSocketService, authService, authChannelService } = deps;
    const { setLoading, setAuthorization } = store.getState();

    setLoading(true);
    await tryCatch(httpService.get('/logout'));
    setLoading(false);
    setAuthorization(false);
    webSocketService.close(true);
    authService.stopRefreshTimer();
    authService.clearAllCookies();
    authChannelService.postMessage(AuthChannelEvent.LOGOUT);

    Router.go('/login');
  }),
  refresh: createEffect(store, async (deps, store) => {
    const { httpService, webSocketService, authService } = deps;
    const { setLoading, setAuthorization, setUserProfile, setError, logout } = store.getState();

    setLoading(true);

    const { data, error } = await tryCatch(httpService.get<LoginResponse>('/refresh'));

    const token = await authService.getToken();
    if (!token) await logout();

    await webSocketService.connect(env.VITE_WS_URL, token);
    setLoading(false);
    setError(error);

    if (error) return;

    if (data) {
      authService.startRefreshTimer();
      setAuthorization(true);
      setUserProfile(data.data);
    }
  }),
  updateTag: createEffect(store, async (deps, store, tag) => {
    const { httpService } = deps;
    const { setLoading, setError } = store.getState();

    setLoading(true);
    setError(null);

    const { data, error } = await tryCatch(
      httpService.patch<UpdateTagResponse>('/users/tag', { tag })
    );

    setLoading(false);
    setError(error);

    if (data) {
      store.getState().setUserProfile(data.data);
    }
  }),
  sendReadNotificationRequest: createEffect(store, async (deps, _store, notificationId: number) => {
    const { webSocketService } = deps;

    if (!webSocketService) {
      console.error('WebSocketService not initialized');
      return;
    }

    webSocketService.sendReadNotificationRequest(notificationId);
  }),
  sendInvitationRequest: createEffect(
    store,
    async (deps, _store, toTag: string, genreIds: number[]) => {
      const { webSocketService } = deps;

      if (!webSocketService) {
        console.error('WebSocketService not initialized');
        return;
      }

      webSocketService.sendInvitationRequest(toTag, genreIds);
    }
  ),
  acceptInvitationResponse: createEffect(
    store,
    async (deps, _store, notification: Notification) => {
      const { webSocketService } = deps;

      if (!webSocketService) {
        console.error('WebSocketService not initialized');
        return;
      }

      webSocketService.acceptInvitationResponse(notification);
    }
  ),
  rejectInvitationResponse: createEffect(
    store,
    async (deps, _store, notification: Notification) => {
      const { webSocketService } = deps;

      if (!webSocketService) {
        console.error('WebSocketService not initialized');
        return;
      }

      webSocketService.rejectInvitationResponse(notification);
    }
  ),
  sendMovieSelection: createEffect(store, async (deps, _store, movie: Movie) => {
    const { webSocketService } = deps;

    if (!webSocketService) {
      console.error('WebSocketService not initialized');
      return;
    }

    webSocketService.sendMovieSelection(movie);
  }),
  sendMovieRejection: createEffect(store, async (deps, _store, movie: Movie) => {
    const { webSocketService } = deps;

    if (!webSocketService) {
      console.error('WebSocketService not initialized');
      return;
    }

    webSocketService.sendMovieRejection(movie);
  }),
  startSoloSession: createEffect(store, async (deps, _store, toTag: string, genreIds: number[]) => {
    const { webSocketService } = deps;

    if (!webSocketService) {
      console.error('WebSocketService not initialized');
      return;
    }

    webSocketService.sendInvitationRequest(toTag, genreIds);
  }),
  initDeviceVisibilityListener: createEffect(store, async (deps, store) => {
    const {
      deviceInfoService,
      webSocketService,
      authService,
      connectivityService,
      appVersionService,
      modalService,
      onboardingService,
    } = deps;
    const { refresh, closeModal } = store.getState();

    deviceInfoService.onVisibilityChange(async (isForeground) => {
      const hasRefreshTokenFlag = authService.hasRefreshTokenFlag();
      const isWSConnected = store.getState().isWSConnected;
      connectivityService.abort();

      if (hasRefreshTokenFlag && isWSConnected && !isForeground) {
        webSocketService.close(true);
        authService.stopRefreshTimer();
      }
      if (hasRefreshTokenFlag && isForeground && (await connectivityService.waitForInternet())) {
        refresh();
        appVersionService.checkAndShowUpdateModal(modalService, closeModal);
        if (onboardingService.isOnboardingActive()) onboardingService.startOnboarding();
      }
    });
  }),
  initCrossTabListener: createEffect(store, async (deps) => {
    const { authChannelService } = deps;
    authChannelService.onMessage((data) => {
      if (data === AuthChannelEvent.LOGIN || data === AuthChannelEvent.LOGOUT) {
        window.location.reload();
      }
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
export const selectIsAuthorized = (state: AuthState) => state.isAuthorized;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectIsVerified = (state: AuthState) => state.isVerified;
export const selectIsRegistered = (state: AuthState) => state.isRegistered;
export const selectIsForgottenPasswordSent = (state: AuthState) => state.isForgottenPasswordSent;
export const selectIsVerifiedPasswordCodeSent = (state: AuthState) =>
  state.isVerifiedPasswordCodeSent;
export const selectisPasswordChanged = (state: AuthState) => state.isPasswordChanged;
export const selectError = (state: AuthState) => state.error;
export const selectUserProfile = (state: AuthState) => state.userProfile;
export const selectIsWSConnected = (state: AuthState) => state.isWSConnected;
