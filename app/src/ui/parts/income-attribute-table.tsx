import {
  DragHandle,
  ErrorMessage,
  ReorderButtons,
  SortableStatus,
  Table,
  TableActions,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeaderCell,
  TableRow,
  useSortableList,
} from "@home-expense/ui";
import type { ReactElement } from "react";
import { useOptimisticDelete } from "@/lib/hooks/use-optimistic-delete";
import { useOptimisticReorder } from "@/lib/hooks/use-optimistic-reorder";
import type { IncomeAttributes } from "@/lib/income-attribute";
import {
  deleteIncomeAttribute,
  loadIncomeAttributeForDelete,
  reorderIncomeAttributes,
} from "@/service/income-attribute-service";
import style from "@/ui/parts/attribute-table.module.css";
import DeleteDialog from "@/ui/parts/delete-dialog";

interface Props {
  incomeAttributes: IncomeAttributes;
  version: string;
  onEdit: (id: string) => void;
  loading?: boolean;
}

const IncomeAttributeTable = ({
  incomeAttributes,
  version,
  onEdit,
  loading,
}: Props): ReactElement => {
  const reordering = useOptimisticReorder({
    source: incomeAttributes,
    version,
    save: (move) => reorderIncomeAttributes({ ...move }),
  });
  const {
    rows,
    error: deleteError,
    requestDelete,
    dialogProps,
  } = useOptimisticDelete(reordering.rows);
  const { handleProps, rowProps, canMove, moveBy, announcement } =
    useSortableList({
      items: rows,
      getId: (row) => row.id ?? "",
      getLabel: (row) => row.name,
      onReorder: reordering.reorder,
      disabled: reordering.isPending || loading,
    });
  const error = reordering.error ?? deleteError;

  return (
    <>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Table loading={loading}>
        <TableHead>
          <TableRow>
            <TableHeaderCell width={64} aria-label="並べ替え" />
            <TableHeaderCell width={102}>No.</TableHeaderCell>
            <TableHeaderCell>属性名</TableHeaderCell>
            <TableHeaderCell width={146}>操作</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && <TableEmpty colSpan={4} />}
          {rows.map((row, index) => (
            <TableRow key={row.id ?? index} {...rowProps(row)}>
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
