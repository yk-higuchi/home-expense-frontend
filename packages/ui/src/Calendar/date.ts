export interface Day {
  year: number;
  month: number;
  day: number;
}

export const MIN_DAY: Day = { year: 1, month: 1, day: 1 };
export const MAX_DAY: Day = { year: 275760, month: 9, day: 13 };

const pad = (value: number, length = 2): string =>
  String(value).padStart(length, "0");

export const toIso = ({ year, month, day }: Day): string =>
  `${pad(year, 4)}-${pad(month)}-${pad(day)}`;

const toDate = ({ year, month, day }: Day): Date => {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return date;
};

const fromDate = (date: Date): Day | null =>
  Number.isNaN(date.getTime())
    ? null
    : {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
      };

export const compare = (a: Day, b: Day): number =>
  a.year - b.year || a.month - b.month || a.day - b.day;

const inLimits = (day: Day): boolean =>
  compare(day, MIN_DAY) >= 0 && compare(day, MAX_DAY) <= 0;

export const parseIso = (value: string | undefined): Day | null => {
  const match = /^(\d{4,6})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const day = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
  const parsed = fromDate(toDate(day));
  return parsed && compare(parsed, day) === 0 && inLimits(day) ? day : null;
};

export const today = (): Day => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
};

const shiftDays = (day: Day, amount: number): Day | null => {
  const date = toDate(day);
  date.setUTCDate(date.getUTCDate() + amount);
  const shifted = fromDate(date);
  return shifted && inLimits(shifted) ? shifted : null;
};

export const clamp = (day: Day, min: Day | null, max: Day | null): Day => {
  const lower = min && compare(min, MIN_DAY) > 0 ? min : MIN_DAY;
  const upper = max && compare(max, MAX_DAY) < 0 ? max : MAX_DAY;
  if (compare(day, lower) < 0) return lower;
  if (compare(day, upper) > 0) return upper;
  return day;
};

export const addDays = (day: Day, amount: number): Day =>
  shiftDays(day, amount) ?? (amount < 0 ? MIN_DAY : MAX_DAY);

const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const daysInMonth = (year: number, month: number): number =>
  month === 2
    ? isLeapYear(year)
      ? 29
      : 28
    : ([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 31);

export const addMonths = (day: Day, amount: number): Day => {
  const index = day.year * 12 + day.month - 1 + amount;
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return clamp(
    { year, month, day: Math.min(day.day, daysInMonth(year, month)) },
    null,
    null,
  );
};

export const weekday = (day: Day): number => toDate(day).getUTCDay();

export const weekOffset = (day: Day, weekStartsOn: number): number =>
  (weekday(day) - weekStartsOn + 7) % 7;

export const dayNumber = (day: Day): number =>
  Math.round(toDate(day).getTime() / 86_400_000);

export const monthGrid = (
  year: number,
  month: number,
  weekStartsOn = 0,
): (Day | null)[][] => {
  const first = { year, month, day: 1 };
  const offset = weekOffset(first, weekStartsOn);
  return [...Array(6)].map((_, week) =>
    [...Array(7)].map((_, index) =>
      shiftDays(first, week * 7 + index - offset),
    ),
  );
};

export const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

export const dayLabel = (day: Day): string =>
  `${day.year}年${day.month}月${day.day}日 ${WEEKDAYS[weekday(day)]}曜日`;
