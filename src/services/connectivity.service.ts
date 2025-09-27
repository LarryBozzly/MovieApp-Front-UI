import { env } from '../config';

class ConnectivityService {
    private static instance: ConnectivityService;
    private currentPromise: Promise<boolean> | null = null;
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
       * Check if the internet is reachable with a timeout.
          */
    private async check(signal: AbortSignal): Promise<boolean> {
        const timeoutMs = 5000;
        const timeoutId = setTimeout(() => signal.dispatchEvent(new Event('abort')), timeoutMs);

        try {
            await fetch(`${this.baseUrl}/ping?ts=${Date.now()}`, {
                cache: 'no-store',
                signal,
            });
            clearTimeout(timeoutId);
            return true;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof DOMException && error.name === 'AbortError') {
                // The fetch was aborted on purpose (by timeout or manual abort)
                return false;
            }
            // Other network errors
            return false;
        }
    }

    /**
       * Waits until the internet is available.
          * If offline, it retries at a specified interval.
             */
    public async waitForInternet(intervalMs = 1000): Promise<boolean> {
        this.abort();

        this.currentAbortController = new AbortController();
        const { signal } = this.currentAbortController;

        const promise = new Promise<boolean>((resolve) => {
            const attemptCheck = async () => {
                const isOnline = await this.check(signal);
                if (signal.aborted) {
                    return resolve(false); // Aborted before resolution
                }
                if (isOnline) {
                    resolve(true);
                } else {
                    setTimeout(attemptCheck, intervalMs);
                }
            };
            attemptCheck();
        });

        this.currentPromise = promise;
        return promise;
    }

    /**
       * Aborts any pending network connectivity check.
          */
    public abort(): void {
        if (this.currentAbortController) {
            this.currentAbortController.abort();
            this.currentAbortController = null;
            this.currentPromise = null;
        }
    }
}

export default ConnectivityService;