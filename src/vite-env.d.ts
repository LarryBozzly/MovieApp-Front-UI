/// <reference types="vite/client" />
// Declare the virtual module for vite-plugin-pwa
declare module 'virtual:pwa-register' {
    type RegisterSWOptions = {
        onNeedRefresh?: () => void;
        onOfflineReady?: () => void;
        immediate?: boolean;
    };

    // updateSW() returns a Promise that resolves when the new SW is activated
    type RegisterSWReturn = () => Promise<void>;

    export function registerSW(options?: RegisterSWOptions): RegisterSWReturn;
}
