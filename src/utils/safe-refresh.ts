import ConnectivityService from '../services/connectivity.service';
import { authStore } from '../store/auth-store';
import { pauseAppUntilOnline } from './pause-app-until-online';

/**
 * Executes the provided async function (e.g., authStore.refresh) only if
 * connectivity is confirmed. If not connected, it pauses the app until online.
 * * @param refreshFn The original async refresh function from the store, which takes no arguments.
 */
export async function safeRefresh(refreshFn: () => Promise<void>) {
  const connectivityService = ConnectivityService.getInstance();
  authStore.getState().setLoading(true);
  // 1. Check connectivity immediately
  const isOnlineAndConnected = await connectivityService.checkNow();

  if (!isOnlineAndConnected) {
    // 2. If offline, pause the app and wait.
    // This function blocks until online, then reloads the page.
    // The original refreshFn will *never* run in this execution path.
    // NOTE: The implementation of pauseAppUntilOnline() must be available/imported.
    return pauseAppUntilOnline();
  }

  // 3. If connected, execute the original refresh function.
  await refreshFn();
}
