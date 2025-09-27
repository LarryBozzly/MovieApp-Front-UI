import { env } from '../config';

class ConnectivityService {
    private static instance: ConnectivityService;
    // Holds the promise for the single, current pending waitForOnline operation.
    private currentPromise: Promise<boolean> | null = null;
    // Controls the aborting of the current pending operation.
    private currentAbortController: AbortController | null = null;
    private readonly baseUrl = env.MOVIEDB_API_BASE_URL;

    private constructor() { }

    public static getInstance(): ConnectivityService {
        if (!ConnectivityService.instance) {
            ConnectivityService.instance = new ConnectivityService();
        }
        return ConnectivityService.instance;
    }

    /**
     * Check if the internet is reachable with a timeout (5000ms).
     * @param signal - An AbortSignal to cancel the fetch request.
     */
    private async check(signal: AbortSignal): Promise<boolean> {
        const timeoutMs = 5000;
        const timeoutId = setTimeout(() => signal.dispatchEvent(new Event('abort')), timeoutMs);

        try {
            const response = await fetch(`${this.baseUrl}/ping?ts=${Date.now()}`, {
                cache: 'no-store',
                signal,
            });
            clearTimeout(timeoutId);

            // Return true only if the HTTP status is successful (200-299)
            return response.ok;

        } catch (error) {
            clearTimeout(timeoutId);

            // If the error is an intentional abort (by timeout or manual cancel), return false.
            if (error instanceof DOMException && error.name === 'AbortError') {
                return false;
            }

            // Other network errors (e.g., DNS failure, connection refused) also mean false.
            return false;
        }
    }

    // 💡 NEW PUBLIC METHOD FOR IMMEDIATE CHECK
    /**
     * Performs a single, immediate check to see if the network is reachable.
     * This check does NOT use the shared currentAbortController/currentPromise state.
     * @returns A Promise that resolves to true if online, false otherwise.
     */
    public async checkNow(): Promise<boolean> {
        // Create a dedicated AbortController for this single, immediate check.
        const controller = new AbortController();
        // Since we don't return the promise, we don't store it.
        return this.check(controller.signal);
        // Note: The controller/signal will be garbage collected after the check resolves/rejects.
    }
    // ----------------------------------------

    /**
     * Waits until the internet is available.
     * - If a wait is already in progress, it returns the existing Promise.
     * - If offline, it retries at a specified interval using recursive setTimeout.
     * @param intervalMs - The interval between retry attempts in milliseconds.
     */
    public async waitForInternet(intervalMs = 1000): Promise<boolean> {
        // Return the existing promise if a wait is already in progress (deduplication/caching).
        if (this.currentPromise) {
            return this.currentPromise;
        }

        // Abort any previously set controller before starting a new one (safety).
        this.abort();

        this.currentAbortController = new AbortController();
        const { signal } = this.currentAbortController;

        const promise = new Promise<boolean>((resolve) => {
            const attemptCheck = async () => {
                // Stop the loop immediately if the entire operation has been aborted
                if (signal.aborted) {
                    return resolve(false);
                }

                const isOnline = await this.check(signal);

                // Check again after 'check' in case the signal was aborted while 'fetch' was running
                if (signal.aborted) {
                    return resolve(false);
                }

                if (isOnline) {
                    // Success: resolve the promise and clear the cache
                    this.currentPromise = null;
                    this.currentAbortController = null;
                    resolve(true);
                } else {
                    // Not online: schedule the next check recursively
                    setTimeout(attemptCheck, intervalMs);
                }
            };

            // Start the first check
            attemptCheck();
        });

        // Store the new promise as the current pending operation.
        this.currentPromise = promise;

        return promise;
    }

    /**
     * Aborts any pending network connectivity check (the one initiated by waitForInternet).
     */
    public abort(): void {
        if (this.currentAbortController) {
            // Calling abort() sets signal.aborted to true, which stops the recursive loop.
            this.currentAbortController.abort();
            this.currentAbortController = null;
            // Clear the cached promise so a new call can start a new check.
            this.currentPromise = null;
        }
    }
}

export default ConnectivityService;