import { updateSW } from '@utils/update-sw.ts';

async function bootstrap() {
  // Import your Lit root component only when ready
  await import('./app-root.ts');
  updateSW();
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('New SW activated → reloading page');
    window.location.reload();
  });

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
