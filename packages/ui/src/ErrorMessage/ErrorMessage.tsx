import type { ReactElement, ReactNode } from "react";

import styles from "./ErrorMessage.module.css";

export interface ErrorMessageProps {
  children: ReactNode;
  className?: string;
}

export const ErrorMessage = ({
  children,
  className,
}: ErrorMessageProps): ReactElement => (
  <p
    className={[styles.errorMessage, className].filter(Boolean).join(" ")}
    role="alert"
  >
    {children}
  </p>
);
