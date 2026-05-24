import { create } from 'zustand';

export interface Voucher {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  used: number;
  expiresAt: string;
  isActive: boolean;
}

export interface VoucherState {
  vouchers: Voucher[];
  appliedVouchers: string[];
  discountAmount: number;

  setVouchers: (vouchers: Voucher[]) => void;
  applyVoucher: (code: string) => void;
  removeVoucher: (code: string) => void;
  calculateDiscount: (subtotal: number) => number;
  clearVouchers: () => void;
}

export const useVoucherStore = create<VoucherState>((set, get) => ({
  vouchers: [],
  appliedVouchers: [],
  discountAmount: 0,

  setVouchers: (vouchers) => set({ vouchers }),

  applyVoucher: (code) => {
    set((state) => {
      const voucher = state.vouchers.find((v) => v.code === code);
      if (!voucher || !voucher.isActive) return state;

      const newApplied = [...state.appliedVouchers, code];
      return {
        appliedVouchers: newApplied,
      };
    });
  },

  removeVoucher: (code) => {
    set((state) => ({
      appliedVouchers: state.appliedVouchers.filter((v) => v !== code),
    }));
  },

  calculateDiscount: (subtotal) => {
    const { vouchers, appliedVouchers } = get();
    let totalDiscount = 0;

    appliedVouchers.forEach((code) => {
      const voucher = vouchers.find((v) => v.code === code);
      if (!voucher) return;

      if (subtotal < (voucher.minPurchase || 0)) return;

      let discount = 0;
      if (voucher.discountType === 'percentage') {
        discount = (subtotal * voucher.discountValue) / 100;
      } else {
        discount = voucher.discountValue;
      }

      if (voucher.maxDiscount) {
        discount = Math.min(discount, voucher.maxDiscount);
      }

      totalDiscount += discount;
    });

    set({ discountAmount: totalDiscount });
    return totalDiscount;
  },

  clearVouchers: () => set({ appliedVouchers: [], discountAmount: 0 }),
}));
