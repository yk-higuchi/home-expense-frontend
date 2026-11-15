"use client";

import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../Table/Table";
import styles from "./Chart.module.css";
import { decimateLTTB, type IndexedPoint } from "./decimate";
import { formatCompact, formatYen } from "./format";
import { computeScale, type Plot, type Scale, tickCountFor } from "./scales";

export interface ChartSeries {
  label: string;
  values: readonly (number | null)[];
  type: "bar" | "line";
  color: string;
}

export interface ChartProps {
  title: string;
  labels: readonly string[];
  series: readonly ChartSeries[];
  formatValue?: (value: number) => string;
  formatTick?: (value: number) => string;
  height?: number;
  showTable?: boolean;
}

const PADDING = { top: 8, right: 8, bottom: 28, left: 56 } as const;
const FALLBACK_WIDTH = 640;
const BAR_MAX = 24;
const BAR_GAP = 2;
const MARKER_LIMIT = 60;

const isNumber = (v: number | null | undefined): v is number =>
  typeof v === "number" && Number.isFinite(v);

const barPath = (x: number, y0: number, y1: number, w: number): string => {
  const h = Math.abs(y1 - y0);
  if (h === 0) return "";
  const r = Math.min(4, w / 2, h);
  const up = y1 < y0;
  const tip = y1;
  const sign = up ? 1 : -1;
  return [
    `M${x},${y0}`,
    `V${tip + sign * r}`,
    `Q${x},${tip} ${x + r},${tip}`,
    `H${x + w - r}`,
    `Q${x + w},${tip} ${x + w},${tip + sign * r}`,
    `V${y0}`,
    "Z",
  ].join(" ");
};

const segmentsOf = (values: readonly (number | null)[]): IndexedPoint[][] => {
  const segments: IndexedPoint[][] = [];
  let current: IndexedPoint[] = [];
  for (const [index, value] of values.entries()) {
    if (isNumber(value)) {
      current.push({ index, value });
    } else if (current.length > 0) {
      segments.push(current);
      current = [];
    }
  }
  if (current.length > 0) segments.push(current);
  return segments;
};

const linePath = (
  values: readonly (number | null)[],
  scale: Scale,
  target: number,
): string => {
  const total = values.length || 1;
  return segmentsOf(values)
    .map((segment) =>
      decimateLTTB(
        segment,
        Math.max(3, Math.round((target * segment.length) / total)),
      )
        .map(
          ({ index, value }, i) =>
            `${i === 0 ? "M" : "L"}${scale.toX(index)},${scale.toY(value)}`,
        )
        .join(" "),
    )
    .join(" ");
};

const describe = (
  labels: readonly string[],
  series: readonly ChartSeries[],
): string => {
  if (labels.length === 0 || series.length === 0) return "データがありません";
  const names = series.map((s) => s.label).join("・");
  return `${labels[0]}から${labels[labels.length - 1]}までの${names}（${labels.length}件）`;
};

export const Chart = ({
  title,
  labels,
  series,
  formatValue = formatYen,
  formatTick = formatCompact,
  height = 200,
  showTable = true,
}: ChartProps): ReactElement => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(FALLBACK_WIDTH);
  const [active, setActive] = useState(-1);
  const [announcement, setAnnouncement] = useState("");
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.max(240, Math.floor(entry.contentRect.width)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const plot: Plot = {
    x: PADDING.left,
    y: PADDING.top,
    w: Math.max(0, width - PADDING.left - PADDING.right),
    h: Math.max(0, height - PADDING.top - PADDING.bottom),
  };
  const count = labels.length;
  const allValues = series.flatMap((s) => s.values.filter(isNumber));
  const scale = computeScale(allValues, count, plot, tickCountFor(plot.h));
  const y0 = scale.toY(0);
  const barSeries = series.filter((s) => s.type === "bar");
  const lineSeries = series.filter((s) => s.type === "line");
  const k = barSeries.length;
  const barW =
    k > 0
      ? Math.max(
          2,
          Math.min(BAR_MAX, (scale.band * 0.6 - BAR_GAP * (k - 1)) / k),
        )
      : 0;
  const groupW = k * barW + BAR_GAP * Math.max(0, k - 1);
  const labelStep = Math.max(1, Math.ceil(48 / Math.max(1, scale.band)));
  const empty = count === 0 || series.length === 0 || allValues.length === 0;

  const describeAt = (i: number): string =>
    `${labels[i] ?? ""}: ${series
      .map((s) => {
        const v = s.values[i];
        return `${s.label} ${isNumber(v) ? formatValue(v) : "なし"}`;
      })
      .join("、")}`;

  const select = (i: number, announce: boolean): void => {
    setActive(i);
    if (announce) setAnnouncement(i >= 0 ? describeAt(i) : "");
  };

  const handlePointerMove = (event: PointerEvent<SVGRectElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || count === 0) return;
    const i = Math.floor(((event.clientX - rect.left) / rect.width) * count);
    select(Math.max(0, Math.min(count - 1, i)), false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (count === 0) return;
    const keys: Record<string, number> = {
      ArrowRight: Math.min(count - 1, Math.max(0, active) + 1),
      ArrowLeft: Math.max(0, active - 1),
      Home: 0,
      End: count - 1,
      Escape: -1,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next, true);
  };

  const tooltipLeft =
    active >= 0
      ? scale.toX(active) + scale.band / 2 + 8 > width - 200
        ? scale.toX(active) - scale.band / 2 - 8
        : scale.toX(active) + scale.band / 2 + 8
      : 0;
  const tooltipFlip = active >= 0 && tooltipLeft < scale.toX(active);

  return (
    <div className={styles.chart}>
      {series.length >= 2 && (
        <ul className={styles.legend}>
          {series.map((s) => (
            <li key={s.label} className={styles.legendItem}>
              <span
                className={
                  s.type === "bar" ? styles.swatchBar : styles.swatchLine
                }
                style={{ background: s.color }}
                aria-hidden="true"
              />
              {s.label}
            </li>
          ))}
        </ul>
      )}
      {/* biome-ignore lint/a11y/useSemanticElements: フォームではなく、矢印キーで値を読み上げるグラフの入れ物なので fieldset は使わない */}
      <div
        ref={wrapperRef}
        className={styles.plot}
        tabIndex={empty ? -1 : 0}
        role="group"
        aria-label={`${title}（左右の矢印キーで値を読み上げ）`}
        onKeyDown={handleKeyDown}
        onBlur={() => select(-1, false)}
        style={{ height }}
      >
        {empty ? (
          <p className={styles.empty}>データがありません</p>
        ) : (
          <svg
            className={styles.svg}
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-labelledby={titleId}
            aria-describedby={descId}
          >
            <title id={titleId}>{title}</title>
            <desc id={descId}>{describe(labels, series)}</desc>
            {scale.yTicks.map((tick) => (
              <g key={tick}>
                <line
                  className={tick === 0 ? styles.baseline : styles.grid}
                  x1={plot.x}
                  x2={plot.x + plot.w}
                  y1={scale.toY(tick)}
                  y2={scale.toY(tick)}
                />
                <text
                  className={styles.tick}
                  x={plot.x - 8}
                  y={scale.toY(tick)}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {formatTick(tick)}
                </text>
              </g>
            ))}
            {active >= 0 && (
              <rect
                className={styles.activeBand}
                x={scale.toX(active) - scale.band / 2}
                y={plot.y}
                width={scale.band}
                height={plot.h}
              />
            )}
            {barSeries.map((s, j) => (
              <g key={s.label} style={{ fill: s.color }}>
                {s.values.map((v, i) =>
                  isNumber(v) ? (
                    <path
                      // biome-ignore lint/suspicious/noArrayIndexKey: 月の並びは固定
                      key={i}
                      d={barPath(
                        scale.toX(i) - groupW / 2 + j * (barW + BAR_GAP),
                        y0,
                        scale.toY(v),
                        barW,
                      )}
                    />
                  ) : null,
                )}
              </g>
            ))}
            {lineSeries.map((s) => {
              const points: IndexedPoint[] = s.values.flatMap((value, index) =>
                isNumber(value) ? [{ index, value }] : [],
              );
              const target = Math.max(50, Math.floor(plot.w / 2));
              return (
                <g key={s.label}>
                  <path
                    className={styles.line}
                    style={{ stroke: s.color }}
                    d={linePath(s.values, scale, target)}
                  />
                  {points.length <= MARKER_LIMIT &&
                    points.map(({ index, value }) => (
                      <circle
                        key={index}
                        className={styles.marker}
                        style={{ fill: s.color }}
                        cx={scale.toX(index)}
                        cy={scale.toY(value)}
                        r={active === index ? 5 : 4}
                      />
                    ))}
                </g>
              );
            })}
            {labels.map((label, i) =>
              i % labelStep === 0 ? (
                <text
                  key={label}
                  className={styles.tick}
                  x={scale.toX(i)}
                  y={plot.y + plot.h + 18}
                  textAnchor="middle"
                >
                  {label}
                </text>
              ) : null,
            )}
            <rect
              className={styles.hitArea}
              x={plot.x}
              y={plot.y}
              width={plot.w}
              height={plot.h}
              onPointerMove={handlePointerMove}
              onPointerLeave={() => select(-1, false)}
            />
          </svg>
        )}
        {active >= 0 && (
          <div
            className={styles.tooltip}
            style={{
              left: tooltipLeft,
              top: plot.y,
              transform: tooltipFlip ? "translateX(-100%)" : undefined,
            }}
            aria-hidden="true"
          >
            <p className={styles.tooltipLabel}>{labels[active]}</p>
            <ul className={styles.tooltipRows}>
              {series.map((s) => {
                const v = s.values[active];
                return (
                  <li key={s.label} className={styles.tooltipRow}>
                    <span
                      className={styles.tooltipKey}
                      style={{ background: s.color }}
                    />
                    <span className={styles.tooltipValue}>
                      {isNumber(v) ? formatValue(v) : "—"}
                    </span>
                    <span className={styles.tooltipName}>{s.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      <p className={styles.srOnly} role="status" aria-live="polite">
        {announcement}
      </p>
      {showTable && !empty && (
        <details className={styles.details}>
          <summary className={styles.summary}>表で見る</summary>
          <Table aria-label={title}>
            <TableHead>
              <TableRow>
                <TableHeaderCell>項目</TableHeaderCell>
                {series.map((s) => (
                  <TableHeaderCell key={s.label}>{s.label}</TableHeaderCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {labels.map((label, i) => (
                <TableRow key={label}>
                  <TableCell>{label}</TableCell>
                  {series.map((s) => {
                    const v = s.values[i];
                    return (
                      <TableCell key={s.label}>
                        {isNumber(v) ? formatValue(v) : "—"}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </details>
      )}
    </div>
  );
};
