import type {
  HTMLAttributes,
  ReactElement,
  ReactNode,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

import styles from "./Table.module.css";

const cx = (...names: (string | false | undefined)[]): string =>
  names.filter(Boolean).join(" ");

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** 表の下（枠の内側）に置く要素。ページネーションなど */
  footer?: ReactNode;
}

/**
 * 表
 *
 * Figma: コンポーネント / テーブル（外枠 1px・角丸 8px、行の間は横線のみ）
 */
export const Table = ({
  footer,
  className,
  children,
  ...rest
}: TableProps): ReactElement => (
  <div className={styles.frame}>
    <table className={cx(styles.table, className)} {...rest}>
      {children}
    </table>
    {footer && <div className={styles.footer}>{footer}</div>}
  </div>
);

export const TableHead = (
  props: HTMLAttributes<HTMLTableSectionElement>,
): ReactElement => <thead {...props} />;

export const TableBody = (
  props: HTMLAttributes<HTMLTableSectionElement>,
): ReactElement => <tbody {...props} />;

export const TableRow = (
  props: HTMLAttributes<HTMLTableRowElement>,
): ReactElement => <tr {...props} />;

export interface TableHeaderCellProps
  extends ThHTMLAttributes<HTMLTableCellElement> {
  /** 列の幅（px や % など）。省略すると残りの幅を分け合う */
  width?: number | string;
}

/** 見出しセル（Figma: テーブルセル 種類=見出し） */
export const TableHeaderCell = ({
  width,
  className,
  style,
  scope = "col",
  ...rest
}: TableHeaderCellProps): ReactElement => (
  <th
    scope={scope}
    className={cx(styles.cell, styles.headerCell, className)}
    style={{ width, ...style }}
    {...rest}
  />
);

/** データセル（Figma: テーブルセル 種類=データ） */
export const TableCell = ({
  className,
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement>): ReactElement => (
  <td className={cx(styles.cell, className)} {...rest} />
);

export interface TableEmptyProps {
  /** 表の列数（セルを横いっぱいに広げるため） */
  colSpan: number;
  children?: ReactNode;
}

/** データが 0 件のときの行（Figma: 空のテーブル行） */
export const TableEmpty = ({
  colSpan,
  children = "データがありません",
}: TableEmptyProps): ReactElement => (
  <tr>
    <td className={cx(styles.cell, styles.empty)} colSpan={colSpan}>
      {children}
    </td>
  </tr>
);
