import { authStore } from '../store/auth-store';
import { safeRefresh } from '../utils/safe-refresh';

class AuthService {
  private static instance: AuthService;

  private readonly authStatusKey = 'Authorization';
  private readonly refreshTokenFlag = 'refreshTokenFlag';

  // Default token expiration duration in seconds (30 minutes)
  private readonly defaultExpiresIn = 30 * 60;

  // Change to use Timeout for better control
  private refreshTimeout: ReturnType<typeof setTimeout> | null = null;
  private timerStartTime: number | null = null;

  // Private constructor to prevent direct instantiation
  private constructor() {}

  // Singleton accessor
  public static getInstance(): AuthService {
    if (!AuthService.instance) AuthService.instance = new AuthService();
    return AuthService.instance;
  }

  /** Checks if user has a valid access token */
  public isAuthorized(): boolean {
    return !!this.getToken();
  }

  /** Get access token from cookie */
  public getToken(): string | null {
    return this.getCookie(this.authStatusKey);
  }

  /** Checks if refresh token flag cookie is present */
  public hasRefreshTokenFlag(): boolean {
    return !!this.getCookie(this.refreshTokenFlag);
  }

  /** Get cookie value by name */
  private getCookie(name: string): string | null {
    const cookieName = `${name}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');

    for (const cookie of cookies) {
      const c = cookie.trim();
      if (c.startsWith(cookieName)) {
        return c.substring(cookieName.length);
      }
    }
    return null;
  }

  /** Clears all cookies visible to JavaScript */
  public clearAllCookies(): void {
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  }

  /**
   * Get remaining time in milliseconds until expiration,
   * based on timer start time and fixed defaultExpiresIn.
   */
  public getTimeUntilExpiration(): number | null {
    if (!this.timerStartTime) return null;
    const expirationTime = this.timerStartTime + this.defaultExpiresIn * 1000;
    return expirationTime - Date.now();
  }

  /**
   * Starts the refresh timer, resetting the countdown from defaultExpiresIn.
   * Will trigger refresh only once 30 minutes have passed.
   */
  public startRefreshTimer() {
    this.stopRefreshTimer();

    this.timerStartTime = Date.now();

    const attemptRefresh = async () => {
      if (!this.isAuthorized()) {
        this.stopRefreshTimer();
        return;
      }

      const timeLeft = this.getTimeUntilExpiration();

      if (timeLeft !== null && timeLeft <= 0) {
        this.timerStartTime = Date.now();
        await safeRefresh(authStore.getState().refresh);
      }

      const nextCheckInMs = 2000;
      this.refreshTimeout = setTimeout(attemptRefresh, nextCheckInMs);
    };

    this.refreshTimeout = setTimeout(attemptRefresh, 0);
  }

  public stopRefreshTimer() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
    this.timerStartTime = null;
  }
}

export default AuthService;
