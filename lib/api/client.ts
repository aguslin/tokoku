import { ApiResponse, handleApiError } from './types';

interface FetchOptions extends RequestInit {
  timeout?: number;
  baseUrl?: string;
  authenticated?: boolean;
}

const DEFAULT_TIMEOUT = 30000;

function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (typeof window !== 'undefined'
      ? (window as any).__NEXT_DATA__?.props?.apiUrl || ''
      : '') || process.env.NEXT_PUBLIC_API_URL || '';
  }

  private buildHeaders(options: FetchOptions): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (options.authenticated !== false) {
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  private async fetchWithTimeout(
    url: string,
    options: FetchOptions = {}
  ): Promise<Response> {
    const { timeout = DEFAULT_TIMEOUT, baseUrl, authenticated, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const fullUrl = `${baseUrl || this.baseUrl}${url}`;
      const response = await fetch(fullUrl, {
        ...fetchOptions,
        headers: this.buildHeaders(options),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        try {
          const raw = localStorage.getItem('auth-storage');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.state?.token) {
              localStorage.removeItem('auth-storage');
              window.location.href = '/login';
            }
          }
        } catch {}
        throw handleApiError({ message: 'Sesi telah berakhir. Silakan login kembali.', status: 401 });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw handleApiError({
          message: errorData.message || `HTTP ${response.status}`,
          code: errorData.code || `HTTP_${response.status}`,
          status: response.status,
          details: errorData,
        });
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw handleApiError(error);
    }
  }

  async get<T>(url: string, options?: FetchOptions): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithTimeout(url, { ...options, method: 'GET' });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, error: apiError.message, code: apiError.code };
    }
  }

  async post<T>(url: string, body?: any, options?: FetchOptions): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithTimeout(url, {
        ...options,
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, error: apiError.message, code: apiError.code };
    }
  }

  async put<T>(url: string, body?: any, options?: FetchOptions): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithTimeout(url, {
        ...options,
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, error: apiError.message, code: apiError.code };
    }
  }

  async delete<T>(url: string, options?: FetchOptions): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithTimeout(url, { ...options, method: 'DELETE' });
      const data = await response.json().catch(() => ({ success: true }));
      return { success: true, data };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, error: apiError.message, code: apiError.code };
    }
  }
}

export const apiClient = new ApiClient();
