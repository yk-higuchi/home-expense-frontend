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

/** 0 以上の整数（3,000 のようなカンマ区切りも受け付ける） */
export const amount = (value: string, label: string): string | undefined => {
  if (value === "") return `${label}を入力してください`;
  return /^\d+$/.test(value.replaceAll(",", ""))
    ? undefined
    : `${label}は 0 以上の整数で入力してください`;
};

export const parseAmount = (value: string): number =>
  Number.parseInt(value.replaceAll(",", ""), 10);

/** YYYY-MM-DD 形式の実在する日付 */
export const date = (value: string, label: string): string | undefined => {
  if (value === "") return `${label}を入力してください`;
  const parsed = new Date(`${value}T00:00:00`);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parsed.getTime())
    ? undefined
    : `${label}を正しく入力してください`;
};

/** 先に見つかったエラーを返す（同じ項目に複数のチェックをかけるとき） */
export const first = (...results: (string | undefined)[]): string | undefined =>
  results.find((result) => result !== undefined);
