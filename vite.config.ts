import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    host: true,
    port: 4200,
    hmr: true,
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
      injectRegister: "auto",
      workbox: {
        runtimeCaching: [],          // no caching
        navigateFallback: "/index.html",
        skipWaiting: true,           // activate new SW immediately
        clientsClaim: true,          // take control of all pages
      },
    }),
  ],
});
