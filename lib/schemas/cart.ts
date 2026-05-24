import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity must be at least 0'),
});

export const applyVoucherSchema = z.object({
  code: z.string().min(1, 'Voucher code is required'),
});

export const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(5, 'Zip code is required'),
  country: z.string().min(1, 'Country is required'),
  paymentMethod: z.enum(['credit-card', 'debit-card', 'e-wallet', 'bank-transfer']),
});

export type AddToCartData = z.infer<typeof addToCartSchema>;
export type UpdateCartItemData = z.infer<typeof updateCartItemSchema>;
export type ApplyVoucherData = z.infer<typeof applyVoucherSchema>;
export type CheckoutData = z.infer<typeof checkoutSchema>;
