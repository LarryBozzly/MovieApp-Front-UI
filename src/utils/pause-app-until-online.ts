import AuthService from '../services/auth.service';
import ConnectivityService from '../services/connectivity.service';

/**
 * Enters a "purgatory" mode:
 * 1. Removes the application root element to freeze the UI.
 * 2. Stops the auth token refresh timer.
 * 3. Injects an offline spinner/message into the body.
 * 4. BLOCKS execution by awaiting a successful server ping via ConnectivityService.
 * 5. Removes the spinner and reloads the page once connectivity is restored.
 */
export async function pauseAppUntilOnline() {
  const authService = await AuthService.getInstance();
  const connectivityService = ConnectivityService.getInstance();

  // 1. Freeze the UI by removing the app root
  const appRoot = document.querySelector('app-root');
  if (appRoot) appRoot.remove();

  // 2. Stop ongoing background processes
  authService.stopRefreshTimer();

  // 3. Inject the "purgatory" UI (offline spinner)
  let spinner = document.getElementById('offline-spinner');
  if (!spinner) {
    spinner = document.createElement('div');
    spinner.id = 'offline-spinner';
    spinner.innerHTML = `
            <div class="fixed top-0 left-0 w-full h-screen flex items-center justify-center bg-black/65 z-[9999]">
                <span class="loading loading-spinner text-white w-16 h-16"></span>
            </div>
        `;
    document.body.appendChild(spinner);
  }

  // 4. BLOCK EXECUTION: Wait for the server to be reachable
  // connectivityService.waitForInternet() handles the internal retry loop.
  await connectivityService.waitForInternet();

  // 5. Cleanup and Reload: Execution resumes only when online
  spinner?.remove();
  // Trigger a full application restart to re-run all initialization logic and guards
  window.location.reload();

  // This return is crucial for the Vaadin router guard to exit properly
  return;
}
