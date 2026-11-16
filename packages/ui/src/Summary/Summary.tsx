import type { ReactElement, ReactNode } from "react";

import styles from "./Summary.module.css";

export interface SummaryRowProps {
  label: string;
  amount?: ReactNode;
}

export const SummaryRow = ({ label, amount }: SummaryRowProps): ReactElement =>
  amount === undefined ? (
    <h2 className={styles.summaryRow}>{label}</h2>
  ) : (
    <div className={styles.summaryRow}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.amount}>{amount}</dd>
    </div>
  );

export const SummaryList = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => <dl className={styles.summaryList}>{children}</dl>;

export const Breakdown = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}): ReactElement => (
  <div className={[styles.breakdown, className].filter(Boolean).join(" ")}>
    {children}
  </div>
);

export interface BreakdownGroupProps {
  label: string;
  amount: ReactNode;
  defaultOpen?: boolean;
  children?: ReactNode;
}

export const BreakdownGroup = ({
  label,
  amount,
  defaultOpen = true,
  children,
}: BreakdownGroupProps): ReactElement => (
  <details className={styles.group} open={defaultOpen}>
    <summary className={styles.groupHeader}>
      <svg
        className={styles.chevron}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
      <span className={styles.groupLabel}>{label}</span>
      <span className={styles.amount}>{amount}</span>
    </summary>
    <dl className={styles.items}>{children}</dl>
  </details>
);

export interface BreakdownItemProps {
  name: string;
  amount: ReactNode;
}

export const BreakdownItem = ({
  name,
  amount,
}: BreakdownItemProps): ReactElement => (
  <div className={styles.item}>
    <dt className={styles.itemName}>{name}</dt>
    <dd className={styles.amount}>{amount}</dd>
  </div>
);
