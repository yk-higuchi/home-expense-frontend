import {
  type ComponentPropsWithRef,
  type ReactElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Calendar } from "../Calendar/Calendar";
import calendarTheme from "../Calendar/CalendarTheme.module.css";
import { controlClassName, describedBy, Field } from "../Field/Field";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "../icons/icons";
import styles from "./DateInput.module.css";

export interface DateInputProps
  extends Omit<ComponentPropsWithRef<"input">, "size" | "type"> {
  label?: string;
  description?: string;
  errorMessage?: string;
  skeleton?: boolean;
}

const setNativeValue = (input: HTMLInputElement, value: string): void => {
  Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
};

const GAP = 4;

const placePopover = (popover: HTMLElement, anchor: HTMLElement): void => {
  const rect = anchor.getBoundingClientRect();
  const { offsetWidth: width, offsetHeight: height } = popover;
  const below = rect.bottom + GAP;
  const top =
    below + height > window.innerHeight && rect.top - GAP - height >= 0
      ? rect.top - GAP - height
      : below;
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
  ...rest
}: DateInputProps): ReactElement => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const popoverId = `${inputId}-calendar`;
  const disabled = skeleton || rest.disabled;
  const min = typeof rest.min === "string" ? rest.min : undefined;
  const max = typeof rest.max === "string" ? rest.max : undefined;
  const step =
    rest.step === undefined || rest.step === "any"
      ? undefined
      : Number(rest.step);
  const stepBase =
    min ??
    (typeof rest.defaultValue === "string" ? rest.defaultValue : undefined);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [openValue, setOpenValue] = useState<string | null>(null);

  useEffect(() => {
    const popover = popoverRef.current;
    if (!popover) return;
    const onToggle = (event: Event) => {
      setOpenValue(
        (event as ToggleEvent).newState === "open"
          ? (inputRef.current?.value ?? "")
          : null,
      );
    };
    const onResize = () => popover.hidePopover();
    popover.addEventListener("toggle", onToggle);
    window.addEventListener("resize", onResize);
    return () => {
      popover.removeEventListener("toggle", onToggle);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useLayoutEffect(() => {
    if (openValue === null || !popoverRef.current || !wrapRef.current) return;
    placePopover(popoverRef.current, wrapRef.current);
  });

  const handleChange = (value: string) => {
    if (inputRef.current) setNativeValue(inputRef.current, value);
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
          type="date"
          className={`${controlClassName} ${styles.input}`}
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={describedBy(inputId, description, errorMessage)}
          {...rest}
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === "function") return ref(node);
            if (ref) ref.current = node;
          }}
          disabled={disabled}
          data-skeleton={skeleton || undefined}
        />
        <button
          type="button"
          className={styles.toggle}
          popoverTarget={popoverId}
          aria-label="カレンダーを開く"
          aria-haspopup="dialog"
          aria-expanded={openValue !== null}
          disabled={disabled || rest.readOnly}
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
            clearable={!rest.required}
            autoFocus
            previousIcon={<ChevronLeftIcon size={20} />}
            nextIcon={<ChevronRightIcon size={20} />}
            onChange={handleChange}
          />
        )}
      </div>
    </Field>
  );
};
