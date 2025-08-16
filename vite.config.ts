import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// Export full Vite config
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
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
            options: {
              cacheName: "html-cache",
              plugins: [
                {
                  handlerDidError: async ({ event }) => {
                    return caches.match(event.request);
                  },
                },
              ],
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === "script" ||
              request.destination === "style",
            handler: "CacheFirst",
            options: {
              cacheName: "static-resources",
            },
          },
        ],
      },
    }),
  ],
});
