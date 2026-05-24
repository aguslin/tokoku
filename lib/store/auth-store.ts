import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthData } from '@/lib/services/auth.service';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  loginSuccess: (data: AuthData) => void;
  getAccessToken: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        }),
      loginSuccess: (data: AuthData) =>
        set({
          user: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            phone: data.user.phone || undefined,
            avatar: data.user.avatar || undefined,
            role: data.user.isActive ? 'user' : '',
            createdAt: data.user.createdAt,
          },
          token: data.tokens.accessToken,
          refreshToken: data.tokens.refreshToken,
          isAuthenticated: true,
          error: null,
        }),
      getAccessToken: () => get().token,
    }),
    {
      name: 'auth-storage',
      version: 2,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
