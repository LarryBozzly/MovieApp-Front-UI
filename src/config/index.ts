
interface EnvConfig {
    MOVIEDB_API_BASE_URL: string;
    MOVIEDB_API_KEY: string;
}

export const env: EnvConfig = {
    MOVIEDB_API_BASE_URL: import.meta.env.VITE_MOVIEDB_API_BASE_URL,
    MOVIEDB_API_KEY: import.meta.env.VITE_MOVIEDB_API_KEY,
} as const;

// Validate environment variables
Object.entries(env).forEach(([key, value]) => {
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
});