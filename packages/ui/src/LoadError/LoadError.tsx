import type { ReactElement, ReactNode } from "react";

import { WarningIcon } from "../icons/icons";
import styles from "./LoadError.module.css";

export interface LoadErrorProps {
  message?: string;
  action?: ReactNode;
  className?: string;
}

export const LoadError = ({
  message = "読み込めませんでした。時間をおいてもう一度お試しください。",
  action,
  className,
}: LoadErrorProps): ReactElement => (
  <div
    className={[styles.loadError, className].filter(Boolean).join(" ")}
    role="alert"
  >
    <WarningIcon size={32} />
    <p className={styles.message}>{message}</p>
    {action}
  </div>
);
