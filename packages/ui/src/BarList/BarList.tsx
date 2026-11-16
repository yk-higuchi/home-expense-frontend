import type { ReactElement } from "react";

import { formatYen } from "../format/format";
import styles from "./BarList.module.css";

export interface BarListSeries {
  id: string;
  label: string;
  color: string;
}

export interface BarListItem {
  id: string;
  label: string;
  value: number;
  series?: string;
}

export interface BarListProps {
  items: readonly BarListItem[];
  total: number;
  series?: readonly BarListSeries[];
  label?: string;
  empty?: string;
  formatValue?: (value: number) => string;
}

const formatShare = (value: number, total: number): string => {
  const share = (value / total) * 100;
  return share < 1 ? "1%未満" : `${Math.round(share)}%`;
};

export const BarList = ({
  items,
  total,
  series = [],
  label,
  empty = "データがありません",
  formatValue = formatYen,
}: BarListProps): ReactElement => {
  if (items.length === 0) {
    return <p className={styles.empty}>{empty}</p>;
  }
  const max = Math.max(...items.map(({ value }) => value));
  const seriesOf = (id: string | undefined) => series.find((s) => s.id === id);
  return (
    <div className={styles.barList}>
      {series.length >= 2 && (
        <ul className={styles.legend}>
          {series.map((s) => (
            <li key={s.id} className={styles.legendItem}>
              <span
                className={styles.swatch}
                style={{ background: s.color }}
                aria-hidden="true"
              />
              {s.label}
            </li>
          ))}
        </ul>
      )}
      <ol className={styles.list} aria-label={label}>
        {items.map(({ id, label: name, value, series: seriesId }) => {
          const s = seriesOf(seriesId);
          return (
            <li key={id} className={styles.item}>
              <span className={styles.label}>
                {name}
                {s && <span className={styles.srOnly}>（{s.label}）</span>}
              </span>
              <span className={styles.track} aria-hidden="true">
                <span
                  className={styles.bar}
                  style={{
                    width: `${max > 0 ? (value / max) * 100 : 0}%`,
                    background: s?.color,
                  }}
                />
              </span>
              <span className={styles.value}>
                {formatValue(value)}
                {total > 0 && `（${formatShare(value, total)}）`}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
