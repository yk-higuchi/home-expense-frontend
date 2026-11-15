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
  /** 開いているか */
  open: boolean;
  /** 閉じる操作（Esc キー・背景のクリック）があったとき */
  onClose: () => void;
  /** 見出し */
  title: string;
  /** 見出しの下の説明 */
  description?: ReactNode;
  /** 説明の下に置く内容（フォームの hidden 項目など） */
  children?: ReactNode;
  /** 右下に並べるボタン */
  actions: ReactNode;
  /**
   * 指定すると、中身を <form> で包む。actions の type="submit" のボタンで送信できる。
   * 例: { action: deleteExpense }
   */
  formProps?: FormHTMLAttributes<HTMLFormElement>;
}

/**
 * ダイアログ（モーダル）
 *
 * Figma: コンポーネント / 削除確認ダイアログ
 */
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

  // 背景（::backdrop）のクリックで閉じる
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
