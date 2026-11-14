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
import type { IncomeAttributes } from "@/lib/income-attribute";
import type { Pagination } from "@/lib/pagination/pagination";
import { deleteIncomeAttribute } from "@/service/income-attribute-service";
import Dialog from "@/ui/parts/dialog";

interface Props {
  incomeAttributes: IncomeAttributes;
  pagination: Pagination;
  onEdit: (id: string) => void;
  /** 表の枠の内側・下に置く要素（ページネーション） */
  footer?: ReactNode;
}

const IncomeAttributeTable = ({
  incomeAttributes,
  pagination,
  onEdit,
  footer,
}: Props): ReactElement => {
  const { ref, onOpen, onClose } = useDialog();
  const [incomeAttributeId, setIncomeAttributeId] = useState("");
  const { page, perPage } = pagination.current;

  const handleDelete = (id: string): void => {
    setIncomeAttributeId(id);
    onOpen();
  };

  return (
    <>
      <Table footer={footer}>
        <TableHead>
          <TableRow>
            <TableHeaderCell width={102}>No.</TableHeaderCell>
            <TableHeaderCell>属性名</TableHeaderCell>
            <TableHeaderCell width={104}>編集</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {incomeAttributes.length === 0 && <TableEmpty colSpan={3} />}
          {incomeAttributes.map(({ id, name }, index) => {
            const no = index + 1 + (page - 1) * perPage;
            return (
              <TableRow key={id ?? no}>
                <TableCell>{no}</TableCell>
                <TableCell>{name}</TableCell>
                <TableCell>
                  {id && (
                    <TableActions
                      onEdit={() => onEdit(id)}
                      onDelete={() => handleDelete(id)}
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
      <Dialog ref={ref} onClick={onClose}>
        <form action={deleteIncomeAttribute}>
          <h2>収入属性の削除</h2>
          <p>削除したデータは復元できません。削除しますか？</p>
          <input
            type="hidden"
            name="incomeAttributeId"
            value={incomeAttributeId}
          />
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
export default IncomeAttributeTable;
