const integer = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 0,
  signDisplay: "negative",
});
const compact = new Intl.NumberFormat("ja-JP", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const withMinus = (s: string): string => s.replace(/^-/, "−");

export const formatYen = (v: number): string =>
  `${withMinus(integer.format(v))}円`;

export const formatCompact = (v: number): string =>
  withMinus(compact.format(v));
