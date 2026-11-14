"use client";

import { Button, Dialog } from "@home-expense/ui";
import { type ReactElement, useOptimistic } from "react";
import type { FormState } from "@/lib/form/form-state";
import SubmitButton from "@/ui/parts/submit-button";

interface Props {
  /** 削除する対象の ID。null のときは閉じている */
  targetId: string | null;
  /** 見出し（例: 「経費の削除」） */
  title: string;
  /** hidden 項目の name（Server Action が受け取る名前） */
  idFieldName: string;
  /** 削除の Server Action（失敗時は message を返す） */
  action: (formData: FormData) => Promise<FormState>;
  /** 削除を確定した瞬間（楽観的に表から消すために使う） */
  onDeleteStart: (id: string) => void;
  /** 削除に失敗したとき */
  onDeleteFailed: (message: string) => void;
  onClose: () => void;
}

/** 削除の確認ダイアログ（Figma: 削除確認ダイアログ） */
const DeleteDialog = ({
  targetId,
  title,
  idFieldName,
  action,
  onDeleteStart,
  onDeleteFailed,
  onClose,
}: Props): ReactElement => {
  // 送信処理（transition）の中で変えた普通の state は処理が終わるまで反映されないため、
  // 開閉も楽観的に扱い、「削除」を押した瞬間に閉じる
  const [open, setOpen] = useOptimistic(targetId !== null);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description="削除したデータは復元できません。削除しますか？"
      formProps={{
        // フォームの送信処理（transition）の中で、先に表から消してダイアログを閉じる
        action: async (formData: FormData) => {
          if (targetId !== null) onDeleteStart(targetId);
          setOpen(false);
          onClose();
          const { message } = await action(formData);
          if (message) onDeleteFailed(message);
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
};
export default DeleteDialog;
