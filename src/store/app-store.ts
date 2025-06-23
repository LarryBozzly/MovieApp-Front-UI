import { createStore } from 'zustand/vanilla';
import type { Movie } from '../models/models';

export interface AppState {
    page: number;
    movies: Movie[];
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
    setPage: (value: number) => void;
    setMovies: (movies: Movie[]) => void;
}

export const appStore = createStore<AppState>(set => ({
    page: 1,
    movies: [],
    isLoading: false,
    setLoading: (isLoading: boolean) => set({
        isLoading,
    }),
    setPage: (value: number) => set((state) => {
        return {
            ...state,
            page: value,
        }
    }),
    setMovies: (movies: Movie[]) => set((state) => {
        return {
            ...state,
            movies: [...state.movies, ...movies],
        }
    }),
}));