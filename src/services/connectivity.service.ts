import { env } from "../config";

class ConnectivityService {
    private static instance: ConnectivityService;
    private internetPromise: Promise<boolean> | null = null;
    private healthCheckUrl = env.MOVIEDB_API_BASE_URL;

    // private constructor so it can’t be instantiated directly
    private constructor() { }

    // Singleton accessor
    public static getInstance(): ConnectivityService {
        if (!ConnectivityService.instance) {
            ConnectivityService.instance = new ConnectivityService();
        }
        return ConnectivityService.instance;
    }

    /** Check once if internet is reachable */
    private async check(timeoutMs = 5000): Promise<boolean> {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);

        try {
            // Add cache buster + force no caching
            await fetch(`${this.healthCheckUrl}?ts=${Date.now()}`, {
                mode: "no-cors",
                cache: "no-store",
                signal: controller.signal,
            });
            return true;
        } catch {
            return false;
        } finally {
            clearTimeout(id);
        }
    }

    /**
     * Wait until internet is available.
     * - If online, resolves immediately.
     * - If offline, keeps retrying at interval until it succeeds.
     */
    public async waitForInternet(intervalMs = 1000): Promise<boolean> {
        if (await this.check()) return true;

        if (this.internetPromise) return this.internetPromise;

        this.internetPromise = new Promise((resolve) => {
            const interval = setInterval(async () => {
                if (await this.check()) {
                    clearInterval(interval);
                    this.internetPromise = null;
                    resolve(true);
                }
            }, intervalMs);
        });

        return this.internetPromise;
    }
}

export default ConnectivityService;
