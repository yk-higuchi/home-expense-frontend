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
import type { Expenses } from "@/lib/expense";
import type { Pagination } from "@/lib/pagination/pagination";
import { deleteExpense } from "@/service/expense-service";
import DeleteDialog from "@/ui/parts/delete-dialog";

interface Props {
  expenses: Expenses;
  pagination: Pagination;
  onEdit: (id: string) => void;
  /** 表の枠の内側・下に置く要素（ページネーション） */
  footer?: ReactNode;
}

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
});

const ExpenseTable = ({
  expenses,
  pagination,
  onEdit,
  footer,
}: Props): ReactElement => {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { page, perPage } = pagination.current;

  return (
    <>
      <Table footer={footer}>
        <TableHead>
          <TableRow>
            <TableHeaderCell width={56}>#</TableHeaderCell>
            <TableHeaderCell>説明</TableHeaderCell>
            <TableHeaderCell width={112}>金額</TableHeaderCell>
            <TableHeaderCell width={128}>支払日</TableHeaderCell>
            <TableHeaderCell>属性名</TableHeaderCell>
            <TableHeaderCell width={96}>分類</TableHeaderCell>
            <TableHeaderCell width={104}>編集</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses.length === 0 && <TableEmpty colSpan={7} />}
          {expenses.map(
            (
              { id, description, price, attributeName, paymentDate, category },
              index,
            ) => {
              const no = index + 1 + (page - 1) * perPage;
              return (
                <TableRow key={id ?? no}>
                  <TableCell>{no}</TableCell>
                  <TableCell>{description}</TableCell>
                  <TableCell>{yen.format(price)}</TableCell>
                  <TableCell>{paymentDate}</TableCell>
                  <TableCell>{attributeName}</TableCell>
                  <TableCell>{category}</TableCell>
                  <TableCell>
                    {id && (
                      <TableActions
                        onEdit={() => onEdit(id)}
                        onDelete={() => setDeleteTargetId(id)}
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
        targetId={deleteTargetId}
        title="経費の削除"
        idFieldName="expenseId"
        action={deleteExpense}
        onClose={() => setDeleteTargetId(null)}
      />
    </>
  );
};
export default ExpenseTable;
