/**
 * グラフの目盛りと座標の計算（参考実装 wc-line-chart の scales.ts を移植）
 * 変更点: 0 を必ず範囲に含める（金額のグラフで 0 を基準にするため）
 */

export interface Plot {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface Scale {
  /** i 番目の区間の中心の x 座標 */
  readonly toX: (i: number) => number;
  readonly toY: (v: number) => number;
  /** 1 区間の幅 */
  readonly band: number;
  readonly yTicks: readonly number[];
}

export const computeScale = (
  values: readonly number[],
  count: number,
  plot: Plot,
  yTickCount: number,
): Scale => {
  let min = 0;
  let max = 0;
  for (const v of values) {
    if (!Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (min === max) max = min + 1;
  const yTicks = niceTicks(min, max, yTickCount);
  const yMin = yTicks[0];
  const yMax = yTicks[yTicks.length - 1] ?? yMin + 1;
  const range = yMax - yMin || 1;
  const band = count > 0 ? plot.w / count : plot.w;
  return {
    toX: (i) => plot.x + band * i + band / 2,
    toY: (v) => plot.y + plot.h - ((v - yMin) / range) * plot.h,
    band,
    yTicks,
  };
};

/** 切りのいい目盛り（1・2・5 × 10^n 刻み） */
export const niceTicks = (
  min: number,
  max: number,
  count: number,
): [number, ...number[]] => {
  const step = niceNum((max - min || 1) / Math.max(1, count - 1));
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: [number, ...number[]] = [niceMin];
  for (let v = niceMin + step; v <= niceMax + step / 2; v += step) {
    ticks.push(Math.round(v / step) * step);
  }
  return ticks;
};

const niceNum = (range: number): number => {
  const exp = Math.floor(Math.log10(Math.abs(range) || 1));
  const f = Math.abs(range) / 10 ** exp;
  const nice = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10;
  return nice * 10 ** exp;
};

/** 高さに応じた目盛りの数（40px に 1 本、2〜10 本） */
export const tickCountFor = (plotH: number): number =>
  Math.max(2, Math.min(10, Math.round(plotH / 40)));
