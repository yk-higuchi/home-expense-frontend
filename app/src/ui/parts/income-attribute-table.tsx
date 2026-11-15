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
import { useOptimisticDelete } from "@/lib/hooks/use-optimistic-delete";
import type { IncomeAttributes } from "@/lib/income-attribute";
import type { Pagination } from "@/lib/pagination/pagination";
import { deleteIncomeAttribute } from "@/service/income-attribute-service";
import DeleteDialog from "@/ui/parts/delete-dialog";

interface Props {
  incomeAttributes: IncomeAttributes;
  pagination: Pagination;
  onEdit: (id: string) => void;
  /** 表の枠の内側・下に置く要素（ページネーション） */
  footer?: ReactNode;
  /** 絞り込み・ページ送りの切り替え中 */
  loading?: boolean;
}

const IncomeAttributeTable = ({
  incomeAttributes,
  pagination,
  onEdit,
  footer,
  loading,
}: Props): ReactElement => {
  const {
    rows: optimisticIncomeAttributes,
    error: deleteError,
    requestDelete,
    dialogProps,
  } = useOptimisticDelete(incomeAttributes);
  const { page, perPage } = pagination.current;

  return (
    <>
      {deleteError && <ErrorMessage>{deleteError}</ErrorMessage>}
      <Table footer={footer} loading={loading}>
        <TableHead>
          <TableRow>
            <TableHeaderCell width={102}>No.</TableHeaderCell>
            <TableHeaderCell>属性名</TableHeaderCell>
            <TableHeaderCell width={104}>編集</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {optimisticIncomeAttributes.length === 0 && (
            <TableEmpty colSpan={3} />
          )}
          {optimisticIncomeAttributes.map(({ id, name }, index) => {
            const no = index + 1 + (page - 1) * perPage;
            return (
              <TableRow key={id ?? no}>
                <TableCell>{no}</TableCell>
                <TableCell>{name}</TableCell>
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
        title="収入属性の削除"
        idFieldName="incomeAttributeId"
        action={deleteIncomeAttribute}
      />
    </>
  );
};
export default IncomeAttributeTable;
