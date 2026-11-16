import { type CSSProperties, type ReactElement, useId } from "react";
import { formatCompact, formatYen } from "../format/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../Table/Table";
import styles from "./Chart.module.css";
import { ChartInteraction } from "./ChartInteraction";
import { decimateLTTB, type IndexedPoint } from "./decimate";
import { computeScale, type Scale, tickCountFor } from "./scales";

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

const PADDING = { top: 8, bottom: 28 } as const;
const BAR_MAX = 24;
const BAR_GAP = 2;
const MARKER_LIMIT = 60;
const LINE_POINTS = 400;
const LABEL_WIDTH = 48;
const ASSUMED_WIDTH = 640;

const isNumber = (v: number | null | undefined): v is number =>
  typeof v === "number" && Number.isFinite(v);

const percent = (value: number): string => `${value * 100}%`;

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
  const titleId = useId();
  const descId = useId();
  const count = labels.length;
  const plotHeight = Math.max(0, height - PADDING.top - PADDING.bottom);
  const allValues = series.flatMap((s) => s.values.filter(isNumber));
  const scale = computeScale(
    allValues,
    count,
    { x: 0, y: PADDING.top, w: count, h: plotHeight },
    tickCountFor(plotHeight),
  );
  const y0 = scale.toY(0);
  const barSeries = series.filter((s) => s.type === "bar");
  const lineSeries = series.filter((s) => s.type === "line");
  const k = barSeries.length;
  const barSlot = `max(2px, min(${BAR_MAX}px, calc((60% - ${BAR_GAP * Math.max(0, k - 1)}px) / ${Math.max(1, k)})))`;
  const labelStep = Math.max(
    1,
    Math.ceil((count * LABEL_WIDTH) / ASSUMED_WIDTH),
  );
  const empty = count === 0 || series.length === 0 || allValues.length === 0;
  const legend =
    series.length >= 2 ? (
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
    ) : null;

  if (empty) {
    return (
      <div className={styles.chart}>
        {legend}
        <div className={styles.plot} style={{ height }}>
          <p className={styles.empty}>データがありません</p>
        </div>
      </div>
    );
  }

  const textOf = (v: number | null | undefined): string =>
    isNumber(v) ? formatValue(v) : "—";

  return (
    <div className={styles.chart}>
      {legend}
      <ChartInteraction
        title={title}
        labels={labels}
        height={height}
        plotTop={PADDING.top}
        plotHeight={plotHeight}
        descriptions={labels.map(
          (label, i) =>
            `${label}: ${series
              .map((s) => {
                const v = s.values[i];
                return `${s.label} ${isNumber(v) ? formatValue(v) : "なし"}`;
              })
              .join("、")}`,
        )}
        series={series.map((s) => ({
          label: s.label,
          color: s.color,
          texts: s.values.map(textOf),
          markerY:
            s.type === "line"
              ? s.values.map((v) => (isNumber(v) ? scale.toY(v) : null))
              : null,
        }))}
      >
        <div className={styles.area}>
          <svg
            className={styles.svg}
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
                  x1="0"
                  x2="100%"
                  y1={scale.toY(tick)}
                  y2={scale.toY(tick)}
                />
                <text
                  className={styles.tick}
                  x={-8}
                  y={scale.toY(tick)}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {formatTick(tick)}
                </text>
              </g>
            ))}
          </svg>
          {k > 0 && (
            <div className={styles.bars} aria-hidden="true">
              {labels.map((label, i) => (
                <div
                  key={label}
                  className={styles.barGroup}
                  style={{
                    left: percent(i / count),
                    width: percent(1 / count),
                  }}
                >
                  {barSeries.map((s) => {
                    const v = s.values[i];
                    const top = isNumber(v) ? Math.min(y0, scale.toY(v)) : 0;
                    const size = isNumber(v) ? Math.abs(scale.toY(v) - y0) : 0;
                    const r = Math.min(4, size);
                    const style: CSSProperties = {
                      top,
                      height: size,
                      background: s.color,
                      borderRadius:
                        isNumber(v) && v < 0
                          ? `0 0 ${r}px ${r}px`
                          : `${r}px ${r}px 0 0`,
                    };
                    return (
                      <div
                        key={s.label}
                        className={styles.barSlot}
                        style={{ flexBasis: barSlot }}
                      >
                        {size > 0 && (
                          <span className={styles.bar} style={style} />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
          <svg className={styles.svg} aria-hidden="true">
            <svg
              className={styles.svg}
              viewBox={`0 0 ${count} ${height}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {lineSeries.map((s) => (
                <path
                  key={s.label}
                  className={styles.line}
                  style={{ stroke: s.color }}
                  d={linePath(s.values, scale, LINE_POINTS)}
                />
              ))}
            </svg>
            {lineSeries.map((s) => {
              const points: IndexedPoint[] = s.values.flatMap((value, index) =>
                isNumber(value) ? [{ index, value }] : [],
              );
              return points.length <= MARKER_LIMIT ? (
                <g key={s.label}>
                  {points.map(({ index, value }) => (
                    <circle
                      key={index}
                      className={styles.marker}
                      style={{ fill: s.color }}
                      cx={percent((index + 0.5) / count)}
                      cy={scale.toY(value)}
                      r={4}
                    />
                  ))}
                </g>
              ) : null;
            })}
            {labels.map((label, i) =>
              i % labelStep === 0 ? (
                <text
                  key={label}
                  className={
                    (i / labelStep) % 2 === 1 ? styles.tickMinor : styles.tick
                  }
                  x={percent((i + 0.5) / count)}
                  y={PADDING.top + plotHeight + 18}
                  textAnchor="middle"
                >
                  {label}
                </text>
              ) : null,
            )}
          </svg>
        </div>
      </ChartInteraction>
      {showTable && (
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
                  {series.map((s) => (
                    <TableCell key={s.label}>{textOf(s.values[i])}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </details>
      )}
    </div>
  );
};
