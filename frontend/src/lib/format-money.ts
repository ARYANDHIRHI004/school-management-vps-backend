export function formatInrFromPaise(paise: number | null | undefined) {
  if (paise == null || Number.isNaN(paise)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

export function rupeesToPaise(rupees: string): number | undefined {
  const n = Number(rupees.trim());
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.round(n * 100);
}

export function paiseToRupeesInput(paise: number | null | undefined) {
  if (paise == null) return "";
  return String(paise / 100);
}