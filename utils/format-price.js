export function formatPrice(priceStr) {
  if (!priceStr) return null;
  // Remove currency symbols and spaces
  let cleaned = priceStr.replace(/[^\d,.-]/g, "");
  // Replace dot as thousands separator and comma as decimal separator
  cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  // Parse to float
  const value = parseFloat(cleaned);
  return isNaN(value) ? null : value;
}
