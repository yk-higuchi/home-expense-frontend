"use client";

import { useOptimistic, useState, useTransition } from "react";

interface Row {
  id?: string;
}

interface ReorderResult {
  version?: string;
  message?: string;
}

export const useOptimisticReorder = <T extends Row>({
  source,
  version,
  save,
  onError,
}: {
  source: T[];
  version: string;
  save: (move: {
    from: number;
    to: number;
    version: string;
  }) => Promise<ReorderResult>;
  onError: (message: string) => void;
}) => {
  const [latest, setLatest] = useState({ from: version, value: version });
  if (latest.from !== version) setLatest({ from: version, value: version });
  const [rows, setRows] = useOptimistic(source);
  const [isPending, startTransition] = useTransition();

  const reorder = (ids: string[], move: { from: number; to: number }): void => {
    startTransition(async () => {
      setRows(ids.flatMap((id) => source.filter((row) => row.id === id)));
      const result = await save({ ...move, version: latest.value });
      const next = result.version;
      if (next !== undefined) setLatest((state) => ({ ...state, value: next }));
      if (result.message !== undefined) onError(result.message);
    });
  };

  return { rows, reorder, isPending };
};
