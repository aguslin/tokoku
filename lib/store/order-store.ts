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
  status: 'pending' | 'paid' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunded';
  paymentMethod: string;
  paymentProof?: string;
  paymentProofUploadedAt?: string;
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
  submitPaymentProof: (id: string, proofUrl: string) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => {
        const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = (Math.random() * 16) | 0;
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });
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
      submitPaymentProof: (id, proofUrl) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id
              ? { ...o, paymentProof: proofUrl, paymentProofUploadedAt: new Date().toISOString(), status: 'paid' }
              : o
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
