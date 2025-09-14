import { createStore } from 'zustand/vanilla';
import type { LoginRequest, LoginResponse, Movie } from '../models/models';
import type HttpService from '../services/http.service';
import type AuthService from '../services/auth.service';
import { tryCatch } from '../utils/try-catch';
import { Router } from '@vaadin/router';
import { createEffect } from '../utils/create-effect.functions';
import type WebSocketService from '../services/websocket.service';
import type DeviceInfoService from '../services/device-info.service';
import { env } from '../config';

export interface AuthState {
    deps?: {
        httpService: HttpService;
        authService: AuthService;
        webSocketService: WebSocketService;
        deviceInfoService: DeviceInfoService;
    };
    isAuthorized: boolean;
    isLoading: boolean;
    tag: string;
    isWSConnected: boolean;
    error: Error | null;
    storeInit: (deps: Required<AuthState>['deps']) => void;
    setAuthorization: (status: boolean) => void;
    setError: (error: Error | null) => void;
    setLoading: (loading: boolean) => void;
    setWSConnected: (isWSConnected: boolean) => void;
    setTag: (tag: string) => void;
    login: (loginData: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
    sendInvitationRequest: (toTag: string) => Promise<void>;
    sendInvitationResponse: (toTag: string, fromTag: string) => Promise<void>;
    sendMovieSelection: (movie: Movie) => Promise<void>;
    initDeviceVisibilityListener: () => Promise<void>;
}

export const authStore = createStore<AuthState>((set, _get, store) => ({
    isAuthorized: false,
    isLoading: false,
    deps: undefined,
    tag: '',
    isWSConnected: false,
    error: null,
    // reducers
    storeInit: (deps) => set({ deps }),
    setLoading: (isLoading: boolean) => set({ isLoading }),
    setError: (error: Error | null) => set({ error }),
    setWSConnected: (isWSConnected: boolean) => set({ isWSConnected }),
    setTag: (tag: string) => set({ tag }),
    setAuthorization: (status: boolean) => set({ isAuthorized: status }),
    // effects
    login: createEffect(store, async (deps, store, loginData) => {
        const { httpService, authService, webSocketService } = deps;
        const { setLoading, setAuthorization, setTag, setError } = store.getState();

        setLoading(true);

        const { data, error } = await tryCatch(
            httpService.post<LoginResponse>('/login', loginData)
        );
        const isAuthorized = authService.isAuthorized();
        setLoading(false);
        setAuthorization(isAuthorized);
        setError(error);

        if (error) return;

        const token = await authService.getToken();
        await webSocketService.connect(env.VITE_WS_URL, token);

        if (isAuthorized) {
            authService.startRefreshTimer();
            setError(null);
            setTag(data.data.tag);
            Router.go('/');
        }
    }),
    logout: createEffect(store, async (deps, store) => {
        const { httpService, webSocketService, authService } = deps;
        const { setLoading, setAuthorization } = store.getState();

        setLoading(true);
        await tryCatch(httpService.get('/logout'));
        setLoading(false);
        setAuthorization(false);
        webSocketService.close(true);
        authService.stopRefreshTimer();
        authService.clearAllCookies();

        Router.go('/login');
    }),
    refresh: createEffect(store, async (deps, store) => {
        const { httpService, webSocketService, authService } = deps;
        const { setLoading, setAuthorization, setTag, setError, logout } = store.getState();

        if (!navigator.onLine) return;

        setLoading(true);

        const { data, error } = await tryCatch(
            httpService.get<LoginResponse>('/refresh')
        );

        const token = await authService.getToken();
        if (!token) await logout();

        await webSocketService.connect(env.VITE_WS_URL, token);
        setLoading(false);
        setError(error);

        if (error) return;

        if (data) {
            authService.startRefreshTimer();
            setAuthorization(true);
            setTag(data.data.tag);
        }
    }),
    sendInvitationRequest: createEffect(store, async (deps, _store, toTag: string) => {
        const { webSocketService } = deps;

        if (!webSocketService) {
            console.error('WebSocketService not initialized');
            return;
        }

        webSocketService.sendInvitationRequest(toTag);
    }),
    sendInvitationResponse: createEffect(store, async (deps, _store, toTag: string, fromTag: string) => {
        const { webSocketService } = deps;

        if (!webSocketService) {
            console.error('WebSocketService not initialized');
            return;
        }

        webSocketService.sendInvitationResponse(toTag, fromTag);
    }),
    sendMovieSelection: createEffect(store, async (deps, _store, movie: Movie) => {
        const { webSocketService } = deps;

        if (!webSocketService) {
            console.error('WebSocketService not initialized');
            return;
        }

        webSocketService.sendMovieSelection(movie);
    }),
    initDeviceVisibilityListener: createEffect(store, async (deps, store) => {
        const { deviceInfoService, webSocketService, authService } = deps;
        const { refresh } = store.getState();

        deviceInfoService.onVisibilityChange((isForeground) => {
            const hasRefreshTokenFlag = authService.hasRefreshTokenFlag();
            const isWSConnected = store.getState().isWSConnected;
            if (hasRefreshTokenFlag && isWSConnected && !isForeground) webSocketService.close(true);
            if (hasRefreshTokenFlag && isForeground) refresh();
        });
    }),
}));

// selectors 
export const selectIsAuthorized = (state: AuthState) => state.isAuthorized;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
export const selectTag = (state: AuthState) => state.tag;
export const selectIsWSConnected = (state: AuthState) => state.isWSConnected;