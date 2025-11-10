// vite.config.ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    host: true,
    port: 4200,
    hmr: false,
  },
  base: "./",
  build: {
    target: "esnext",
    minify: "esbuild",
    sourcemap: false,
    outDir: "dist",
  },
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "script",
      workbox: {
        cleanupOutdatedCaches: true,
        globDirectory: "dist/",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,md}"],
        skipWaiting: true,
      },
      manifest: {
        name: "Your New App Name",           // Full app name
        short_name: "Short Name",            // Appears under icon
        description: "A brief description of your PWA",
        theme_color: "#ffffff",              // Color for the status bar/splash
        background_color: "#ffffff",
        display: "standalone",
        start_url: "./",
        icons: [
          {
            src: "assets/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "assets/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "assets/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
