"use client";

import {
  type FormHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useEffect,
  useId,
  useRef,
} from "react";

import styles from "./Dialog.module.css";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  actions: ReactNode;
  formProps?: FormHTMLAttributes<HTMLFormElement>;
}

export const Dialog = ({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  formProps,
}: DialogProps): ReactElement => {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleClick = (event: MouseEvent<HTMLDialogElement>): void => {
    if (event.target === event.currentTarget) onClose();
  };

  const content = (
    <>
      <div className={styles.text}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {description && (
          <div id={descriptionId} className={styles.description}>
            {description}
          </div>
        )}
      </div>
      {children}
      <div className={styles.actions}>{actions}</div>
    </>
  );

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: キーボードでは Esc キーで閉じられる（<dialog> の標準動作）
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={handleClick}
    >
      {formProps ? (
        <form className={styles.card} {...formProps}>
          {content}
        </form>
      ) : (
        <div className={styles.card}>{content}</div>
      )}
    </dialog>
  );
};
