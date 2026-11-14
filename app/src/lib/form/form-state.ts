import { HttpError } from "@/lib/http/error";

/** Server Action が useActionState に返すフォームの状態 */
export interface FormState {
  /** 項目ごとのエラーメッセージ（name 属性がキー） */
  errors?: Record<string, string>;
  /** エラー時に入力欄へ戻す入力値（React 19 は送信後にフォームを空に戻すため） */
  values?: Record<string, string>;
  /** フォーム全体のエラー（API の失敗など） */
  message?: string;
}

export type FormAction = (
  state: FormState,
  formData: FormData,
) => Promise<FormState>;

export const initialFormState: FormState = {};

/** 指定した項目の入力値を文字列として取り出す */
export const formValues = <K extends string>(
  formData: FormData,
  names: readonly K[],
): Record<K, string> =>
  Object.fromEntries(
    names.map((name) => [name, String(formData.get(name) ?? "").trim()]),
  ) as Record<K, string>;

/** エラーメッセージのうち、値があるものだけを集める。なければ undefined */
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

/**
 * API の失敗を利用者向けの文言にする。
 * - 412（バージョンが合わない）: ほかの操作で更新された旨
 * - そのほかの 4xx: バックエンドの detail（例: 既に登録されています）
 * - 5xx・通信エラー: fallback
 */
export const failureMessage = (error: unknown, fallback: string): string => {
  if (error instanceof HttpError) {
    if (error.status === 412 || error.status === 428) return CONFLICT_MESSAGE;
    if (error.status >= 400 && error.status < 500 && error.detail) {
      return error.detail;
    }
  }
  return fallback;
};
