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
import { useDialog } from "@/lib/hooks/dialog";
import type { Incomes } from "@/lib/income";
import type { Pagination } from "@/lib/pagination/pagination";
import { deleteIncome } from "@/service/income-service";
import Dialog from "@/ui/parts/dialog";

interface Props {
  incomes: Incomes;
  pagination: Pagination;
  onEdit: (id: string) => void;
  /** 表の枠の内側・下に置く要素（ページネーション） */
  footer?: ReactNode;
}

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
});

const IncomeTable = ({
  incomes,
  pagination,
  onEdit,
  footer,
}: Props): ReactElement => {
  const { ref, onOpen, onClose } = useDialog();
  const [incomeId, setIncomeId] = useState("");
  const { page, perPage } = pagination.current;

  const handleDelete = (id: string): void => {
    setIncomeId(id);
    onOpen();
  };

  return (
    <>
      <Table footer={footer}>
        <TableHead>
          <TableRow>
            <TableHeaderCell width={56}>#</TableHeaderCell>
            <TableHeaderCell>説明</TableHeaderCell>
            <TableHeaderCell width={128}>金額</TableHeaderCell>
            <TableHeaderCell width={128}>受取日</TableHeaderCell>
            <TableHeaderCell>属性名</TableHeaderCell>
            <TableHeaderCell width={104}>編集</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {incomes.length === 0 && <TableEmpty colSpan={6} />}
          {incomes.map(
            (
              { id, description, amount, attributeName, receiveDate },
              index,
            ) => {
              const no = index + 1 + (page - 1) * perPage;
              return (
                <TableRow key={id ?? no}>
                  <TableCell>{no}</TableCell>
                  <TableCell>{description}</TableCell>
                  <TableCell>{yen.format(amount)}</TableCell>
                  <TableCell>{receiveDate}</TableCell>
                  <TableCell>{attributeName}</TableCell>
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
        <form action={deleteIncome}>
          <h2>収入の削除</h2>
          <p>削除したデータは復元できません。削除しますか？</p>
          <input type="hidden" name="incomeId" value={incomeId} />
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
export default IncomeTable;
