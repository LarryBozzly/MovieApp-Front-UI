import { env } from "../config";

class ConnectivityService {
    private static instance: ConnectivityService;
    private internetPromise: Promise<boolean> | null = null;
    private abortController: AbortController | null = null; // new
    private baseUrl = env.MOVIEDB_API_BASE_URL;

    private constructor() { }

    public static getInstance(): ConnectivityService {
        if (!ConnectivityService.instance) {
            ConnectivityService.instance = new ConnectivityService();
        }
        return ConnectivityService.instance;
    }

    /** Check once if internet is reachable */
    private async check(signal?: AbortSignal): Promise<boolean> {
        const timeoutMs = 5000;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);

        if (signal) signal.addEventListener("abort", () => controller.abort());

        try {
            await fetch(`${this.baseUrl}/ping?ts=${Date.now()}`, {
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
        // abort previous pending check
        this.abortPrevious();

        this.abortController = new AbortController();
        const signal = this.abortController.signal;

        if (await this.check(signal)) return true;

        if (this.internetPromise) return this.internetPromise;

        this.internetPromise = new Promise((resolve) => {
            const interval = setInterval(async () => {
                if (await this.check(signal)) {
                    clearInterval(interval);
                    this.internetPromise = null;
                    this.abortController = null;
                    resolve(true);
                }
            }, intervalMs);
        });

        return this.internetPromise;
    }

    /** Cancel any pending wait */
    public abortPrevious() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
            this.internetPromise = null;
        }
    }
}

export default ConnectivityService;
