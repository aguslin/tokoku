/**
 * Format number to Indonesian Rupiah (Rp) currency
 * Example: 1000 → "Rp 1.000"
 * Example: 1500000 → "Rp 1.500.000"
 */
export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseInt(amount, 10) : Math.round(amount);

  if (isNaN(numAmount)) {
    return 'Rp 0';
  }

  const formatted = numAmount.toLocaleString('id-ID');
  return `Rp ${formatted}`;
}

/**
 * Parse Indonesian Rupiah string back to number
 * Example: "Rp 1.000" → 1000
 * Example: "Rp 1.500.000" → 1500000
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
}

/**
 * Format discount percentage
 * Example: 10 → "-10%"
 */
export function formatDiscount(discount: number): string {
  return `-${discount}%`;
}

/**
 * Format currency range
 * Example: 10000, 50000 → "Rp 10.000 - Rp 50.000"
 */
export function formatCurrencyRange(min: number, max: number): string {
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
}

/**
 * Calculate discounted price
 */
export function calculateDiscount(originalPrice: number, discountPercent: number): number {
  return Math.floor(originalPrice * (1 - discountPercent / 100));
}

/**
 * Format with abbreviation for large numbers (K for thousand, M for million)
 * Example: 5000 → "5K"
 * Example: 1500000 → "1.5M"
 */
export function formatCurrencyShort(amount: number): string {
  if (amount >= 1000000) {
    return (amount / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + 'M';
  }
  if (amount >= 1000) {
    return (amount / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + 'K';
  }
  return amount.toString();
}
