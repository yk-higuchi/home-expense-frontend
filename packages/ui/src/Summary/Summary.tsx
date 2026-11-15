import type { ReactElement, ReactNode } from "react";

import styles from "./Summary.module.css";

export interface SummaryRowProps {
  /** 項目名（例: 収入合計） */
  label: string;
  /** 金額。省略すると「内訳」などの見出しとして使う */
  amount?: ReactNode;
}

/**
 * 合計行（下に水色の線）
 *
 * Figma: コンポーネント / 合計行
 */
export const SummaryRow = ({ label, amount }: SummaryRowProps): ReactElement =>
  amount === undefined ? (
    <h2 className={styles.summaryRow}>{label}</h2>
  ) : (
    <div className={styles.summaryRow}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.amount}>{amount}</dd>
    </div>
  );

/** 合計行をまとめる（<dl> で項目名と金額を対応づける） */
export const SummaryList = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => <dl className={styles.summaryList}>{children}</dl>;

/**
 * 内訳のカード（内訳グループを並べる）
 *
 * Figma: 画面 / HOME の「内訳ツリー」
 */
export const Breakdown = ({
  className,
  children,
}: {
  /** 高さやスクロールなど、置き場所に合わせた指定を足すとき */
  className?: string;
  children: ReactNode;
}): ReactElement => (
  <div className={[styles.breakdown, className].filter(Boolean).join(" ")}>
    {children}
  </div>
);

export interface BreakdownGroupProps {
  /** 分類名（例: 固定費） */
  label: string;
  /** 小計 */
  amount: ReactNode;
  /** 最初から開いておくか */
  defaultOpen?: boolean;
  /** 内訳行（BreakdownItem） */
  children?: ReactNode;
}

/**
 * 内訳の分類見出しと小計。クリックやキーボードで開閉できる
 *
 * Figma: コンポーネント / 内訳グループ見出し（状態=開 / 閉）
 */
export const BreakdownGroup = ({
  label,
  amount,
  defaultOpen = true,
  children,
}: BreakdownGroupProps): ReactElement => (
  <details className={styles.group} open={defaultOpen}>
    <summary className={styles.groupHeader}>
      {/* Figma: アイコン/右向き（開いているときは下向きに回す） */}
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
  /** 属性名（例: 家賃） */
  name: string;
  amount: ReactNode;
}

/**
 * 内訳の行（属性ごとの金額）
 *
 * Figma: コンポーネント / 内訳行
 */
export const BreakdownItem = ({
  name,
  amount,
}: BreakdownItemProps): ReactElement => (
  <div className={styles.item}>
    <dt className={styles.itemName}>{name}</dt>
    <dd className={styles.amount}>{amount}</dd>
  </div>
);
