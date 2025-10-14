import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true });

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
