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
} from "@home-expense/ui";
import {
  type ReactElement,
  type ReactNode,
  useOptimistic,
  useState,
} from "react";
import type { Expenses } from "@/lib/expense";
import type { Pagination } from "@/lib/pagination/pagination";
import { deleteExpense } from "@/service/expense-service";
import DeleteDialog from "@/ui/parts/delete-dialog";
import message from "@/ui/parts/message.module.css";

interface Props {
  expenses: Expenses;
  pagination: Pagination;
  onEdit: (id: string) => void;
  /** 表の枠の内側・下に置く要素（ページネーション） */
  footer?: ReactNode;
  /** 絞り込み・ページ送りの切り替え中 */
  loading?: boolean;
}

const ExpenseTable = ({
  expenses,
  pagination,
  onEdit,
  footer,
  loading,
}: Props): ReactElement => {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // 削除を確定した行は、サーバーの処理を待たずに表から消す（失敗したら自動で戻る）
  const [optimisticExpenses, removeOptimistic] = useOptimistic(
    expenses,
    (state, id: string) => state.filter((row) => row.id !== id),
  );
  const { page, perPage } = pagination.current;

  return (
    <>
      {deleteError && (
        <p className={message.error} role="alert">
          {deleteError}
        </p>
      )}
      <Table footer={footer} loading={loading}>
        <TableHead>
          <TableRow>
            {/* 通し番号は 5 桁（99999）まで収まる幅 */}
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
                <TableRow key={id ?? no}>
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
        targetVersion={
          expenses.find((row) => row.id === deleteTargetId)?.version
        }
        title="経費の削除"
        idFieldName="expenseId"
        action={deleteExpense}
        onDeleteStart={(id) => {
          setDeleteError(null);
          removeOptimistic(id);
        }}
        onDeleteFailed={setDeleteError}
        onClose={() => setDeleteTargetId(null)}
      />
    </>
  );
};
export default ExpenseTable;
