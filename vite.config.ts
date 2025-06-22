import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    server: {
        host: true,
        port: 4200,
        hmr: true,
        proxy: {
            '/api': {
                target: 'https://backend-nodejs-ypju.onrender.com',
                changeOrigin: true,
                secure: true, 
                rewrite: path => path.replace(/^\/api/, ''),
            },
        },
    },
    base: './',
    build: {
        target: 'esnext',
        minify: 'esbuild',
        sourcemap: false,
        outDir: 'dist',
    },
    plugins: [tailwindcss()],
});
