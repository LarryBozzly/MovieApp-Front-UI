/**
 * Check if device has internet connectivity.
 * If offline, keeps retrying until online.
 */
export async function waitForInternet(intervalMs = 1000): Promise<boolean> {
    async function check(): Promise<boolean> {
        try {
            // This URL is designed for connectivity checks
            await fetch("https://www.google.com/generate_204", { mode: "no-cors" });
            return true;
        } catch {
            return false;
        }
    }

    // If already online, return immediately
    if (await check()) return true;

    // Otherwise, keep retrying until success
    return new Promise((resolve) => {
        const interval = setInterval(async () => {
            if (await check()) {
                clearInterval(interval);
                resolve(true);
            }
        }, intervalMs);
    });
}