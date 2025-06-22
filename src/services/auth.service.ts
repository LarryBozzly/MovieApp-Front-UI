class AuthService {
    private readonly key = 'AuthStatus';

    public isAuthorized(): Promise<boolean> {
        const status = this.getToken();
        return Promise.resolve(status === "1");
    }

    getToken(): string | null {
        const name = this.key + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let c of ca) {
            c = c.trim();
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return null;
    }
}

export default AuthService;