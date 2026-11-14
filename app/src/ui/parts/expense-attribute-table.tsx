import {
  Table,
  TableActions,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@home-expense/ui";
import { type ReactElement, type ReactNode, useState } from "react";
import type { ExpenseAttributes } from "@/lib/expense-attribute";
import type { Pagination } from "@/lib/pagination/pagination";
import { deleteExpenseAttribute } from "@/service/expense-attribute-service";
import DeleteDialog from "@/ui/parts/delete-dialog";

interface Props {
  expenseAttributes: ExpenseAttributes;
  pagination: Pagination;
  onEdit: (id: string) => void;
  /** 表の枠の内側・下に置く要素（ページネーション） */
  footer?: ReactNode;
  /** 絞り込み・ページ送りの切り替え中 */
  loading?: boolean;
}

const ExpenseAttributeTable = ({
  expenseAttributes,
  pagination,
  onEdit,
  footer,
  loading,
}: Props): ReactElement => {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { page, perPage } = pagination.current;

  return (
    <>
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
          {expenseAttributes.length === 0 && <TableEmpty colSpan={4} />}
          {expenseAttributes.map(({ id, name, category }, index) => {
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
                      onDelete={() => setDeleteTargetId(id)}
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
        targetId={deleteTargetId}
        title="経費属性の削除"
        idFieldName="expenseAttributeId"
        action={deleteExpenseAttribute}
        onClose={() => setDeleteTargetId(null)}
      />
    </>
  );
};
export default ExpenseAttributeTable;
