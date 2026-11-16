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
}

export const Table = ({
  footer,
  loading = false,
  variant = "default",
  className,
  children,
  ...rest
}: TableProps): ReactElement => (
  <div
    className={cx(
      styles.frame,
      variant === "plain" && styles.plain,
      loading && styles.loading,
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

export interface TableHeaderCellProps
  extends ThHTMLAttributes<HTMLTableCellElement> {
  width?: number | string;
}

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

export const TableCell = ({
  className,
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement>): ReactElement => (
  <td className={cx(styles.cell, className)} {...rest} />
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
