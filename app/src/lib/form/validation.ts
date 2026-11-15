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

const AMOUNT_MAX = 1_000_000_000;

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

export const date = (value: string, label: string): string | undefined => {
  if (value === "") return `${label}を入力してください`;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const parsed = match && new Date(`${value}T00:00:00`);
  return match &&
    parsed &&
    parsed.getFullYear() === Number(match[1]) &&
    parsed.getMonth() + 1 === Number(match[2]) &&
    parsed.getDate() === Number(match[3])
    ? undefined
    : `${label}を正しく入力してください`;
};

export const first = (...results: (string | undefined)[]): string | undefined =>
  results.find((result) => result !== undefined);
