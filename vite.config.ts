// vite.config.ts
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
        cleanupOutdatedCaches: true,
        globDirectory: "dist/",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,md}"],
        runtimeCaching: [
          {
            // Catch-all: match any request that is NOT a local asset
            urlPattern: ({ url }) => {
              return !url.pathname.match(/\.(js|css|html|ico|png|svg)$/);
            },
            handler: "NetworkOnly", // never cache API calls
            method: "GET",
          },
        ],
      },
    }),
  ],
});
