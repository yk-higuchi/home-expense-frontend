import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@home-expense/ui";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import style from "@/ui/parts/table-columns.module.css";

interface Column {
  label?: string;
  ariaLabel?: string;
  width?: number | string;
  minWidth?: number;
  align?: "start" | "end";
  kind?: "text" | "action";
}

const FLEX_MIN_WIDTH = 100;
const HANDLE_WIDTH = "var(--handle-width)";
const ROW_ACTIONS_WIDTH = "var(--row-actions-width)";
const REORDER_ACTIONS_WIDTH = "var(--reorder-actions-width)";

export const EXPENSE_COLUMNS: readonly Column[] = [
  { label: "No.", width: 72 },
  { label: "説明" },
  { label: "金額", width: 128, align: "end" },
  { label: "支払日", width: 120 },
  { label: "属性名" },
  { label: "分類", width: 96 },
  { label: "編集", width: ROW_ACTIONS_WIDTH, kind: "action" },
];

export const INCOME_COLUMNS: readonly Column[] = [
  { label: "No.", width: 72 },
  { label: "説明" },
  { label: "金額", width: 128, align: "end" },
  { label: "受取日", width: 120 },
  { label: "属性名" },
  { label: "編集", width: ROW_ACTIONS_WIDTH, kind: "action" },
];

export const EXPENSE_ATTRIBUTE_COLUMNS: readonly Column[] = [
  { ariaLabel: "並べ替え", width: HANDLE_WIDTH, kind: "action" },
  { label: "No.", width: 72 },
  { label: "属性名" },
  { label: "分類", width: 96 },
  { label: "操作", width: REORDER_ACTIONS_WIDTH, kind: "action" },
];

export const INCOME_ATTRIBUTE_COLUMNS: readonly Column[] = [
  { ariaLabel: "並べ替え", width: HANDLE_WIDTH, kind: "action" },
  { label: "No.", width: 72 },
  { label: "属性名" },
  { label: "操作", width: REORDER_ACTIONS_WIDTH, kind: "action" },
];

export const ANNUAL_COLUMNS: readonly Column[] = [
  { label: "月", width: 80 },
  { label: "収入", align: "end", minWidth: 128 },
  { label: "支出", align: "end", minWidth: 128 },
  { label: "収支", align: "end", minWidth: 128 },
];

export const tableProps = (
  columns: readonly Column[],
): { className: string; style: CSSProperties } => {
  const fixed = columns.reduce(
    (sum, column) =>
      typeof column.width === "number"
        ? sum + column.width
        : column.width === undefined
          ? sum + (column.minWidth ?? FLEX_MIN_WIDTH)
          : sum,
    0,
  );
  const variables = columns.flatMap((column) =>
    typeof column.width === "string" ? [column.width] : [],
  );
  return {
    className: style.table,
    style: {
      "--table-min-width": `calc(${[`${fixed}px`, ...variables].join(" + ")})`,
    } as CSSProperties,
  };
};

export const ColumnsHead = ({
  columns,
}: {
  columns: readonly Column[];
}): ReactElement => (
  <TableHead>
    <TableRow>
      {columns.map((column, index) => (
        <TableHeaderCell
          // biome-ignore lint/suspicious/noArrayIndexKey: 列の並びは固定
          key={index}
          width={column.width}
          align={column.align}
          aria-label={column.ariaLabel}
        >
          {column.label}
        </TableHeaderCell>
      ))}
    </TableRow>
  </TableHead>
);

export const SkeletonTable = ({
  columns,
  rows = 5,
}: {
  columns: readonly Column[];
  rows?: number;
}): ReactElement => (
  <Table {...tableProps(columns)}>
    <ColumnsHead columns={columns} />
    <TableBody>
      {Array.from({ length: rows }, (_, row) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 中身のない行
        <TableRow key={row}>
          {columns.map((column, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 列の並びは固定
            <TableCell key={index} align={column.align}>
              {column.kind !== "action" && <Skeleton />}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export const ErrorTable = ({
  columns,
  children,
}: {
  columns: readonly Column[];
  children: ReactNode;
}): ReactElement => (
  <Table {...tableProps(columns)}>
    <ColumnsHead columns={columns} />
    <TableBody>
      <TableRow>
        <TableCell colSpan={columns.length}>{children}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);
