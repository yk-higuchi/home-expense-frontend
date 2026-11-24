"use client";

import { ActionMenu, ReorderButtons, TableActions } from "@home-expense/ui";
import type { ReactElement } from "react";
import style from "@/ui/parts/attribute-table.module.css";
import columns from "@/ui/parts/table-columns.module.css";

interface Props {
  name: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const AttributeRowActions = ({
  name,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: Props): ReactElement => (
  <>
    <div className={[style.actions, columns.desktopOnly].join(" ")}>
      <ReorderButtons
        label={name}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
      />
      {onEdit && onDelete && (
        <TableActions
          onEdit={onEdit}
          onDelete={onDelete}
          editLabel={`${name}を編集`}
          deleteLabel={`${name}を削除`}
        />
      )}
    </div>
    <span className={columns.mobileOnly}>
      <ActionMenu
        label={`${name}の操作`}
        items={[
          { label: "上へ移動", onSelect: onMoveUp, disabled: !canMoveUp },
          { label: "下へ移動", onSelect: onMoveDown, disabled: !canMoveDown },
          ...(onEdit && onDelete
            ? [
                { label: "編集", onSelect: onEdit },
                { label: "削除", onSelect: onDelete, tone: "danger" as const },
              ]
            : []),
        ]}
      />
    </span>
  </>
);
export default AttributeRowActions;
