import type { ReactElement, ReactNode } from "react";

import styles from "./Card.module.css";

export interface CardProps {
  /** カードの見出し（例: 月別の推移） */
  title?: string;
  className?: string;
  children: ReactNode;
}

/**
 * 白いカード（Figma: 推移グラフ・内訳ツリー・月別一覧の外枠）
 */
export const Card = ({
  title,
  className,
  children,
}: CardProps): ReactElement => (
  <section className={[styles.card, className].filter(Boolean).join(" ")}>
    {title && <h2 className={styles.title}>{title}</h2>}
    {children}
  </section>
);
