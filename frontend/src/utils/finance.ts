import type { CombinationResponse } from "../types";

export const normaliseInvoiceAmounts = (
  raw: CombinationResponse["invoiceAmounts"] | undefined
) => {
  const normalised: Record<string, number> = {};
  if (!raw) return normalised;
  Object.entries(raw).forEach(([id, value]) => {
    const numeric =
      typeof value === "number"
        ? value
        : Number((value as string).replace(/,/g, ""));
    if (Number.isFinite(numeric)) {
      normalised[id] = numeric;
    }
  });
  return normalised;
};

export const parseRequiredIds = (value: string) =>
  value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

export const formatAmount = (value?: number | string): string => {
  if (typeof value === "string") {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return formatAmount(numeric);
    }
    return value;
  }
  if (typeof value !== "number" || Number.isNaN(value)) return "-";

  const decimalPart = value.toString().split(".")[1];
  const digits = decimalPart ? Math.min(Math.max(decimalPart.length, 2), 6) : 2;

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
};
