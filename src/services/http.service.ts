class HttpService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Generic GET request with optional abort signal
  async get<T>(
    endpoint: string,
    params?: Record<string, string | number>,
    options?: { signal?: AbortSignal }
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
      signal: options?.signal,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Request failed: ${response.statusText}`);
    }
    return response.json();
  }

  // Generic POST request with optional abort signal
  async post<T>(endpoint: string, body: unknown, options?: { signal?: AbortSignal }): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
      signal: options?.signal,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async put<T>(endpoint: string, body: unknown, options?: { signal?: AbortSignal }): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
      signal: options?.signal,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async patch<T>(endpoint: string, body: unknown, options?: { signal?: AbortSignal }): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
      signal: options?.signal,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async delete<T>(endpoint: string, options?: { signal?: AbortSignal }): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
      signal: options?.signal,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Request failed: ${response.statusText}`);
    }
    return response.json();
  }

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
