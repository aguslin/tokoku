import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  paymentMethod: string;
  courier: string;
  address: string;
  createdAt: string;
  estimatedDelivery: string;
}

export interface OrderState {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => string;
  getOrder: (id: string) => Order | undefined;
  updateStatus: (id: string, status: Order['status']) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => {
        const id = `ORD-${Date.now().toString().slice(-6)}`;
        set((state) => ({
          orders: [
            {
              ...order,
              id,
              createdAt: new Date().toISOString(),
            },
            ...state.orders,
          ],
        }));
        return id;
      },
      getOrder: (id) => {
        return get().orders.find((o) => o.id === id);
      },
      updateStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status } : o
          ),
        }));
      },
    }),
    {
      name: 'order-storage',
      version: 1,
    }
  )
);
