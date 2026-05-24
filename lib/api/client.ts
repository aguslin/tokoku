import { ApiResponse, ApiError, handleApiError } from './types';

interface FetchOptions extends RequestInit {
  timeout?: number;
  baseUrl?: string;
  responseType?: 'json' | 'text' | 'blob';
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private async fetchWithTimeout(
    url: string,
    options: FetchOptions = {}
  ): Promise<Response> {
    const { timeout = DEFAULT_TIMEOUT, baseUrl, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const fullUrl = `${baseUrl || this.baseUrl}${url}`;
      const response = await fetch(fullUrl, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw handleApiError({
          message: errorData.error || `HTTP ${response.status}`,
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
      const response = await this.fetchWithTimeout(url, {
        ...options,
        method: 'GET',
      });

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, error: apiError.message, code: apiError.code };
    }
  }

  async post<T>(
    url: string,
    body?: any,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithTimeout(url, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, error: apiError.message, code: apiError.code };
    }
  }

  async put<T>(
    url: string,
    body?: any,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.fetchWithTimeout(url, {
        ...options,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
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
      const response = await this.fetchWithTimeout(url, {
        ...options,
        method: 'DELETE',
      });

      const data = await response.json().catch(() => ({ success: true }));
      return { success: true, data };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, error: apiError.message, code: apiError.code };
    }
  }
}

export const apiClient = new ApiClient();
