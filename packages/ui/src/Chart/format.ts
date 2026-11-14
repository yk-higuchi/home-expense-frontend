/** グラフの数値の表示（日本語） */

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
});
const compact = new Intl.NumberFormat("ja-JP", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** マイナス記号を全角のマイナス（−）にそろえる */
const withMinus = (s: string): string => s.replace(/^-/, "−");

/** 金額（例: ￥44,000、−￥12,000） */
export const formatYen = (v: number): string => withMinus(yen.format(v));

/** 軸の目盛り（例: 0、10万、−5万） */
export const formatCompact = (v: number): string =>
  withMinus(compact.format(v));
