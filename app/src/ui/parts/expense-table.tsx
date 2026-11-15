import {
  Amount,
  Table,
  TableActions,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeaderCell,
  TableRow,
  Toast,
} from "@home-expense/ui";
import type { ReactElement, ReactNode } from "react";
import type { Expenses } from "@/lib/expense";
import { useOptimisticDelete } from "@/lib/hooks/use-optimistic-delete";
import { useSavedHighlight } from "@/lib/hooks/use-saved-highlight";
import { useToast } from "@/lib/hooks/use-toast";
import type { Pagination } from "@/lib/pagination/pagination";
import { deleteExpense, loadExpenseForDelete } from "@/service/expense-service";
import DeleteDialog from "@/ui/parts/delete-dialog";
import savedStyle from "@/ui/parts/saved-row.module.css";

interface Props {
  expenses: Expenses;
  pagination: Pagination;
  onEdit: (id: string) => void;
  footer?: ReactNode;
  loading?: boolean;
  savedId?: string;
}

const ExpenseTable = ({
  expenses,
  pagination,
  onEdit,
  footer,
  loading,
  savedId,
}: Props): ReactElement => {
  const saved = useSavedHighlight(savedId, expenses, (row) => row.description);
  const toast = useToast(saved.notice);
  const {
    rows: optimisticExpenses,
    requestDelete,
    dialogProps,
  } = useOptimisticDelete(expenses, (row) => row.description, toast);
  const { page, perPage } = pagination.current;

  return (
    <>
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
                <TableRow
                  key={id ?? no}
                  id={`row-${id}`}
                  className={
                    saved.highlightedId === id ? savedStyle.saved : undefined
                  }
                >
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
      <Toast notice={toast.notice} />
      <DeleteDialog
        {...dialogProps}
        loadTarget={loadExpenseForDelete}
        title="経費の削除"
        idFieldName="expenseId"
        action={deleteExpense}
      />
    </>
  );
};
export default ExpenseTable;
