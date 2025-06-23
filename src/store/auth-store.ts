import { createStore } from 'zustand/vanilla';

export interface AuthState {
    isAuthorized: boolean;
    setAuthorization: (status: boolean) => void;
}

export const authStore = createStore<AuthState>(set => ({
    isAuthorized: false,
    setAuthorization: (status: boolean) => set({
        isAuthorized: status
    })
}));