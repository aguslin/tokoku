import { apiClient } from '@/lib/api/client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
}

export interface AuthData {
  user: UserData;
  tokens: TokenData;
}

export const authService = {
  login: async (data: LoginRequest) => {
    const result = await apiClient.post<{ success: boolean; message: string; data: AuthData }>(
      '/auth/login',
      data
    );
    if (result.success && result.data) {
      return { success: true as const, data: result.data.data };
    }
    return { success: false as const, error: result.error || 'Login gagal' };
  },

  register: async (data: RegisterRequest) => {
    const result = await apiClient.post<{ success: boolean; message: string; data: AuthData }>(
      '/auth/register',
      data
    );
    if (result.success && result.data) {
      return { success: true as const };
    }
    return { success: false as const, error: result.error || 'Registrasi gagal' };
  },

  getProfile: () =>
    apiClient.get<UserData>('/auth/me'),
};
