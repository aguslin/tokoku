import { apiClient } from './client';

const BASE_URL = '/payments';

export interface PaymentData {
  id: string;
  orderId: string;
  paymentMethodId: string;
  amount: number;
  status: string;
  paidAt: string | null;
  expiredAt: string | null;
  transactionId: string | null;
  metadata: Record<string, unknown> | null;
}

export interface PaymentMethodData {
  id: string;
  name: string;
  code: string;
  type: string;
  logo: string | null;
  isActive: boolean;
}

export const paymentApi = {
  createPayment: (orderId: string, paymentMethodId: string) =>
    apiClient.post<PaymentData>(`${BASE_URL}/${orderId}/pay`, { paymentMethodId }),

  getPaymentByOrder: (orderId: string) =>
    apiClient.get<PaymentData>(`${BASE_URL}/${orderId}`),

  submitPaymentProof: (orderId: string, formData: FormData, timeoutMs = 15000) => {
    const token = typeof window !== 'undefined'
      ? (() => {
          try {
            const raw = localStorage.getItem('auth-storage');
            if (!raw) return null;
            return JSON.parse(raw)?.state?.token || null;
          } catch {
            return null;
          }
        })()
      : null;

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    return fetch(`/_/backend/api/v1${BASE_URL}/${orderId}/proof`, {
      method: 'POST',
      body: formData,
      headers,
      credentials: 'include',
      signal: controller.signal,
    }).then(async (res) => {
      clearTimeout(timeoutId);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || `HTTP ${res.status}`);
      }
      return json;
    }).catch((err) => {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Permintaan timeout. Silakan coba lagi.');
      }
      throw err;
    });
  },
};
