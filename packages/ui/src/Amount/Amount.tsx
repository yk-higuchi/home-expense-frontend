import type { ReactElement } from "react";

import { formatYen } from "../format/format";
import styles from "./Amount.module.css";

export interface AmountProps {
  value: number;
}

export const Amount = ({ value }: AmountProps): ReactElement => (
  <span className={value < 0 ? styles.negative : styles.amount}>
    {formatYen(value)}
  </span>
);
