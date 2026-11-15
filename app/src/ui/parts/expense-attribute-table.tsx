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
import {
  type ReactElement,
  type ReactNode,
  useOptimistic,
  useState,
} from "react";
import type { ExpenseAttributes } from "@/lib/expense-attribute";
import type { Pagination } from "@/lib/pagination/pagination";
import { deleteExpenseAttribute } from "@/service/expense-attribute-service";
import DeleteDialog from "@/ui/parts/delete-dialog";
import message from "@/ui/parts/message.module.css";

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
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // 削除を確定した行は、サーバーの処理を待たずに表から消す（失敗したら自動で戻る）
  const [optimisticExpenseAttributes, removeOptimistic] = useOptimistic(
    expenseAttributes,
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
            <TableHeaderCell width={102}>No.</TableHeaderCell>
            <TableHeaderCell>属性名</TableHeaderCell>
            <TableHeaderCell width={200}>分類</TableHeaderCell>
            <TableHeaderCell width={104}>編集</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {optimisticExpenseAttributes.length === 0 && (
            <TableEmpty colSpan={4} />
          )}
          {optimisticExpenseAttributes.map(({ id, name, category }, index) => {
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
        targetVersion={
          expenseAttributes.find((row) => row.id === deleteTargetId)?.version
        }
        title="経費属性の削除"
        idFieldName="expenseAttributeId"
        action={deleteExpenseAttribute}
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
export default ExpenseAttributeTable;
