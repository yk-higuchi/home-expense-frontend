import type { ReactElement } from "react";

import { formatYen } from "../format/format";
import styles from "./BarList.module.css";

export interface BarListItem {
  id: string;
  label: string;
  value: number;
}

export interface BarListProps {
  items: readonly BarListItem[];
  total: number;
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
  label,
  empty = "データがありません",
  formatValue = formatYen,
}: BarListProps): ReactElement => {
  if (items.length === 0) {
    return <p className={styles.empty}>{empty}</p>;
  }
  const max = Math.max(...items.map(({ value }) => value));
  return (
    <ol className={styles.list} aria-label={label}>
      {items.map(({ id, label: name, value }) => (
        <li key={id} className={styles.item}>
          <span className={styles.label}>{name}</span>
          <span className={styles.track} aria-hidden="true">
            <span
              className={styles.bar}
              style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
            />
          </span>
          <span className={styles.value}>
            {formatValue(value)}
            {total > 0 && `（${formatShare(value, total)}）`}
          </span>
        </li>
      ))}
    </ol>
  );
};
