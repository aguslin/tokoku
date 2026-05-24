import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  sellerName: string;
  sellerVerified: boolean;
}

export interface CartState {
  items: CartItem[];
  itemCount: number;
  total: number;

  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItem: (productId: string) => CartItem | undefined;
  updateTotal: () => void;
}

const calculateTotal = (items: CartItem[]) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      total: 0,

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.productId === item.productId);

          let newItems: CartItem[];
          if (existingItem) {
            newItems = state.items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            );
          } else {
            newItems = [...state.items, item];
          }

          return {
            items: newItems,
            itemCount: newItems.length,
            total: calculateTotal(newItems),
          };
        });
      },

      removeItem: (productId) => {
        set((state) => {
          const newItems = state.items.filter((i) => i.productId !== productId);
          return {
            items: newItems,
            itemCount: newItems.length,
            total: calculateTotal(newItems),
          };
        });
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          const newItems = state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          );

          return {
            items: quantity <= 0 ? newItems.filter((i) => i.productId !== productId) : newItems,
            itemCount: newItems.length,
            total: calculateTotal(newItems),
          };
        });
      },

      clearCart: () => set({ items: [], itemCount: 0, total: 0 }),

      getItem: (productId) => {
        return get().items.find((i) => i.productId === productId);
      },

      updateTotal: () => {
        set((state) => ({
          total: calculateTotal(state.items),
        }));
      },
    }),
    {
      name: 'cart-storage',
      version: 1,
    }
  )
);
