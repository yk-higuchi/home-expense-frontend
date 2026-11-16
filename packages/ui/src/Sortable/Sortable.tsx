import type { ComponentPropsWithRef, ReactElement } from "react";

import { ChevronDownIcon, ChevronUpIcon, GripIcon } from "../icons/icons";
import styles from "./Sortable.module.css";

export type DragHandleProps = Omit<
  ComponentPropsWithRef<"button">,
  "type" | "children"
>;

export const DragHandle = ({
  className,
  ...rest
}: DragHandleProps): ReactElement => (
  <button
    type="button"
    className={[styles.handle, className].filter(Boolean).join(" ")}
    title={rest["aria-label"]}
    {...rest}
  >
    <GripIcon size={20} />
  </button>
);

export interface ReorderButtonsProps {
  label: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export const ReorderButtons = ({
  label,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: ReorderButtonsProps): ReactElement => (
  <div className={styles.moveButtons}>
    <button
      type="button"
      className={styles.moveButton}
      onClick={onMoveUp}
      disabled={!canMoveUp}
      aria-label={`${label}を上へ移動`}
      title={`${label}を上へ移動`}
    >
      <ChevronUpIcon size={16} />
    </button>
    <button
      type="button"
      className={styles.moveButton}
      onClick={onMoveDown}
      disabled={!canMoveDown}
      aria-label={`${label}を下へ移動`}
      title={`${label}を下へ移動`}
    >
      <ChevronDownIcon size={16} />
    </button>
  </div>
);

export interface SortableStatusProps {
  message: string;
}

export const SortableStatus = ({
  message,
}: SortableStatusProps): ReactElement => (
  <span className={styles.srOnly} role="status" aria-live="polite">
    {message}
  </span>
);
