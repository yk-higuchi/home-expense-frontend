"use client";

import { useEffect, useState } from "react";

export const useSavedHighlight = <T extends { id?: string }>(
  savedId: string | undefined,
  rows: T[],
  getLabel: (row: T) => string,
) => {
  const [highlightedId] = useState(savedId);
  const [label] = useState(() => {
    const row = rows.find((candidate) => candidate.id === savedId);
    return row === undefined ? undefined : getLabel(row);
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

  return {
    highlightedId,
    message:
      highlightedId === undefined
        ? undefined
        : label === undefined
          ? "保存しました"
          : `「${label}」を保存しました`,
  };
};
