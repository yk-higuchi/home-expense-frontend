"use client";

import { Button, Dialog } from "@home-expense/ui";
import type { ReactElement } from "react";
import SubmitButton from "@/ui/parts/submit-button";

interface Props {
  /** 削除する対象の ID。null のときは閉じている */
  targetId: string | null;
  /** 見出し（例: 「経費の削除」） */
  title: string;
  /** hidden 項目の name（Server Action が受け取る名前） */
  idFieldName: string;
  /** 削除の Server Action */
  action: (formData: FormData) => Promise<void>;
  onClose: () => void;
}

/** 削除の確認ダイアログ（Figma: 削除確認ダイアログ） */
const DeleteDialog = ({
  targetId,
  title,
  idFieldName,
  action,
  onClose,
}: Props): ReactElement => (
  <Dialog
    open={targetId !== null}
    onClose={onClose}
    title={title}
    description="削除したデータは復元できません。削除しますか？"
    formProps={{
      action: async (formData: FormData) => {
        await action(formData);
        onClose();
      },
    }}
    actions={
      <>
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <SubmitButton variant="danger">削除</SubmitButton>
      </>
    }
  >
    <input type="hidden" name={idFieldName} value={targetId ?? ""} />
  </Dialog>
);
export default DeleteDialog;
