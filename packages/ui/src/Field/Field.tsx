import type { ReactElement, ReactNode } from "react";

import styles from "./Field.module.css";

interface FieldProps {
  id: string;
  label?: string;
  description?: string;
  errorMessage?: string;
  className?: string;
  children: ReactNode;
}

const descriptionId = (id: string): string => `${id}-description`;
const errorId = (id: string): string => `${id}-error`;

export const describedBy = (
  id: string,
  description?: string,
  errorMessage?: string,
): string | undefined =>
  [description && descriptionId(id), errorMessage && errorId(id)]
    .filter(Boolean)
    .join(" ") || undefined;

export const Field = ({
  id,
  label,
  description,
  errorMessage,
  className,
  children,
}: FieldProps): ReactElement => (
  <div className={[styles.field, className].filter(Boolean).join(" ")}>
    {label && (
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
    )}
    {description && (
      <p className={styles.description} id={descriptionId(id)}>
        {description}
      </p>
    )}
    {children}
    {errorMessage && (
      <p className={styles.error} id={errorId(id)}>
        {errorMessage}
      </p>
    )}
  </div>
);

export const controlClassName = styles.control;
