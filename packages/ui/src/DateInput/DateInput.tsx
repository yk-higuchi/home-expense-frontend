"use client";

import {
  type ComponentPropsWithRef,
  type FocusEvent,
  type InputEvent,
  type ReactElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Calendar } from "../Calendar/Calendar";
import calendarTheme from "../Calendar/CalendarTheme.module.css";
import {
  compare,
  type Day,
  dayNumber,
  parseIso,
  toIso,
} from "../Calendar/date";
import { controlClassName, describedBy, Field } from "../Field/Field";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "../icons/icons";
import styles from "./DateInput.module.css";
import { autoFormat, formatDay, parseDisplay, toDisplay } from "./format";

export interface DateInputProps
  extends Omit<
    ComponentPropsWithRef<"input">,
    "size" | "type" | "value" | "defaultValue" | "min" | "max" | "step"
  > {
  label?: string;
  description?: string;
  errorMessage?: string;
  skeleton?: boolean;
  defaultValue?: string;
  min?: string;
  max?: string;
  step?: number;
}

const setNativeValue = (input: HTMLInputElement, value: string): void => {
  Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
};

const openingValue = (text: string): string => {
  const day = parseDisplay(text);
  return day ? toIso(day) : "";
};

const GAP = 4;

const placePopover = (popover: HTMLElement, anchor: HTMLElement): void => {
  const rect = anchor.getBoundingClientRect();
  const { offsetWidth: width, offsetHeight: height } = popover;
  const below = rect.bottom + GAP;
  const above = rect.top - GAP - height;
  const preferred =
    below + height <= window.innerHeight || above < 0 ? below : above;
  const top = Math.max(
    GAP,
    Math.min(preferred, window.innerHeight - height - GAP),
  );
  const left = Math.max(
    GAP,
    Math.min(rect.right - width, window.innerWidth - width - GAP),
  );
  popover.style.top = `${top}px`;
  popover.style.left = `${left}px`;
};

export const DateInput = ({
  label,
  description,
  errorMessage,
  skeleton = false,
  id,
  className,
  ref,
  name,
  defaultValue,
  min,
  max,
  step,
  required,
  readOnly,
  disabled: disabledProp,
  onInput,
  onBlur,
  ...rest
}: DateInputProps): ReactElement => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const popoverId = `${inputId}-calendar`;
  const disabled = skeleton || disabledProp;
  const minDay = parseIso(min);
  const maxDay = parseIso(max);
  const stepBase = min ?? defaultValue;
  const baseDay = parseIso(stepBase) ?? { year: 1970, month: 1, day: 1 };

  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [openValue, setOpenValue] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(defaultValue ?? "");

  const validity = (text: string, day: Day | null): string => {
    if (text.trim() === "") return "";
    if (!day) return "yyyy/mm/dd の形で入力してください";
    if (minDay && compare(day, minDay) < 0)
      return `${formatDay(minDay)} 以降の日付を入力してください`;
    if (maxDay && compare(day, maxDay) > 0)
      return `${formatDay(maxDay)} 以前の日付を入力してください`;
    if (step && step > 0 && (dayNumber(day) - dayNumber(baseDay)) % step !== 0)
      return "選べない日付です";
    return "";
  };

  const sync = (text: string) => {
    const day = parseDisplay(text);
    setSubmitted(day ? toIso(day) : text.trim());
    inputRef.current?.setCustomValidity(validity(text, day));
  };

  useEffect(() => {
    const popover = popoverRef.current;
    const form = inputRef.current?.form;
    if (!popover) return;
    const onToggle = (event: Event) => {
      setOpenValue(
        (event as ToggleEvent).newState === "open"
          ? openingValue(inputRef.current?.value ?? "")
          : null,
      );
    };
    const onResize = () => popover.hidePopover();
    const onReset = () =>
      setTimeout(() => {
        if (inputRef.current) sync(inputRef.current.value);
      });
    popover.addEventListener("toggle", onToggle);
    window.addEventListener("resize", onResize);
    form?.addEventListener("reset", onReset);
    return () => {
      popover.removeEventListener("toggle", onToggle);
      window.removeEventListener("resize", onResize);
      form?.removeEventListener("reset", onReset);
    };
  });

  useLayoutEffect(() => {
    if (openValue === null || !popoverRef.current || !wrapRef.current) return;
    placePopover(popoverRef.current, wrapRef.current);
  });

  const handleInput = (event: InputEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const native = event.nativeEvent;
    if (
      native.inputType?.startsWith("insert") &&
      input.selectionStart === input.value.length
    ) {
      const formatted = autoFormat(input.value);
      if (formatted !== input.value) input.value = formatted;
    }
    sync(input.value);
    onInput?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const day = parseDisplay(input.value);
    if (day) input.value = formatDay(day);
    sync(input.value);
    onBlur?.(event);
  };

  const handleChoose = (value: string) => {
    const input = inputRef.current;
    if (input) {
      setNativeValue(input, toDisplay(value));
      sync(input.value);
    }
    popoverRef.current?.hidePopover();
  };

  return (
    <Field
      id={inputId}
      label={label}
      description={description}
      errorMessage={errorMessage}
      className={className}
    >
      <div className={styles.wrap} ref={wrapRef}>
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="yyyy/mm/dd"
          className={`${controlClassName} ${styles.input}`}
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={describedBy(inputId, description, errorMessage)}
          {...rest}
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === "function") return ref(node);
            if (ref) ref.current = node;
          }}
          defaultValue={toDisplay(defaultValue)}
          required={required}
          readOnly={readOnly}
          disabled={disabled}
          data-skeleton={skeleton || undefined}
          onInput={handleInput}
          onBlur={handleBlur}
        />
        <input
          type="hidden"
          name={name}
          value={submitted}
          disabled={disabled}
        />
        <button
          type="button"
          className={styles.toggle}
          popoverTarget={popoverId}
          aria-label="カレンダーを開く"
          aria-haspopup="dialog"
          aria-expanded={openValue !== null}
          disabled={disabled || readOnly}
        >
          <CalendarIcon size={20} />
        </button>
      </div>
      <div
        id={popoverId}
        ref={popoverRef}
        popover="auto"
        role="dialog"
        aria-label={label ? `${label}を選ぶ` : "日付を選ぶ"}
        className={styles.popover}
      >
        {openValue !== null && (
          <Calendar
            className={calendarTheme.calendar}
            value={openValue}
            min={min}
            max={max}
            step={step}
            stepBase={stepBase}
            clearable={!required}
            autoFocus
            previousIcon={<ChevronLeftIcon size={20} />}
            nextIcon={<ChevronRightIcon size={20} />}
            onChange={handleChoose}
          />
        )}
      </div>
    </Field>
  );
};
