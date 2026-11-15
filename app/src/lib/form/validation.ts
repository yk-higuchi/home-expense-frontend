/** 入力チェック。問題があればエラーメッセージを、なければ undefined を返す */

export const required = (value: string, label: string): string | undefined =>
  value === "" ? `${label}を入力してください` : undefined;

export const selected = (value: string, label: string): string | undefined =>
  value === "" ? `${label}を選択してください` : undefined;

export const maxLength = (
  value: string,
  max: number,
  label: string,
): string | undefined =>
  value.length > max ? `${label}は${max}文字以内で入力してください` : undefined;

/** API の金額の上限（10 億円） */
export const AMOUNT_MAX = 1_000_000_000;

/** 1 以上 10 億以下の整数（3,000 のようなカンマ区切りも受け付ける） */
export const amount = (value: string, label: string): string | undefined => {
  if (value === "") return `${label}を入力してください`;
  const digits = value.replaceAll(",", "");
  if (!/^\d+$/.test(digits)) return `${label}は整数で入力してください`;
  const n = Number(digits);
  return n >= 1 && n <= AMOUNT_MAX
    ? undefined
    : `${label}は 1 円以上 10 億円以下で入力してください`;
};

export const parseAmount = (value: string): number =>
  Number.parseInt(value.replaceAll(",", ""), 10);

/** YYYY-MM-DD 形式の実在する日付 */
export const date = (value: string, label: string): string | undefined => {
  if (value === "") return `${label}を入力してください`;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  // Date は 2026-02-30 を 3 月 2 日に繰り上げるため、年月日が変わらないことも確かめる（バックエンドと同じ判定）
  const parsed = match && new Date(`${value}T00:00:00`);
  return match &&
    parsed &&
    parsed.getFullYear() === Number(match[1]) &&
    parsed.getMonth() + 1 === Number(match[2]) &&
    parsed.getDate() === Number(match[3])
    ? undefined
    : `${label}を正しく入力してください`;
};

/** 先に見つかったエラーを返す（同じ項目に複数のチェックをかけるとき） */
export const first = (...results: (string | undefined)[]): string | undefined =>
  results.find((result) => result !== undefined);
