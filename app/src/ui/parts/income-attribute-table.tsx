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
import { useOptimisticDelete } from "@/lib/hooks/use-optimistic-delete";
import { useOptimisticReorder } from "@/lib/hooks/use-optimistic-reorder";
import { useSavedHighlight } from "@/lib/hooks/use-saved-highlight";
import type { IncomeAttributes } from "@/lib/income-attribute";
import {
  deleteIncomeAttribute,
  loadIncomeAttributeForDelete,
  reorderIncomeAttributes,
} from "@/service/income-attribute-service";
import style from "@/ui/parts/attribute-table.module.css";
import DeleteDialog from "@/ui/parts/delete-dialog";
import { useListNavigation } from "@/ui/parts/list-frame";
import { usePageTransition } from "@/ui/parts/page-transition";
import savedStyle from "@/ui/parts/saved-row.module.css";
import {
  ColumnsHead,
  INCOME_ATTRIBUTE_COLUMNS,
} from "@/ui/parts/table-columns";

interface Props {
  incomeAttributes: IncomeAttributes;
  version: string;
  savedId?: string;
}

const IncomeAttributeTable = ({
  incomeAttributes,
  version,
  savedId,
}: Props): ReactElement => {
  const { navigate } = usePageTransition();
  const { isPending: loading } = useListNavigation();
  const onEdit = (id: string): void => {
    navigate(`/income-attribute/${id}`);
  };
  const saved = useSavedHighlight(savedId, incomeAttributes, (row) => row.name);
  const toast = useToast(saved.notice);
  const reordering = useOptimisticReorder({
    source: incomeAttributes,
    version,
    save: (move) => reorderIncomeAttributes({ ...move }),
    onError: toast.error,
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
      <Table loading={loading}>
        <ColumnsHead columns={INCOME_ATTRIBUTE_COLUMNS} />
        <TableBody>
          {rows.length === 0 && <TableEmpty colSpan={4} />}
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
      <Toast notice={toast.notice} />
      <DeleteDialog
        {...dialogProps}
        loadTarget={loadIncomeAttributeForDelete}
        title="収入属性の削除"
        idFieldName="incomeAttributeId"
        action={deleteIncomeAttribute}
      />
    </>
  );
};
export default IncomeAttributeTable;
