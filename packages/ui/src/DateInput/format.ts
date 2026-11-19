import { type Day, parseIso, toIso } from "../Calendar/date";

const pad = (value: number, length = 2): string =>
  String(value).padStart(length, "0");

export const formatDay = (day: Day): string =>
  `${pad(day.year, 4)}/${pad(day.month)}/${pad(day.day)}`;

export const toDisplay = (iso: string | undefined): string => {
  if (!iso) return "";
  const day = parseIso(iso);
  return day ? formatDay(day) : iso;
};

export const parseDisplay = (text: string): Day | null => {
  const value = text.trim();
  const match =
    /^(\d{4,6})[/.-](\d{1,2})[/.-](\d{1,2})$/.exec(value) ??
    /^(\d{4})(\d{2})(\d{2})$/.exec(value);
  if (!match) return null;
  return parseIso(
    toIso({
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
    }),
  );
};

export const autoFormat = (text: string): string => {
  const digits = /^\d{5,8}$/.exec(text)?.[0];
  if (digits) {
    return [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6)]
      .filter(Boolean)
      .join("/");
  }
  const split = /^(\d{4})\/(\d{3,4})$/.exec(text);
  if (split?.[1] && split[2]) {
    return `${split[1]}/${split[2].slice(0, 2)}/${split[2].slice(2)}`;
  }
  return text;
};
