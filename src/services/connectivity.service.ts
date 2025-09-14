class ConnectivityService {
    private static instance: ConnectivityService;
    private internetPromise: Promise<boolean> | null = null;

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
    private async check(): Promise<boolean> {
        try {
            await fetch("https://www.google.com/generate_204", { mode: "no-cors" });
            return true;
        } catch {
            return false;
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
