class HttpService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    // Generic GET request
    async get<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
        const url = this.buildUrl(endpoint, params);
        const response = await fetch(url, {
            method: 'GET',
            headers: this.getHeaders(),
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Request failed: ${response.statusText}`);
        }
        return response.json();
    }

    // Generic POST request
    async post<T>(endpoint: string, body: unknown): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Request failed: ${response.statusText}`);
        }
        return response.json();
    }

    // Generic PUT request
    async put<T>(endpoint: string, body: unknown): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            credentials: 'include',
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Request failed: ${response.statusText}`);
        }
        return response.json();
    }

    // Generic DELETE request
    async delete<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Request failed: ${response.statusText}`);
        }
        return response.json();
    }

    // Helper method to get headers
    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        return headers;
    }

    // Helper method to build URL with query parameters
    private buildUrl(endpoint: string, params?: Record<string, string | number>): string {
        if (!params) return `${this.baseUrl}${endpoint}`;
        const queryString = new URLSearchParams(params as Record<string, string>).toString();
        return `${this.baseUrl}${endpoint}?${queryString}`;
    }
}

export default HttpService;