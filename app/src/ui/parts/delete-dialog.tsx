"use client";

import { Button, Dialog, SubmitButton } from "@home-expense/ui";
import { type ReactElement, useOptimistic } from "react";
import type { FormState } from "@/lib/form/form-state";

interface Props {
  targetId: string | null;
  targetVersion?: string;
  title: string;
  idFieldName: string;
  action: (formData: FormData) => Promise<FormState>;
  onDeleteStart: (id: string) => void;
  onDeleteFailed: (message: string) => void;
  onClose: () => void;
}

const DeleteDialog = ({
  targetId,
  targetVersion,
  title,
  idFieldName,
  action,
  onDeleteStart,
  onDeleteFailed,
  onClose,
}: Props): ReactElement => {
  const [open, setOpen] = useOptimistic(targetId !== null);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description="削除したデータは復元できません。削除しますか？"
      formProps={{
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
      <input type="hidden" name="version" value={targetVersion ?? ""} />
    </Dialog>
  );
};
export default DeleteDialog;
