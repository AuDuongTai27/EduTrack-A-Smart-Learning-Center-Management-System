/** Format the supplied amount without compact units or display-only rounding. */
export function formatVND(amount: number | null | undefined): string {
  if (amount == null || !Number.isFinite(amount)) return "—";
  return `${amount.toLocaleString("vi-VN", { maximumFractionDigits: 20 })} VND`;
}
