import type {
  ComponentPropsWithRef,
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
  footer?: ReactNode;
  loading?: boolean;
  variant?: "default" | "plain";
  stickyHeader?: boolean;
}

export const Table = ({
  footer,
  loading = false,
  variant = "default",
  stickyHeader = false,
  className,
  children,
  ...rest
}: TableProps): ReactElement => (
  <div
    className={cx(
      styles.frame,
      variant === "plain" && styles.plain,
      loading && styles.loading,
      stickyHeader && styles.stickyHeader,
    )}
  >
    <section
      className={styles.scroll}
      aria-label={rest["aria-label"] ?? "表"}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: 狭い画面で横にスクロールする領域を、キーボードでもスクロールできるようにする
      tabIndex={0}
    >
      <table
        className={cx(styles.table, className)}
        aria-busy={loading || undefined}
        {...rest}
      >
        {children}
      </table>
    </section>
    {footer && <div className={styles.footer}>{footer}</div>}
  </div>
);

export const TableHead = (
  props: HTMLAttributes<HTMLTableSectionElement>,
): ReactElement => <thead {...props} />;

export const TableBody = (
  props: HTMLAttributes<HTMLTableSectionElement>,
): ReactElement => <tbody {...props} />;

export const TableRow = (props: ComponentPropsWithRef<"tr">): ReactElement => (
  <tr {...props} />
);

type TableCellAlign = "start" | "end";

export interface TableHeaderCellProps
  extends Omit<ThHTMLAttributes<HTMLTableCellElement>, "align"> {
  width?: number | string;
  align?: TableCellAlign;
}

export const TableHeaderCell = ({
  width,
  align = "start",
  className,
  style,
  scope = "col",
  ...rest
}: TableHeaderCellProps): ReactElement => (
  <th
    scope={scope}
    className={cx(
      styles.cell,
      styles.headerCell,
      align === "end" && styles.end,
      className,
    )}
    style={{ width, ...style }}
    {...rest}
  />
);

export interface TableCellProps
  extends Omit<TdHTMLAttributes<HTMLTableCellElement>, "align"> {
  align?: TableCellAlign;
}

export const TableCell = ({
  align = "start",
  className,
  ...rest
}: TableCellProps): ReactElement => (
  <td
    className={cx(styles.cell, align === "end" && styles.end, className)}
    {...rest}
  />
);

export interface TableEmptyProps {
  colSpan: number;
  children?: ReactNode;
}

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
