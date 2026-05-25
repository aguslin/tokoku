import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  slug?: string;
  sellerName?: string;
  stock?: number;
  comparePrice?: number;
  sold?: number;
}

export interface WishlistState {
  items: WishlistItem[];
  itemCount: number;

  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,

      addItem: (item) => {
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId);
          if (exists) return state;

          const newItems = [...state.items, item];
          return {
            items: newItems,
            itemCount: newItems.length,
          };
        });
      },

      removeItem: (productId) => {
        set((state) => {
          const newItems = state.items.filter((i) => i.productId !== productId);
          return {
            items: newItems,
            itemCount: newItems.length,
          };
        });
      },

      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      clearWishlist: () => set({ items: [], itemCount: 0 }),
    }),
    {
      name: 'wishlist-storage',
      version: 1,
    }
  )
);
