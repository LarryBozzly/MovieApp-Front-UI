class AuthService {
    private readonly authStatusKey = 'Authorization';

    public isAuthorized(): Promise<boolean> {
        const token = this.getToken();
        return Promise.resolve(!!token);
    }

    getToken(): string | null {
        return this.getCookie(this.authStatusKey);
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
