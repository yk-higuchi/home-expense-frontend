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
import { type ReactElement, useState } from "react";
import type { Expenses } from "@/lib/expense";
import { useDialog } from "@/lib/hooks/dialog";
import type { Pagination } from "@/lib/pagination/pagination";
import { deleteExpense } from "@/service/expense-service";
import Dialog from "@/ui/parts/dialog";

interface Props {
  expenses: Expenses;
  pagination: Pagination;
  onEdit: (id: string) => void;
}

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
});

const ExpenseTable = ({
  expenses,
  pagination,
  onEdit,
}: Props): ReactElement => {
  const { ref, onOpen, onClose } = useDialog();
  const [expenseId, setExpenseId] = useState("");
  const { page, perPage } = pagination.current;

  const handleDelete = (id: string): void => {
    setExpenseId(id);
    onOpen();
  };

  return (
    <>
      <Table>
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
                        onDelete={() => handleDelete(id)}
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
      <Dialog ref={ref} onClick={onClose}>
        <form action={deleteExpense}>
          <h2>経費の削除</h2>
          <p>削除したデータは復元できません。削除しますか？</p>
          <input type="hidden" name="expenseId" value={expenseId} />
          <button type="button" onClick={onClose}>
            キャンセル
          </button>
          <button type="submit" onClick={onClose}>
            削除
          </button>
        </form>
      </Dialog>
    </>
  );
};
export default ExpenseTable;
