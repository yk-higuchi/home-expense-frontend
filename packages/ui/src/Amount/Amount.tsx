import type { ReactElement } from "react";

import { formatYen } from "../Chart/format";
import styles from "./Amount.module.css";

export interface AmountProps {
  /** 金額（円） */
  value: number;
}

/**
 * 金額の表示。マイナスは「−￥12,000」と赤字にする（色だけに頼らず記号も付ける）
 */
export const Amount = ({ value }: AmountProps): ReactElement => (
  <span className={value < 0 ? styles.negative : styles.amount}>
    {formatYen(value)}
  </span>
);
