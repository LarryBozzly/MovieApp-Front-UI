import { createStore } from 'zustand/vanilla';

export interface AuthState {
    token: string | null;
}

export const authStore = createStore<AuthState>(set => ({
    token: null,
    movies: [],
    setToken: (token: string) => set((state) => {
        return {
            ...state,
            token,
        }
    }),
}));