"use client";

import {
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import {
  addDays,
  addMonths,
  clamp,
  compare,
  type Day,
  dayLabel,
  dayNumber,
  MAX_DAY,
  MIN_DAY,
  monthGrid,
  parseIso,
  today,
  toIso,
  WEEKDAYS,
  weekday,
  weekOffset,
} from "./date";

export interface CalendarProps {
  value?: string;
  onChange?: (value: string) => void;
  min?: string;
  max?: string;
  step?: number;
  stepBase?: string;
  weekStartsOn?: number;
  clearable?: boolean;
  showToday?: boolean;
  autoFocus?: boolean;
  previousIcon?: ReactNode;
  nextIcon?: ReactNode;
  className?: string;
  "aria-label"?: string;
}

type View = "days" | "months";

const EPOCH: Day = { year: 1970, month: 1, day: 1 };

const MONTHS = [...Array(12)].map((_, index) => index + 1);

const dayMove = (
  key: string,
  day: Day,
  shift: boolean,
  weekStartsOn: number,
): Day | null => {
  switch (key) {
    case "ArrowLeft":
      return addDays(day, -1);
    case "ArrowRight":
      return addDays(day, 1);
    case "ArrowUp":
      return addDays(day, -7);
    case "ArrowDown":
      return addDays(day, 7);
    case "Home":
      return addDays(day, -weekOffset(day, weekStartsOn));
    case "End":
      return addDays(day, 6 - weekOffset(day, weekStartsOn));
    case "PageUp":
      return addMonths(day, shift ? -12 : -1);
    case "PageDown":
      return addMonths(day, shift ? 12 : 1);
    default:
      return null;
  }
};

const monthMove = (key: string, day: Day): Day | null => {
  switch (key) {
    case "ArrowLeft":
      return addMonths(day, -1);
    case "ArrowRight":
      return addMonths(day, 1);
    case "ArrowUp":
      return addMonths(day, -3);
    case "ArrowDown":
      return addMonths(day, 3);
    case "Home":
      return { ...day, month: 1, day: 1 };
    case "End":
      return { ...day, month: 12, day: 1 };
    case "PageUp":
      return addMonths(day, -12);
    case "PageDown":
      return addMonths(day, 12);
    default:
      return null;
  }
};

export const Calendar = ({
  value,
  onChange,
  min: minValue,
  max: maxValue,
  step,
  stepBase,
  weekStartsOn = 0,
  clearable = false,
  showToday = true,
  autoFocus = false,
  previousIcon = "‹",
  nextIcon = "›",
  className,
  "aria-label": ariaLabel = "日付を選ぶ",
}: CalendarProps): ReactElement => {
  const titleId = useId();
  const min = parseIso(minValue);
  const max = parseIso(maxValue);
  const lower = clamp(min ?? MIN_DAY, null, null);
  const upper = clamp(max ?? MAX_DAY, null, null);
  const base = parseIso(stepBase) ?? min ?? EPOCH;
  const selected = parseIso(value);
  const todayDay = today();

  const [view, setView] = useState<View>("days");
  const [active, setActive] = useState<Day>(() =>
    clamp(selected ?? todayDay, min, max),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(autoFocus);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    const key = view === "days" ? toIso(active) : toIso({ ...active, day: 1 });
    rootRef.current
      ?.querySelector<HTMLButtonElement>(`[data-focus-key="${key}"]`)
      ?.focus();
  });

  const isDayDisabled = (day: Day): boolean =>
    compare(day, lower) < 0 ||
    compare(day, upper) > 0 ||
    (step !== undefined &&
      step > 0 &&
      (((dayNumber(day) - dayNumber(base)) % step) + step) % step !== 0);

  const isMonthDisabled = (year: number, month: number): boolean =>
    year * 12 + month < lower.year * 12 + lower.month ||
    year * 12 + month > upper.year * 12 + upper.month;

  const moveTo = (day: Day, focus: boolean) => {
    setActive(clamp(day, min, max));
    moveFocus.current = focus;
  };

  const showView = (next: View) => {
    setView(next);
    moveFocus.current = true;
  };

  const choose = (day: Day) => {
    if (isDayDisabled(day)) return;
    onChange?.(toIso(day));
  };

  const chooseMonth = (year: number, month: number) => {
    if (isMonthDisabled(year, month)) return;
    setActive(clamp({ year, month, day: 1 }, min, max));
    showView("days");
  };

  const handleDaysKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const next = dayMove(event.key, active, event.shiftKey, weekStartsOn);
    if (!next) return;
    event.preventDefault();
    moveTo(next, true);
  };

  const handleMonthsKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const next = monthMove(event.key, { ...active, day: 1 });
    if (!next) return;
    event.preventDefault();
    setActive(next);
    moveFocus.current = true;
  };

  const first = { ...active, day: 1 };
  const jump = view === "days" ? 1 : 12;
  const previous = addMonths(first, -jump);
  const next = addMonths(first, jump);
  const canGoPrevious =
    view === "days"
      ? active.year * 12 + active.month > lower.year * 12 + lower.month
      : active.year > lower.year;
  const canGoNext =
    view === "days"
      ? active.year * 12 + active.month < upper.year * 12 + upper.month
      : active.year < upper.year;
  const weekdays = [...Array(7)].map((_, index) => (index + weekStartsOn) % 7);

  return (
    // biome-ignore lint/a11y/useSemanticElements: fieldset はブラウザ既定の枠と余白が付き、見た目を持たない部品にならない
    <div
      ref={rootRef}
      role="group"
      aria-label={ariaLabel}
      className={className}
      data-part="root"
      data-view={view}
    >
      <div data-part="header">
        <button
          type="button"
          data-part="previous"
          aria-label={view === "days" ? "前の月" : "前の年"}
          disabled={!canGoPrevious}
          onClick={() => moveTo(previous, false)}
        >
          <span aria-hidden="true" data-part="icon">
            {previousIcon}
          </span>
        </button>
        <button
          type="button"
          id={titleId}
          data-part="title"
          aria-expanded={view === "months"}
          aria-live="polite"
          onClick={() => showView(view === "days" ? "months" : "days")}
        >
          {view === "days"
            ? `${active.year}年${active.month}月`
            : `${active.year}年`}
        </button>
        <button
          type="button"
          data-part="next"
          aria-label={view === "days" ? "次の月" : "次の年"}
          disabled={!canGoNext}
          onClick={() => moveTo(next, false)}
        >
          <span aria-hidden="true" data-part="icon">
            {nextIcon}
          </span>
        </button>
      </div>
      {view === "days" ? (
        <table
          data-part="grid"
          aria-labelledby={titleId}
          onKeyDown={handleDaysKeyDown}
        >
          <thead>
            <tr>
              {weekdays.map((index) => (
                <th
                  key={index}
                  scope="col"
                  abbr={`${WEEKDAYS[index]}曜日`}
                  data-part="weekday"
                  data-weekday={index}
                >
                  {WEEKDAYS[index]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {monthGrid(active.year, active.month, weekStartsOn)
              .filter((week) => week.some((day) => day !== null))
              .map((week) => (
                <tr
                  key={toIso(week.find((day) => day !== null) ?? MIN_DAY)}
                  data-part="week"
                >
                  {week.map((day, index) => {
                    if (day === null)
                      return (
                        // biome-ignore lint/suspicious/noArrayIndexKey: 日付の範囲の外の空きの欄で、並びは変わらない
                        <td key={index} data-part="cell" />
                      );
                    const iso = toIso(day);
                    const isActive = compare(day, active) === 0;
                    const isToday = compare(day, todayDay) === 0;
                    const isSelected =
                      selected !== null && compare(day, selected) === 0;
                    const disabled = isDayDisabled(day);
                    return (
                      <td key={iso} data-part="cell">
                        <button
                          type="button"
                          data-part="day"
                          data-focus-key={iso}
                          data-weekday={weekday(day)}
                          data-outside={day.month !== active.month || undefined}
                          data-today={isToday || undefined}
                          data-selected={isSelected || undefined}
                          data-disabled={disabled || undefined}
                          aria-label={dayLabel(day)}
                          aria-current={isToday ? "date" : undefined}
                          aria-pressed={isSelected}
                          aria-disabled={disabled || undefined}
                          tabIndex={isActive ? 0 : -1}
                          onClick={() => choose(day)}
                          onFocus={() => {
                            if (!isActive) setActive(day);
                          }}
                        >
                          {day.day}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
          </tbody>
        </table>
      ) : (
        <ul
          data-part="months"
          aria-labelledby={titleId}
          onKeyDown={handleMonthsKeyDown}
        >
          {MONTHS.map((month) => {
            const isActive = month === active.month;
            const disabled = isMonthDisabled(active.year, month);
            const isCurrent =
              active.year === todayDay.year && month === todayDay.month;
            const isSelected =
              selected !== null &&
              active.year === selected.year &&
              month === selected.month;
            return (
              <li key={month} data-part="month-item">
                <button
                  type="button"
                  data-part="month"
                  data-focus-key={toIso({ year: active.year, month, day: 1 })}
                  data-today={isCurrent || undefined}
                  data-selected={isSelected || undefined}
                  data-disabled={disabled || undefined}
                  aria-label={`${active.year}年${month}月`}
                  aria-current={isCurrent ? "date" : undefined}
                  aria-pressed={isSelected}
                  aria-disabled={disabled || undefined}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => chooseMonth(active.year, month)}
                  onFocus={() => {
                    if (!isActive) setActive({ ...active, month, day: 1 });
                  }}
                >
                  {month}月
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {(clearable || showToday) && (
        <div data-part="footer">
          {clearable && (
            <button
              type="button"
              data-part="clear"
              onClick={() => onChange?.("")}
            >
              クリア
            </button>
          )}
          {showToday && (
            <button
              type="button"
              data-part="today"
              disabled={isDayDisabled(todayDay)}
              onClick={() => choose(todayDay)}
            >
              今日
            </button>
          )}
        </div>
      )}
    </div>
  );
};
