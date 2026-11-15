export interface DeleteTarget {
  version: string;
  details: { label: string; value: string }[];
}

export type DeleteTargetResult = { target: DeleteTarget } | { message: string };

export const DELETE_TARGET_MISSING_MESSAGE =
  "すでに削除されています。画面を読み込み直してください。";

export const DELETE_TARGET_LOAD_FAILED_MESSAGE =
  "削除するデータを読み込めませんでした。時間をおいてもう一度お試しください。";

export const formatYen = (value: number): string =>
  `${value < 0 ? "−" : ""}￥${Math.abs(value).toLocaleString("ja-JP")}`;
