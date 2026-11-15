"use client";

import { Button, Dialog, ErrorMessage, SubmitButton } from "@home-expense/ui";
import { type ReactElement, useEffect, useOptimistic, useState } from "react";
import type { DeleteTarget, DeleteTargetResult } from "@/lib/delete-target";
import type { FormState } from "@/lib/form/form-state";
import style from "./delete-dialog.module.css";

interface Props {
  targetId: string | null;
  title: string;
  idFieldName: string;
  loadTarget: (id: string) => Promise<DeleteTargetResult>;
  action: (formData: FormData) => Promise<FormState>;
  onDeleteStart: (id: string) => void;
  onDeleted: (id: string) => void;
  onDeleteFailed: (message: string) => void;
  onClose: () => void;
}

type Loaded =
  | { id: string; target: DeleteTarget }
  | { id: string; message: string };

const DeleteDialog = ({
  targetId,
  title,
  idFieldName,
  loadTarget,
  action,
  onDeleteStart,
  onDeleted,
  onDeleteFailed,
  onClose,
}: Props): ReactElement => {
  const [open, setOpen] = useOptimistic(targetId !== null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    if (targetId === null) return;
    let active = true;
    loadTarget(targetId).then((result) => {
      if (active) setLoaded({ id: targetId, ...result });
    });
    return () => {
      active = false;
    };
  }, [targetId, loadTarget]);

  const current = loaded?.id === targetId ? loaded : null;
  const target = current && "target" in current ? current.target : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description="削除したデータは復元できません。削除しますか？"
      formProps={{
        action: async (formData: FormData) => {
          const id = targetId;
          if (id !== null) onDeleteStart(id);
          setOpen(false);
          onClose();
          const { message } = await action(formData);
          if (message) onDeleteFailed(message);
          else if (id !== null) onDeleted(id);
        },
      }}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            キャンセル
          </Button>
          <SubmitButton variant="danger" disabled={target === null}>
            削除
          </SubmitButton>
        </>
      }
    >
      <input type="hidden" name={idFieldName} value={targetId ?? ""} />
      <input type="hidden" name="version" value={target?.version ?? ""} />
      {current === null && <p className={style.loading}>読み込み中…</p>}
      {current && "message" in current && (
        <ErrorMessage>{current.message}</ErrorMessage>
      )}
      {target && (
        <dl className={style.details}>
          {target.details.map(({ label, value }) => (
            <div key={label} className={style.detail}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </Dialog>
  );
};
export default DeleteDialog;
