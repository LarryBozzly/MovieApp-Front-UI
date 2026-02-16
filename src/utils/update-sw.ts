export async function updateSW() {
  if (!('serviceWorker' in navigator)) return;
  // Get the service worker registration and call update to check for new versions
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      await reg.update();
    }
  } catch (e) {
    console.warn('Service worker update check failed', e);
  }
}
