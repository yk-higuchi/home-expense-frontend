"use client";

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
  useToast,
} from "@home-expense/ui";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import type { Expenses } from "@/lib/expense";
import { useEmptyPageFallback } from "@/lib/hooks/use-empty-page-fallback";
import { useOptimisticDelete } from "@/lib/hooks/use-optimistic-delete";
import { useSavedHighlight } from "@/lib/hooks/use-saved-highlight";
import type { Pagination } from "@/lib/pagination/pagination";
import { deleteExpense, loadExpenseForDelete } from "@/service/expense-service";
import DeleteDialog from "@/ui/parts/delete-dialog";
import { useListNavigation } from "@/ui/parts/list-frame";
import savedStyle from "@/ui/parts/saved-row.module.css";

interface Props {
  expenses: Expenses;
  pagination: Pagination;
  footer?: ReactNode;
  savedId?: string;
}

const ExpenseTable = ({
  expenses,
  pagination,
  footer,
  savedId,
}: Props): ReactElement => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isPending: loading } = useListNavigation();
  const onEdit = (id: string): void => {
    router.push(
      `/expense/${id}?${new URLSearchParams({ from: searchParams.toString() })}`,
    );
  };
  const saved = useSavedHighlight(savedId, expenses, (row) => row.description);
  const toast = useToast(saved.notice);
  const {
    rows: optimisticExpenses,
    requestDelete,
    dialogProps,
  } = useOptimisticDelete(expenses, (row) => row.description, toast);
  const { page, perPage } = pagination.current;
  useEmptyPageFallback("/expense", expenses.length, page);

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
        title="支出の削除"
        idFieldName="expenseId"
        action={deleteExpense}
      />
    </>
  );
};
export default ExpenseTable;
