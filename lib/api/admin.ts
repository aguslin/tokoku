const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/_/backend/api/v1';

function getToken(): string | null {
  try {
    return localStorage.getItem('admin-token');
  } catch {
    return null;
  }
}

export function setAdminToken(token: string) {
  localStorage.setItem('admin-token', token);
}

export function getAdminToken(): string | null {
  return getToken();
}

export function clearAdminToken() {
  localStorage.removeItem('admin-token');
}

async function request<T>(
  method: string,
  path: string,
  body?: any
): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!res.ok) {
      let error = json.message || `HTTP ${res.status}`;
      if (json.errors?.length) {
        error += ': ' + json.errors.join(', ');
      }
      return { success: false, error };
    }
    let responseData = json.data;
    if (responseData && typeof responseData === 'object' && !Array.isArray(responseData) && 'meta' in responseData) {
      const arrayProp = Object.values(responseData).find(v => Array.isArray(v));
      if (arrayProp) responseData = arrayProp;
    }
    return { success: true, data: responseData, message: json.message };
  } catch (e: any) {
    return { success: false, error: e.message || 'Network error' };
  }
}

export const adminApi = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: any) => request<T>('POST', path, body),
  put: <T>(path: string, body?: any) => request<T>('PUT', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
};
