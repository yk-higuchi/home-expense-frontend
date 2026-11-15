import type { ReactElement, ReactNode } from "react";

import styles from "./Card.module.css";

export interface CardProps {
  title?: string;
  className?: string;
  children: ReactNode;
}

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
