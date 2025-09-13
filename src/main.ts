async function bootstrap() {
  // Import your Lit root component only when ready
  await import('./app-root.ts');
}

function startApp() {
  if (navigator.onLine) {
    // Online → go immediately
    bootstrap();
  } else if ('serviceWorker' in navigator) {
    // Offline → wait for service worker, then wait for online
    navigator.serviceWorker.ready.then(() => {
      waitForOnline().then(() => bootstrap());
    });
  } else {
    // No SW support
    waitForOnline().then(() => bootstrap());
  }
}

async function waitForOnline() {
  console.log("[App] Waiting for connection…");
  document.body.classList.add("offline");

  return new Promise<void>((resolve) => {
    window.addEventListener(
      "online",
      () => {
        console.log("[App] Back online!");
        document.body.classList.remove("offline");
        resolve();
      },
      { once: true }
    );
  });
}

// Run initial bootstrap
startApp();

// 🔄 Listen for runtime connectivity changes
window.addEventListener("offline", () => {
  console.log("[App] Lost connection, pausing app…");
  document.body.classList.add("offline");

  // 👉 Optional: hard stop by reloading when online again
  window.addEventListener(
    "online",
    () => {
      console.log("[App] Online again, reloading app");
      window.location.reload();
    },
    { once: true }
  );
});
