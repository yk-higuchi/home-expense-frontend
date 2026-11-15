import {
  Amount,
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
import type { Expenses } from "@/lib/expense";
import { useOptimisticDelete } from "@/lib/hooks/use-optimistic-delete";
import type { Pagination } from "@/lib/pagination/pagination";
import { deleteExpense } from "@/service/expense-service";
import DeleteDialog from "@/ui/parts/delete-dialog";

interface Props {
  expenses: Expenses;
  pagination: Pagination;
  onEdit: (id: string) => void;
  footer?: ReactNode;
  loading?: boolean;
}

const ExpenseTable = ({
  expenses,
  pagination,
  onEdit,
  footer,
  loading,
}: Props): ReactElement => {
  const {
    rows: optimisticExpenses,
    error: deleteError,
    requestDelete,
    dialogProps,
  } = useOptimisticDelete(expenses);
  const { page, perPage } = pagination.current;

  return (
    <>
      {deleteError && <ErrorMessage>{deleteError}</ErrorMessage>}
      <Table footer={footer} loading={loading}>
        <TableHead>
          <TableRow>
            <TableHeaderCell width={88}>No.</TableHeaderCell>
            <TableHeaderCell>説明</TableHeaderCell>
            <TableHeaderCell width={112}>金額</TableHeaderCell>
            <TableHeaderCell width={128}>支払日</TableHeaderCell>
            <TableHeaderCell>属性名</TableHeaderCell>
            <TableHeaderCell width={96}>分類</TableHeaderCell>
            <TableHeaderCell width={104}>編集</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {optimisticExpenses.length === 0 && <TableEmpty colSpan={7} />}
          {optimisticExpenses.map(
            (
              { id, description, amount, attributeName, paymentDate, category },
              index,
            ) => {
              const no = index + 1 + (page - 1) * perPage;
              return (
                <TableRow key={id ?? no}>
                  <TableCell>{no}</TableCell>
                  <TableCell>{description}</TableCell>
                  <TableCell>
                    <Amount value={amount} />
                  </TableCell>
                  <TableCell>{paymentDate}</TableCell>
                  <TableCell>{attributeName}</TableCell>
                  <TableCell>{category}</TableCell>
                  <TableCell>
                    {id && (
                      <TableActions
                        onEdit={() => onEdit(id)}
                        onDelete={() => requestDelete(id)}
                        editLabel={`${description}を編集`}
                        deleteLabel={`${description}を削除`}
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            },
          )}
        </TableBody>
      </Table>
      <DeleteDialog
        {...dialogProps}
        title="経費の削除"
        idFieldName="expenseId"
        action={deleteExpense}
      />
    </>
  );
};
export default ExpenseTable;
