"use client";

import { useOptimistic, useState } from "react";

interface Row {
  id?: string;
  /** データのバージョン（削除の If-Match に使う） */
  version?: string;
}

/**
 * 一覧の行の削除（確認ダイアログ → 楽観的に表から消す → 失敗したら戻してエラーを出す）。
 * 経費・収入・経費属性・収入属性の表で共通
 *
 * - rows: 表に出す行（削除を確定した行は、サーバーの処理を待たずに消える）
 * - requestDelete(id): 行の削除ボタンから呼ぶ（確認ダイアログを開く）
 * - dialogProps: DeleteDialog にそのまま渡す
 */
export const useOptimisticDelete = <T extends Row>(source: T[]) => {
  const [targetId, setTargetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // 削除を確定した行は、サーバーの処理を待たずに表から消す（失敗したら自動で戻る）
  const [rows, removeOptimistic] = useOptimistic(source, (state, id: string) =>
    state.filter((row) => row.id !== id),
  );
  return {
    rows,
    error,
    requestDelete: setTargetId,
    dialogProps: {
      targetId,
      // 表示していた行のバージョンを送る（削除の直前に取り直すと、見ていない変更まで消してしまう）
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
