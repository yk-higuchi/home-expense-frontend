import {
  ErrorMessage,
  Table,
  TableActions,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@home-expense/ui";
import type { ReactElement, ReactNode } from "react";
import type { ExpenseAttributes } from "@/lib/expense-attribute";
import { useOptimisticDelete } from "@/lib/hooks/use-optimistic-delete";
import type { Pagination } from "@/lib/pagination/pagination";
import { deleteExpenseAttribute } from "@/service/expense-attribute-service";
import DeleteDialog from "@/ui/parts/delete-dialog";

interface Props {
  expenseAttributes: ExpenseAttributes;
  pagination: Pagination;
  onEdit: (id: string) => void;
  footer?: ReactNode;
  loading?: boolean;
}

const ExpenseAttributeTable = ({
  expenseAttributes,
  pagination,
  onEdit,
  footer,
  loading,
}: Props): ReactElement => {
  const {
    rows: optimisticExpenseAttributes,
    error: deleteError,
    requestDelete,
    dialogProps,
  } = useOptimisticDelete(expenseAttributes);
  const { page, perPage } = pagination.current;

  return (
    <>
      {deleteError && <ErrorMessage>{deleteError}</ErrorMessage>}
      <Table footer={footer} loading={loading}>
        <TableHead>
          <TableRow>
            <TableHeaderCell width={102}>No.</TableHeaderCell>
            <TableHeaderCell>属性名</TableHeaderCell>
            <TableHeaderCell width={200}>分類</TableHeaderCell>
            <TableHeaderCell width={104}>編集</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {optimisticExpenseAttributes.length === 0 && (
            <TableEmpty colSpan={4} />
          )}
          {optimisticExpenseAttributes.map(({ id, name, category }, index) => {
            const no = index + 1 + (page - 1) * perPage;
            return (
              <TableRow key={id ?? no}>
                <TableCell>{no}</TableCell>
                <TableCell>{name}</TableCell>
                <TableCell>{category}</TableCell>
                <TableCell>
                  {id && (
                    <TableActions
                      onEdit={() => onEdit(id)}
                      onDelete={() => requestDelete(id)}
                      editLabel={`${name}を編集`}
                      deleteLabel={`${name}を削除`}
                    />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <DeleteDialog
        {...dialogProps}
        title="経費属性の削除"
        idFieldName="expenseAttributeId"
        action={deleteExpenseAttribute}
      />
    </>
  );
};
export default ExpenseAttributeTable;
