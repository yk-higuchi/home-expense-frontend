const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
});
const compact = new Intl.NumberFormat("ja-JP", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const withMinus = (s: string): string => s.replace(/^-/, "−");

export const formatYen = (v: number): string => withMinus(yen.format(v));

export const formatCompact = (v: number): string =>
  withMinus(compact.format(v));
