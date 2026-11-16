const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
});
const compact = new Intl.NumberFormat("ja-JP", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const MINUS = "−";

const withMinus = (s: string): string => s.replace(/^-/, MINUS);

export const formatYen = (v: number): string =>
  yen
    .formatToParts(Math.abs(v))
    .map(({ type, value }) =>
      type === "currency" && v < 0 ? `${value}${MINUS}` : value,
    )
    .join("");

export const formatCompact = (v: number): string =>
  withMinus(compact.format(v));
