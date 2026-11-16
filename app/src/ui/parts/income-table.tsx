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
import { useEmptyPageFallback } from "@/lib/hooks/use-empty-page-fallback";
import { useOptimisticDelete } from "@/lib/hooks/use-optimistic-delete";
import { useSavedHighlight } from "@/lib/hooks/use-saved-highlight";
import type { Incomes } from "@/lib/income";
import type { Pagination } from "@/lib/pagination/pagination";
import { deleteIncome, loadIncomeForDelete } from "@/service/income-service";
import DeleteDialog from "@/ui/parts/delete-dialog";
import { useListNavigation } from "@/ui/parts/list-frame";
import { usePageTransition } from "@/ui/parts/page-transition";
import savedStyle from "@/ui/parts/saved-row.module.css";
import { ColumnsHead, INCOME_COLUMNS } from "@/ui/parts/table-columns";

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
  } = useOptimisticDelete(incomes, (row) => row.description, toast);
  const { page, perPage } = pagination.current;
  useEmptyPageFallback("/income", incomes.length, page);

  return (
    <>
      <Table footer={footer} loading={loading}>
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
                  <TableCell>{no}</TableCell>
                  <TableCell>{description}</TableCell>
                  <TableCell>
                    <Amount value={amount} />
                  </TableCell>
                  <TableCell>{receiveDate}</TableCell>
                  <TableCell>{attributeName}</TableCell>
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
        loadTarget={loadIncomeForDelete}
        title="収入の削除"
        idFieldName="incomeId"
        action={deleteIncome}
      />
    </>
  );
};
export default IncomeTable;
