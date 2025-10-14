// src/main.ts
import { registerSW } from "virtual:pwa-register";

// 1️⃣ Register the Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    updateSW({ immediate: true });
  },
  onOfflineReady() {
  },
});

// 2️⃣ Function to bootstrap your Lit app
async function bootstrap() {
  // Import your Lit root component only when ready
  await import('./app-root.ts');
}

if ('serviceWorker' in navigator) {
  if (navigator.onLine) {
    // Online → go immediately
    bootstrap();
  } else {
    // Offline → wait for service worker to be ready
    navigator.serviceWorker.ready.then(() => {
      bootstrap();
    });
  }
} else {
  // No SW support
  bootstrap();
}
