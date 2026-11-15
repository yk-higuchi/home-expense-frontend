"use client";

import { useOptimistic, useState } from "react";
import type { ToastControl } from "@/lib/hooks/use-toast";

interface Row {
  id?: string;
}

export const useOptimisticDelete = <T extends Row>(
  source: T[],
  getLabel: (row: T) => string,
  toast: ToastControl,
) => {
  const [targetId, setTargetId] = useState<string | null>(null);
  const [rows, removeOptimistic] = useOptimistic(source, (state, id: string) =>
    state.filter((row) => row.id !== id),
  );
  const labelOf = (id: string): string | undefined => {
    const row = source.find((candidate) => candidate.id === id);
    return row === undefined ? undefined : getLabel(row);
  };
  return {
    rows,
    requestDelete: setTargetId,
    dialogProps: {
      targetId,
      onDeleteStart: (id: string) => {
        toast.clear();
        removeOptimistic(id);
      },
      onDeleted: (id: string) => {
        const label = labelOf(id);
        toast.success(
          label === undefined ? "削除しました" : `「${label}」を削除しました`,
        );
      },
      onDeleteFailed: toast.error,
      onClose: () => setTargetId(null),
    },
  };
};
