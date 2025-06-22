
interface EnvConfig {
    MOVIEDB_API_BASE_URL: string;
}

export const env: EnvConfig = {
    MOVIEDB_API_BASE_URL: import.meta.env.VITE_MOVIEDB_API_BASE_URL,
} as const;

// Validate environment variables
Object.entries(env).forEach(([key, value]) => {
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
});