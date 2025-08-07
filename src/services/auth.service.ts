class AuthService {
    private readonly authStatusKey = 'AuthStatus';
    private readonly wsTokenKey = 'wsToken';  // The cookie name for your websocket token

    public isAuthorized(): Promise<boolean> {
        const status = this.getToken();
        return Promise.resolve(status === "1");
    }

    getToken(): string | null {
        return this.getCookie(this.authStatusKey);
    }

    getWsToken(): string | null {
        return this.getCookie(this.wsTokenKey);
    }

    private getCookie(name: string): string | null {
        const cookieName = name + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookies = decodedCookie.split(';');
        for (let c of cookies) {
            c = c.trim();
            if (c.indexOf(cookieName) === 0) {
                return c.substring(cookieName.length, c.length);
            }
        }
        return null;
    }

    public clearAllCookies(): void {
        const cookies = document.cookie.split(";");
        for (const cookie of cookies) {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }
    }
}

export default AuthService;
