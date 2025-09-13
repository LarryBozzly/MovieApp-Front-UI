async function waitForOnline() {
  if (navigator.onLine) return;

  // Optionally set a global loading state here
  // authStore.getState().setLoading(true);

  // Wait until network is back
  await new Promise<void>((resolve) => {
    window.addEventListener("online", () => resolve(), { once: true });
  });

  // Optionally clear loading state
  // authStore.getState().setLoading(false);
}

async function bootstrap() {
  await waitForOnline(); // ✅ wait until online
  await import('./app-root.ts'); // import Lit app only after online
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(() => {
    bootstrap();
  });
} else {
  bootstrap();
}
