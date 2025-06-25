import { createStore } from 'zustand/vanilla';
import type { LoginRequest, LoginResponse } from '../models/models';
import type HttpService from '../services/http.service';
import type AuthService from '../services/auth.service';
import { tryCatch } from '../utils/try-catch';
import { Router } from '@vaadin/router';

export interface AuthState {
    deps?: {
        httpService: HttpService;
        authService: AuthService;
    };
    isAuthorized: boolean;
    isLoading: boolean;
    storeInit: (deps: Required<AuthState>['deps']) => void;
    setAuthorization: (status: boolean) => void;
    setLoading: (loading: boolean) => void;
    login: (loginData: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
}

export const authStore = createStore<AuthState>((set, get) => ({
    isAuthorized: false,
    isLoading: false,
    deps: undefined,
    // reducers
    storeInit: (deps) => set({ deps }),
    setLoading: (isLoading: boolean) => set({ isLoading }),
    setAuthorization: (status: boolean) => set({ isAuthorized: status }),
    // effects
    login: async (loginData: LoginRequest) => {
        const deps = get().deps;
        if (!deps) throw new Error('Dependencies not set!');
        const { httpService, authService } = deps;
        const { setLoading, setAuthorization } = get();

        setLoading(true);

        const { error } = await tryCatch(
            httpService.post<LoginResponse>('/login', loginData)
        );
        const isAuthorized = await authService.isAuthorized();
        setLoading(true);
        setAuthorization(isAuthorized);

        if (error) return;

        if (isAuthorized) {
            Router.go('/');
        }
    },
    logout: async () => {
        const deps = get().deps;
        if (!deps) throw new Error('Dependencies not set!');
        const { httpService } = deps;
        const { setLoading, setAuthorization } = get();

        setLoading(true);
        await tryCatch(httpService.get('/logout'));
        setLoading(false);
        setAuthorization(false);
        Router.go('/login');
    }
}));