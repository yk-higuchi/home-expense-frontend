import { HttpError } from "@/lib/http/error";

export interface FormState {
  errors?: Record<string, string>;
  values?: Record<string, string>;
  message?: string;
}

export type FormAction = (
  state: FormState,
  formData: FormData,
) => Promise<FormState>;

export const initialFormState: FormState = {};

export const formValues = <K extends string>(
  formData: FormData,
  names: readonly K[],
): Record<K, string> =>
  Object.fromEntries(
    names.map((name) => [name, String(formData.get(name) ?? "").trim()]),
  ) as Record<K, string>;

export const collectErrors = (
  candidates: Record<string, string | undefined>,
): Record<string, string> | undefined => {
  const errors = Object.fromEntries(
    Object.entries(candidates).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  );
  return Object.keys(errors).length > 0 ? errors : undefined;
};

export const SUBMIT_FAILED_MESSAGE =
  "保存できませんでした。時間をおいてもう一度お試しください。";

export const DELETE_FAILED_MESSAGE =
  "削除できませんでした。時間をおいてもう一度お試しください。";

export const CONFLICT_MESSAGE =
  "ほかの操作で内容が更新されています。画面を読み込み直してから、もう一度保存してください。";

const REORDER_FAILED_MESSAGE =
  "並べ替えを保存できませんでした。時間をおいてもう一度お試しください。";

const REORDER_CONFLICT_MESSAGE =
  "ほかの操作で一覧が更新されています。画面を読み込み直してから、もう一度並べ替えてください。";

export const reorderFailureMessage = (error: unknown): string =>
  error instanceof HttpError && [412, 422, 428].includes(error.status)
    ? REORDER_CONFLICT_MESSAGE
    : REORDER_FAILED_MESSAGE;

export const DELETE_CONFLICT_MESSAGE =
  "ほかの操作で内容が更新されています。画面を読み込み直してから、もう一度削除してください。";

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
