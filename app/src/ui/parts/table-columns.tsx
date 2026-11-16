import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@home-expense/ui";
import type { ReactElement, ReactNode } from "react";

interface Column {
  label?: string;
  ariaLabel?: string;
  width?: number;
  align?: "start" | "end";
  kind?: "text" | "action";
}

export const EXPENSE_COLUMNS: readonly Column[] = [
  { label: "No.", width: 88 },
  { label: "説明" },
  { label: "金額", width: 112, align: "end" },
  { label: "支払日", width: 128 },
  { label: "属性名" },
  { label: "分類", width: 96 },
  { label: "編集", width: 104, kind: "action" },
];

export const INCOME_COLUMNS: readonly Column[] = [
  { label: "No.", width: 88 },
  { label: "説明" },
  { label: "金額", width: 128, align: "end" },
  { label: "受取日", width: 128 },
  { label: "属性名" },
  { label: "編集", width: 104, kind: "action" },
];

export const EXPENSE_ATTRIBUTE_COLUMNS: readonly Column[] = [
  { ariaLabel: "並べ替え", width: 64, kind: "action" },
  { label: "No.", width: 102 },
  { label: "属性名" },
  { label: "分類", width: 200 },
  { label: "操作", width: 146, kind: "action" },
];

export const INCOME_ATTRIBUTE_COLUMNS: readonly Column[] = [
  { ariaLabel: "並べ替え", width: 64, kind: "action" },
  { label: "No.", width: 102 },
  { label: "属性名" },
  { label: "操作", width: 146, kind: "action" },
];

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
  <Table>
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
  <Table>
    <ColumnsHead columns={columns} />
    <TableBody>
      <TableRow>
        <TableCell colSpan={columns.length}>{children}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);
