"use client";

import { useOptimistic, useState } from "react";

interface Row {
  id?: string;
  version?: string;
}

export const useOptimisticDelete = <T extends Row>(source: T[]) => {
  const [targetId, setTargetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rows, removeOptimistic] = useOptimistic(source, (state, id: string) =>
    state.filter((row) => row.id !== id),
  );
  return {
    rows,
    error,
    requestDelete: setTargetId,
    dialogProps: {
      targetId,
      targetVersion: source.find((row) => row.id === targetId)?.version,
      onDeleteStart: (id: string) => {
        setError(null);
        removeOptimistic(id);
      },
      onDeleteFailed: setError,
      onClose: () => setTargetId(null),
    },
  };
};
