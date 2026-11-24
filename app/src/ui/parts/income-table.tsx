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
import type { Incomes } from "@/core/income";
import type { Pagination } from "@/core/pagination";
import { deleteIncome, loadIncomeForDelete } from "@/server/actions/income";
import { useEmptyPageFallback } from "@/ui/hooks/use-empty-page-fallback";
import { useOptimisticDelete } from "@/ui/hooks/use-optimistic-delete";
import { useSavedHighlight } from "@/ui/hooks/use-saved-highlight";
import DeleteDialog from "@/ui/parts/delete-dialog";
import { useListNavigation } from "@/ui/parts/list-frame";
import { usePageTransition } from "@/ui/parts/page-transition";
import savedStyle from "@/ui/parts/saved-row.module.css";
import {
  ColumnsHead,
  INCOME_COLUMNS,
  tableProps,
} from "@/ui/parts/table-columns";

interface Props {
  incomes: Incomes;
  pagination: Pagination;
  footer?: ReactNode;
  savedId?: string;
}

const IncomeTable = ({
  incomes,
  pagination,
  footer,
  savedId,
}: Props): ReactElement => {
  const { navigate } = usePageTransition();
  const searchParams = useSearchParams();
  const { isPending: loading } = useListNavigation();
  const onEdit = (id: string): void => {
    navigate(
      `/income/${id}?${new URLSearchParams({ from: searchParams.toString() })}`,
    );
  };
  const saved = useSavedHighlight(savedId, incomes, (row) => row.description);
  const toast = useToast(saved.notice);
  const {
    rows: optimisticIncomes,
    requestDelete,
    dialogProps,
  } = useOptimisticDelete(
    incomes,
    (row) => row.description,
    toast,
    loadIncomeForDelete,
  );
  const { page, perPage } = pagination.current;
  useEmptyPageFallback("/income", incomes.length, page);

  return (
    <>
      <Table
        {...tableProps(INCOME_COLUMNS)}
        footer={footer}
        loading={loading}
        stickyHeader
      >
        <ColumnsHead columns={INCOME_COLUMNS} />
        <TableBody>
          {optimisticIncomes.length === 0 && <TableEmpty colSpan={6} />}
          {optimisticIncomes.map(
            (
              { id, description, amount, attributeName, receiveDate },
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
                  <TableCell data-mobile="date">{receiveDate}</TableCell>
                  <TableCell data-mobile="attribute">{attributeName}</TableCell>
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
        title="収入の削除"
        idFieldName="incomeId"
        action={deleteIncome}
      />
    </>
  );
};
export default IncomeTable;
