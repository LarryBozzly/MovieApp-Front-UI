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
        name: "Movviator",           // Full app name
        short_name: "Movviator",            // Appears under icon
        description: "Match, watch, and enjoy movie nights effortlessly!",
        theme_color: "#422ad5",              // Color for the status bar/splash
        background_color: "#ffffff",
        display: "standalone",
        start_url: "./",
        icons: [
          {
            src: "/images/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/images/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/images/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
