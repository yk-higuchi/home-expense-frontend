"use client";

import { Button, Dialog, ErrorMessage, SubmitButton } from "@home-expense/ui";
import { type ReactElement, Suspense, use, useOptimistic } from "react";
import type {
  DeleteRequest,
  DeleteTarget,
  DeleteTargetResult,
} from "@/core/delete-target";
import type { FormState } from "@/core/form/form-state";
import style from "./delete-dialog.module.css";

interface Props {
  request: DeleteRequest | null;
  title: string;
  idFieldName: string;
  action: (formData: FormData) => Promise<FormState>;
  onDeleteStart: (id: string) => void;
  onDeleted: (id: string) => void;
  onDeleteFailed: (message: string) => void;
  onClose: () => void;
}

const targetOf = (result: DeleteTargetResult): DeleteTarget | null =>
  "target" in result ? result.target : null;

const Details = ({
  result,
}: {
  result: Promise<DeleteTargetResult>;
}): ReactElement => {
  const loaded = use(result);
  if ("message" in loaded) return <ErrorMessage>{loaded.message}</ErrorMessage>;
  return (
    <>
      <input type="hidden" name="version" value={loaded.target.version} />
      <dl className={style.details}>
        {loaded.target.details.map(({ label, value }) => (
          <div key={label} className={style.detail}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
};

const DeleteButton = ({
  result,
}: {
  result: Promise<DeleteTargetResult>;
}): ReactElement => (
  <SubmitButton variant="danger" disabled={targetOf(use(result)) === null}>
    削除
  </SubmitButton>
);

const DeleteDialog = ({
  request,
  title,
  idFieldName,
  action,
  onDeleteStart,
  onDeleted,
  onDeleteFailed,
  onClose,
}: Props): ReactElement => {
  const [open, setOpen] = useOptimistic(request !== null);
  const disabledButton = (
    <SubmitButton variant="danger" disabled>
      削除
    </SubmitButton>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description="削除したデータは復元できません。削除しますか？"
      formProps={{
        action: async (formData: FormData) => {
          const id = request?.id ?? null;
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
          {request === null ? (
            disabledButton
          ) : (
            <Suspense key={request.id} fallback={disabledButton}>
              <DeleteButton result={request.result} />
            </Suspense>
          )}
        </>
      }
    >
      <input type="hidden" name={idFieldName} value={request?.id ?? ""} />
      {request !== null && (
        <Suspense
          key={request.id}
          fallback={<p className={style.loading}>読み込み中…</p>}
        >
          <Details result={request.result} />
        </Suspense>
      )}
    </Dialog>
  );
};
export default DeleteDialog;
