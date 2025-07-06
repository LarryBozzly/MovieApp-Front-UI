import { createStore } from 'zustand/vanilla';
import type { LoginRequest, LoginResponse, Movie } from '../models/models';
import type HttpService from '../services/http.service';
import type AuthService from '../services/auth.service';
import { tryCatch } from '../utils/try-catch';
import { Router } from '@vaadin/router';
import { createEffect } from '../utils/create-effect.functions';
import type WebSocketService from '../services/websocket.service';
import { env } from '../config';

export interface AuthState {
    deps?: {
        httpService: HttpService;
        authService: AuthService;
        webSocketService: WebSocketService;
    };
    isAuthorized: boolean;
    isLoading: boolean;
    tag: string;
    storeInit: (deps: Required<AuthState>['deps']) => void;
    setAuthorization: (status: boolean) => void;
    setLoading: (loading: boolean) => void;
    setTag: (tag: string) => void;
    login: (loginData: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
    sendInvitationRequest: (toTag: string) => Promise<void>;
    sendInvitationResponse: (toTag: string, fromTag: string) => Promise<void>;
    sendMovieSelection: (movie: Movie) => Promise<void>;
}

export const authStore = createStore<AuthState>((set, _get, store) => ({
    isAuthorized: false,
    isLoading: false,
    deps: undefined,
    tag: '',
    // reducers
    storeInit: (deps) => set({ deps }),
    setLoading: (isLoading: boolean) => set({ isLoading }),
    setTag: (tag: string) => set({ tag }),
    setAuthorization: (status: boolean) => set({ isAuthorized: status }),
    // effects
    login: createEffect(store, async (deps, store, loginData) => {
        const { httpService, authService, webSocketService } = deps;
        const { setLoading, setAuthorization, setTag } = store.getState();

        setLoading(true);

        const { data, error } = await tryCatch(
            httpService.post<LoginResponse>('/login', loginData)
        );
        const isAuthorized = await authService.isAuthorized();
        setLoading(false);
        setAuthorization(isAuthorized);

        if (error) return;

        const wsToken = await authService.getWsToken();
        webSocketService.connect(env.VITE_WS_URL, wsToken);

        if (isAuthorized) {
            setTag(data.data.tag);
            Router.go('/');
        }
    }),
    logout: createEffect(store, async (deps, store) => {
        const { httpService } = deps;
        const { setLoading, setAuthorization } = store.getState();

        setLoading(true);
        await tryCatch(httpService.get('/logout'));
        setLoading(false);
        setAuthorization(false);
        Router.go('/login');
    }),
    refresh: createEffect(store, async (deps, store) => {
        const { httpService, webSocketService, authService } = deps;
        const { setLoading, setAuthorization, setTag } = store.getState();

        setLoading(true);

        const { data, error } = await tryCatch(
            httpService.get<LoginResponse>('/refresh')
        );

        const wsToken = await authService.getWsToken();
        webSocketService.connect(env.VITE_WS_URL, wsToken)

        setLoading(false);

        if (error) return;

        if (data) {
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
}));

// selectors 
export const selectIsAuthorized = (state: AuthState) => state.isAuthorized;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectTag = (state: AuthState) => state.tag;