import type { ReactElement } from "react";

import styles from "./TableActions.module.css";

export interface TableActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  /** ボタンの読み上げ名。行の内容を含めると分かりやすい（例: 「家賃を編集」） */
  editLabel?: string;
  deleteLabel?: string;
}

/**
 * 表の編集・削除ボタン（Figma: 操作セル / SDS の Edit 2・Trash アイコン）
 */
export const TableActions = ({
  onEdit,
  onDelete,
  editLabel = "編集",
  deleteLabel = "削除",
}: TableActionsProps): ReactElement => (
  <div className={styles.actions}>
    {onEdit && (
      <button
        type="button"
        className={styles.button}
        onClick={onEdit}
        aria-label={editLabel}
        title={editLabel}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
      </button>
    )}
    {onDelete && (
      <button
        type="button"
        className={`${styles.button} ${styles.danger}`}
        onClick={onDelete}
        aria-label={deleteLabel}
        title={deleteLabel}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    )}
  </div>
);
