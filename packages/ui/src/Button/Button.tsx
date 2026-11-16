import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";

import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "danger" | "subtle";

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  skeleton?: boolean;
}

export const Button = ({
  variant = "primary",
  loading = false,
  fullWidth = false,
  icon,
  skeleton = false,
  type = "button",
  disabled,
  className,
  children,
  ...rest
}: ButtonProps): ReactElement => {
  const classNames = [
    styles.button,
    styles[variant],
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading || skeleton}
      data-skeleton={skeleton || undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      {!loading && icon}
      {loading && (
        <svg
          className={styles.spinner}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      )}
      {children}
    </button>
  );
};
