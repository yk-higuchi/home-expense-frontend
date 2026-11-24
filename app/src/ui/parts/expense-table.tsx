"use client";

import {
  Amount,
  Table,
  TableActions,
  TableBody,
  TableCell,
  TableEmpty,
  TableRow,
  Toast,
  useToast,
} from "@home-expense/ui";
import { useSearchParams } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import type { Expenses } from "@/core/expense";
import type { Pagination } from "@/core/pagination";
import { deleteExpense, loadExpenseForDelete } from "@/server/actions/expense";
import { useEmptyPageFallback } from "@/ui/hooks/use-empty-page-fallback";
import { useOptimisticDelete } from "@/ui/hooks/use-optimistic-delete";
import { useSavedHighlight } from "@/ui/hooks/use-saved-highlight";
import DeleteDialog from "@/ui/parts/delete-dialog";
import { useListNavigation } from "@/ui/parts/list-frame";
import { usePageTransition } from "@/ui/parts/page-transition";
import savedStyle from "@/ui/parts/saved-row.module.css";
import {
  ColumnsHead,
  EXPENSE_COLUMNS,
  tableProps,
} from "@/ui/parts/table-columns";

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
  const { navigate } = usePageTransition();
  const searchParams = useSearchParams();
  const { isPending: loading } = useListNavigation();
  const onEdit = (id: string): void => {
    navigate(
      `/expense/${id}?${new URLSearchParams({ from: searchParams.toString() })}`,
    );
  };
  const saved = useSavedHighlight(savedId, expenses, (row) => row.description);
  const toast = useToast(saved.notice);
  const {
    rows: optimisticExpenses,
    requestDelete,
    dialogProps,
  } = useOptimisticDelete(
    expenses,
    (row) => row.description,
    toast,
    loadExpenseForDelete,
  );
  const { page, perPage } = pagination.current;
  useEmptyPageFallback("/expense", expenses.length, page);

  return (
    <>
      <Table
        {...tableProps(EXPENSE_COLUMNS)}
        footer={footer}
        loading={loading}
        stickyHeader
      >
        <ColumnsHead columns={EXPENSE_COLUMNS} />
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
                  <TableCell data-mobile="hide">{no}</TableCell>
                  <TableCell data-mobile="title">{description}</TableCell>
                  <TableCell align="end" data-mobile="amount">
                    <Amount value={amount} />
                  </TableCell>
                  <TableCell data-mobile="date">{paymentDate}</TableCell>
                  <TableCell data-mobile="attribute">{attributeName}</TableCell>
                  <TableCell data-mobile="category">{category}</TableCell>
                  <TableCell data-mobile="actions">
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
        title="支出の削除"
        idFieldName="expenseId"
        action={deleteExpense}
      />
    </>
  );
};
export default ExpenseTable;
