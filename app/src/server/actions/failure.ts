import { CONFLICT_MESSAGE } from "@/core/form/form-state";
import { HttpError } from "@/network/http/error";

const REORDER_FAILED_MESSAGE =
  "並べ替えを保存できませんでした。時間をおいてもう一度お試しください。";

const REORDER_CONFLICT_MESSAGE =
  "ほかの操作で一覧が更新されています。画面を読み込み直してから、もう一度並べ替えてください。";

export const reorderFailureMessage = (error: unknown): string =>
  error instanceof HttpError && [409, 412, 422, 428].includes(error.status)
    ? REORDER_CONFLICT_MESSAGE
    : REORDER_FAILED_MESSAGE;

export const failureMessage = (
  error: unknown,
  fallback: string,
  conflictMessage: string = CONFLICT_MESSAGE,
): string => {
  if (error instanceof HttpError) {
    if (error.status === 412 || error.status === 428) return conflictMessage;
    if (error.status >= 400 && error.status < 500 && error.detail) {
      return error.detail;
    }
  }
  return fallback;
};
