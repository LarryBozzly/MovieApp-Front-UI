class AuthService {
    private readonly authStatusKey = 'Authorization';
    private readonly refreshTokenFlag = 'refreshTokenFlag';

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
}

export default AuthService;
