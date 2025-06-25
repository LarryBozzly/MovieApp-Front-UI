import type { StoreApi } from "zustand/vanilla";

/**
 * Overload #1: For stores whose state has `deps` (optional or required).
 *   Effect callback receives (deps, store, ...args).
 */
export function createEffect<
    TState extends { deps?: any },
    TArgs extends any[]
>(
    store: StoreApi<TState>,
    effect: (
        deps: Required<TState>["deps"],
        store: StoreApi<TState>,
        ...args: TArgs
    ) => Promise<void>
): (...args: TArgs) => Promise<void>;

/**
 * Overload #2: For stores whose state has no `deps` property.
 *   Effect callback receives (store, ...args).
 */
export function createEffect<
    TState,
    TArgs extends any[]
>(
    store: StoreApi<TState>,
    effect: (
        store: StoreApi<TState>,
        ...args: TArgs
    ) => Promise<void>
): (...args: TArgs) => Promise<void>;

/** Implementation */
export function createEffect(store: StoreApi<any>, effect: any) {
    return async (...args: any[]) => {
        const state = store.getState();
        if ("deps" in state) {
            // If state has a deps key, we expect it to be set
            if (state.deps == null) {
                throw new Error("Dependencies not set!");
            }
            // Call effect(deps, store, ...args)
            await effect(state.deps, store, ...args);
        } else {
            // Call effect(store, ...args)
            await effect(store, ...args);
        }
    };
}
