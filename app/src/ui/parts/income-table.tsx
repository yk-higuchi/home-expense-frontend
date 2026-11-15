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
  Toast,
} from "@home-expense/ui";
import type { ReactElement, ReactNode } from "react";
import { useOptimisticDelete } from "@/lib/hooks/use-optimistic-delete";
import { useSavedHighlight } from "@/lib/hooks/use-saved-highlight";
import type { Incomes } from "@/lib/income";
import type { Pagination } from "@/lib/pagination/pagination";
import { deleteIncome, loadIncomeForDelete } from "@/service/income-service";
import DeleteDialog from "@/ui/parts/delete-dialog";
import savedStyle from "@/ui/parts/saved-row.module.css";

interface Props {
  incomes: Incomes;
  pagination: Pagination;
  onEdit: (id: string) => void;
  footer?: ReactNode;
  loading?: boolean;
  savedId?: string;
}

const IncomeTable = ({
  incomes,
  pagination,
  onEdit,
  footer,
  loading,
  savedId,
}: Props): ReactElement => {
  const {
    rows: optimisticIncomes,
    error: deleteError,
    requestDelete,
    notice: deleteNotice,
    dialogProps,
  } = useOptimisticDelete(incomes, (row) => row.description);
  const saved = useSavedHighlight(savedId, incomes, (row) => row.description);
  const notice = deleteNotice ?? saved.notice;
  const { page, perPage } = pagination.current;

  return (
    <>
      {deleteError && <ErrorMessage>{deleteError}</ErrorMessage>}
      <Table footer={footer} loading={loading}>
        <TableHead>
          <TableRow>
            <TableHeaderCell width={88}>No.</TableHeaderCell>
            <TableHeaderCell>説明</TableHeaderCell>
            <TableHeaderCell width={128}>金額</TableHeaderCell>
            <TableHeaderCell width={128}>受取日</TableHeaderCell>
            <TableHeaderCell>属性名</TableHeaderCell>
            <TableHeaderCell width={104}>編集</TableHeaderCell>
          </TableRow>
        </TableHead>
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
      <Toast notice={notice} />
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
