import { create } from 'zustand';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface UIState {
  toasts: Toast[];
  isDrawerOpen: boolean;
  isMobileMenuOpen: boolean;
  isLoading: boolean;

  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  setDrawerOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
}

let toastId = 0;

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  isDrawerOpen: false,
  isMobileMenuOpen: false,
  isLoading: false,

  addToast: (toast) => {
    const id = `toast-${++toastId}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    if (toast.duration !== -1) {
      const duration = toast.duration || 3000;
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => set({ toasts: [] }),
  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
