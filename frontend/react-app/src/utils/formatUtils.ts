export const formatNumber = (value: unknown, decimals: number = 1): string => {
  if (typeof value === 'number') {
    return value.toFixed(decimals);
  }
  return String(value);
};