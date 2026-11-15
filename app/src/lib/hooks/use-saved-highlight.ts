"use client";

import { useEffect, useState } from "react";

export const useSavedHighlight = <T extends { id?: string }>(
  savedId: string | undefined,
  rows: T[],
  getLabel: (row: T) => string,
) => {
  const [highlightedId] = useState(savedId);
  const [notice] = useState(() => {
    if (savedId === undefined) return null;
    const row = rows.find((candidate) => candidate.id === savedId);
    const text =
      row === undefined ? "保存しました" : `「${getLabel(row)}」を保存しました`;
    return { id: 0, text, tone: "success" as const };
  });

  useEffect(() => {
    if (highlightedId === undefined) return;
    document
      .getElementById(`row-${highlightedId}`)
      ?.scrollIntoView({ block: "nearest" });
    const url = new URL(window.location.href);
    url.searchParams.delete("saved");
    window.history.replaceState(null, "", url);
  }, [highlightedId]);

  return { highlightedId, notice };
};
