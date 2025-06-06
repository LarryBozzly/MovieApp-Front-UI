import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
// Export full Vite config
export default defineConfig({
    server: {
        port: 4200,
        hmr: true,
    },
    base: './',
    build: {
        target: 'esnext',
        minify: 'esbuild',
        sourcemap: false,
        outDir: 'dist',
    },
    plugins: [
        tailwindcss(),
    ],
});
