/// <reference types="vite/client" />
// Declare the virtual module for vite-plugin-pwa
declare module 'virtual:pwa-register' {
    interface RegisterSWOptions {
        onNeedRefresh?: () => void;
        onOfflineReady?: () => void;
        immediate?: boolean;
    }

    // Function returned by registerSW — can take an optional options object
    type RegisterSWReturn = (options?: { immediate?: boolean }) => Promise<void>;
    export function registerSW(options?: RegisterSWOptions): RegisterSWReturn;
}
