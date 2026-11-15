"use client";

import { useOptimistic, useState } from "react";

interface Row {
  id?: string;
}

export const useOptimisticDelete = <T extends Row>(
  source: T[],
  getLabel: (row: T) => string,
) => {
  const [targetId, setTargetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(
    null,
  );
  const [rows, removeOptimistic] = useOptimistic(source, (state, id: string) =>
    state.filter((row) => row.id !== id),
  );
  const labelOf = (id: string): string | undefined => {
    const row = source.find((candidate) => candidate.id === id);
    return row === undefined ? undefined : getLabel(row);
  };
  return {
    rows,
    error,
    notice,
    requestDelete: setTargetId,
    dialogProps: {
      targetId,
      onDeleteStart: (id: string) => {
        setError(null);
        setNotice(null);
        removeOptimistic(id);
      },
      onDeleted: (id: string) => {
        const label = labelOf(id);
        setNotice({
          id: Date.now(),
          text:
            label === undefined ? "削除しました" : `「${label}」を削除しました`,
        });
      },
      onDeleteFailed: setError,
      onClose: () => setTargetId(null),
    },
  };
};
