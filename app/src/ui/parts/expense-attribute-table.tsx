"use client";

import {
  DragHandle,
  ReorderButtons,
  SortableStatus,
  Table,
  TableActions,
  TableBody,
  TableCell,
  TableEmpty,
  TableRow,
  Toast,
  useSortableList,
  useToast,
} from "@home-expense/ui";
import type { ReactElement } from "react";
import type { ExpenseAttributes } from "@/core/expense-attribute";
import {
  deleteExpenseAttribute,
  loadExpenseAttributeForDelete,
  reorderExpenseAttributes,
} from "@/server/actions/expense-attribute";
import { useOptimisticDelete } from "@/ui/hooks/use-optimistic-delete";
import {
  REORDER_SAVING_NOTICE,
  useOptimisticReorder,
} from "@/ui/hooks/use-optimistic-reorder";
import { useSavedHighlight } from "@/ui/hooks/use-saved-highlight";
import style from "@/ui/parts/attribute-table.module.css";
import DeleteDialog from "@/ui/parts/delete-dialog";
import { useListNavigation } from "@/ui/parts/list-frame";
import { usePageTransition } from "@/ui/parts/page-transition";
import savedStyle from "@/ui/parts/saved-row.module.css";
import {
  ColumnsHead,
  EXPENSE_ATTRIBUTE_COLUMNS,
  tableProps,
} from "@/ui/parts/table-columns";

interface Props {
  category: string;
  expenseAttributes: ExpenseAttributes;
  version: string;
  savedId?: string;
}

const ExpenseAttributeTable = ({
  category,
  expenseAttributes,
  version,
  savedId,
}: Props): ReactElement => {
  const { navigate } = usePageTransition();
  const { isPending: loading } = useListNavigation();
  const onEdit = (id: string): void => {
    navigate(`/expense-attribute/${id}`);
  };
  const saved = useSavedHighlight(
    savedId,
    expenseAttributes,
    (row) => row.name,
  );
  const toast = useToast(saved.notice);
  const reordering = useOptimisticReorder({
    source: expenseAttributes,
    version,
    save: (move) => reorderExpenseAttributes({ category, ...move }),
    onError: toast.error,
    onSuccess: toast.clear,
  });
  const { rows, requestDelete, dialogProps } = useOptimisticDelete(
    reordering.rows,
    (row) => row.name,
    toast,
  );
  const { handleProps, rowProps, canMove, moveBy, announcement } =
    useSortableList({
      items: rows,
      getId: (row) => row.id ?? "",
      getLabel: (row) => row.name,
      onReorder: reordering.reorder,
      disabled: reordering.isPending || loading,
    });

  return (
    <>
      <Table
        {...tableProps(EXPENSE_ATTRIBUTE_COLUMNS)}
        loading={loading}
        stickyHeader
      >
        <ColumnsHead columns={EXPENSE_ATTRIBUTE_COLUMNS} />
        <TableBody>
          {rows.length === 0 && <TableEmpty colSpan={5} />}
          {rows.map((row, index) => (
            <TableRow
              key={row.id ?? index}
              {...rowProps(row)}
              id={`row-${row.id}`}
              className={
                [
                  rowProps(row).className,
                  saved.highlightedId === row.id && savedStyle.saved,
                ]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
            >
              <TableCell>
                <DragHandle {...handleProps(row)} />
              </TableCell>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.category}</TableCell>
              <TableCell>
                <div className={style.actions}>
                  <ReorderButtons
                    label={row.name}
                    onMoveUp={() => moveBy(row, -1)}
                    onMoveDown={() => moveBy(row, 1)}
                    canMoveUp={canMove(row, -1)}
                    canMoveDown={canMove(row, 1)}
                  />
                  {row.id && (
                    <TableActions
                      onEdit={() => onEdit(row.id ?? "")}
                      onDelete={() => requestDelete(row.id ?? null)}
                      editLabel={`${row.name}を編集`}
                      deleteLabel={`${row.name}を削除`}
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <SortableStatus message={announcement} />
      <Toast
        notice={reordering.isPending ? REORDER_SAVING_NOTICE : toast.notice}
      />
      <DeleteDialog
        {...dialogProps}
        loadTarget={loadExpenseAttributeForDelete}
        title="支出属性の削除"
        idFieldName="expenseAttributeId"
        action={deleteExpenseAttribute}
      />
    </>
  );
};
export default ExpenseAttributeTable;
