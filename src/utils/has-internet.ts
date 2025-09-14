export async function hasInternet(): Promise<boolean> {
    try {
        await fetch('https://www.google.com/generate_204', { mode: 'no-cors' });
        return true;
    } catch {
        return false;
    }
}