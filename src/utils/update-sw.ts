export async function updateSW() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      await reg.update();
    }
  } catch (e) {
    console.warn('Service worker update check failed', e);
  }
}
