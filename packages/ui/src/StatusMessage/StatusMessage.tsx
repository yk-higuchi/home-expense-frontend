import type { ReactElement, ReactNode } from "react";

import { CheckIcon } from "../icons/icons";
import styles from "./StatusMessage.module.css";

export interface StatusMessageProps {
  children: ReactNode;
}

export const StatusMessage = ({
  children,
}: StatusMessageProps): ReactElement => (
  <p className={styles.statusMessage} role="status">
    <CheckIcon size={20} />
    <span>{children}</span>
  </p>
);
