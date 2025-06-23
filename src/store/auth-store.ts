import { createStore } from 'zustand/vanilla';

export interface AuthState {
    isAuthorized: boolean;
    isLoading: boolean;
    setAuthorization: (status: boolean) => void;
    setLoading: (loading: boolean) => void;
}

export const authStore = createStore<AuthState>(set => ({
    isAuthorized: false,
    isLoading: false,
    setLoading: (isLoading: boolean) => set({
        isLoading,
    }),
    setAuthorization: (status: boolean) => set({
        isAuthorized: status
    })
}));