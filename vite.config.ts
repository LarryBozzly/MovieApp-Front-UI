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
        globPatterns: ["**/*.{js,css,html,ico,png,svg,md,txt}"],
        skipWaiting: true,
      },
    }),
  ],
});
