export const formatCurrency = (
  amount: number,
  currency: string = 'EUR',
  locale: string = 'it-IT'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

export const parseCurrency = (value: string): number => {
  // Remove currency symbols and convert to number
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};

export const calculateDiscount = (
  originalPrice: number,
  discountedPrice: number
): number => {
  if (originalPrice === 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};