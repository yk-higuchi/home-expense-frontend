"use client";

import {
  Children,
  type ComponentPropsWithRef,
  type FocusEventHandler,
  isValidElement,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { controlClassName, describedBy, Field } from "../Field/Field";
import { CheckIcon } from "../icons/icons";
import styles from "./Select.module.css";

export interface SelectProps
  extends Omit<ComponentPropsWithRef<"select">, "size" | "onFocus" | "onBlur"> {
  onFocus?: FocusEventHandler<HTMLButtonElement>;
  onBlur?: FocusEventHandler<HTMLButtonElement>;
  label?: string;
  description?: string;
  errorMessage?: string;
  skeleton?: boolean;
}

interface Option {
  value: string;
  label: string;
  disabled: boolean;
}

interface OptionProps {
  value?: string | number;
  disabled?: boolean;
  children?: ReactNode;
}

const textOf = (node: ReactNode): string =>
  Children.toArray(node)
    .map((child) =>
      typeof child === "string" || typeof child === "number"
        ? String(child)
        : isValidElement<{ children?: ReactNode }>(child)
          ? textOf(child.props.children)
          : "",
    )
    .join("");

const optionsOf = (children: ReactNode): Option[] =>
  Children.toArray(children).flatMap((child) => {
    if (!isValidElement<OptionProps & { children?: ReactNode }>(child))
      return [];
    if (child.type !== "option") return optionsOf(child.props.children);
    const label = textOf(child.props.children);
    return [
      {
        value:
          child.props.value === undefined ? label : String(child.props.value),
        label,
        disabled: Boolean(child.props.disabled),
      },
    ];
  });

const setNativeValue = (select: HTMLSelectElement, value: string): void => {
  Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    "value",
  )?.set?.call(select, value);
  select.dispatchEvent(new Event("input", { bubbles: true }));
  select.dispatchEvent(new Event("change", { bubbles: true }));
};

const GAP = 4;
const PAGE = 10;
const TYPEAHEAD_MS = 500;

const placeListbox = (listbox: HTMLElement, anchor: HTMLElement): void => {
  const rect = anchor.getBoundingClientRect();
  listbox.style.minWidth = `${rect.width}px`;
  listbox.style.left = `${GAP}px`;
  const { offsetWidth: width, offsetHeight: height } = listbox;
  const below = rect.bottom + GAP;
  const above = rect.top - GAP - height;
  const preferred =
    below + height <= window.innerHeight || above < 0 ? below : above;
  listbox.style.top = `${Math.max(GAP, Math.min(preferred, window.innerHeight - height - GAP))}px`;
  listbox.style.left = `${Math.max(GAP, Math.min(rect.left, window.innerWidth - width - GAP))}px`;
};

export const Select = ({
  label,
  description,
  errorMessage,
  skeleton = false,
  id,
  className,
  children,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  onFocus,
  onBlur,
  ...rest
}: SelectProps): ReactElement => {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const listboxId = `${selectId}-listbox`;
  const optionId = (index: number) => `${selectId}-option-${index}`;
  const disabled = skeleton || rest.disabled;
  const options = optionsOf(children);

  const selectRef = useRef<HTMLSelectElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const typeahead = useRef({ text: "", at: 0 });
  const centerOnOpen = useRef(false);
  const wheelAt = useRef<{ x: number; y: number } | null>(null);

  const initial = String(
    rest.value ?? rest.defaultValue ?? options[0]?.value ?? "",
  );
  const [value, setValue] = useState(initial);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];

  useLayoutEffect(() => {
    const current = selectRef.current?.value;
    if (current !== undefined && current !== value) setValue(current);
  });

  useLayoutEffect(() => {
    if (!open || !listboxRef.current || !buttonRef.current) return;
    const listbox = listboxRef.current;
    placeListbox(listbox, buttonRef.current);
    const option = listbox.querySelector<HTMLElement>(
      `#${CSS.escape(optionId(active))}`,
    );
    if (!option) return;
    const top = option.offsetTop;
    const bottom = top + option.offsetHeight;
    if (centerOnOpen.current) {
      centerOnOpen.current = false;
      listbox.scrollTop =
        top - (listbox.clientHeight - option.offsetHeight) / 2;
    } else if (top < listbox.scrollTop) {
      listbox.scrollTop = top;
    } else if (bottom > listbox.scrollTop + listbox.clientHeight) {
      listbox.scrollTop = bottom - listbox.clientHeight;
    }
  });

  useEffect(() => {
    const listbox = listboxRef.current;
    const button = buttonRef.current;
    const form = selectRef.current?.form;
    if (!listbox || !button) return;
    const onBeforeToggle = (event: Event) => {
      if ((event as ToggleEvent).newState !== "open") return;
      const rect = button.getBoundingClientRect();
      listbox.style.minWidth = `${rect.width}px`;
      listbox.style.top = `${rect.bottom + GAP}px`;
      listbox.style.left = `${rect.left}px`;
    };
    const onToggle = (event: Event) => {
      const opened = (event as ToggleEvent).newState === "open";
      if (opened) {
        wheelAt.current = null;
        placeListbox(listbox, button);
        centerOnOpen.current = true;
      }
      setOpen(opened);
      setActive((current) =>
        !opened
          ? -1
          : current >= 0
            ? current
            : enabled(selectedIndex)
              ? selectedIndex
              : first(),
      );
    };
    const onResize = () => listbox.hidePopover();
    const onReset = () =>
      setTimeout(() => {
        if (selectRef.current) setValue(selectRef.current.value);
      });
    listbox.addEventListener("beforetoggle", onBeforeToggle);
    listbox.addEventListener("toggle", onToggle);
    window.addEventListener("resize", onResize);
    form?.addEventListener("reset", onReset);
    return () => {
      listbox.removeEventListener("beforetoggle", onBeforeToggle);
      listbox.removeEventListener("toggle", onToggle);
      window.removeEventListener("resize", onResize);
      form?.removeEventListener("reset", onReset);
    };
  });

  const enabled = (index: number) =>
    index >= 0 && index < options.length && !options[index]?.disabled;

  const step = (from: number, delta: number): number => {
    const direction = Math.sign(delta) || 1;
    let target = from;
    let index = from;
    for (let moved = 0; moved < Math.abs(delta); ) {
      index += direction;
      if (index < 0 || index >= options.length) break;
      if (enabled(index)) {
        target = index;
        moved++;
      }
    }
    return target;
  };

  const first = () => step(-1, 1);
  const last = () => step(options.length, -1);

  const isOpen = () => listboxRef.current?.matches(":popover-open") ?? false;

  const show = (index: number) => {
    setActive(enabled(index) ? index : first());
    if (!isOpen()) {
      centerOnOpen.current = true;
      listboxRef.current?.showPopover();
    }
    setOpen(true);
  };

  const hide = () => {
    if (isOpen()) listboxRef.current?.hidePopover();
    setOpen(false);
    setActive(-1);
  };

  const choose = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    if (selectRef.current && selectRef.current.value !== option.value) {
      setNativeValue(selectRef.current, option.value);
      setValue(selectRef.current.value);
    }
    hide();
  };

  const search = (key: string, from: number): number => {
    const now = Date.now();
    const state = typeahead.current;
    state.text = now - state.at > TYPEAHEAD_MS ? key : state.text + key;
    state.at = now;
    const text = state.text.toLowerCase();
    const start = state.text.length === 1 ? from + 1 : Math.max(from, 0);
    for (let offset = 0; offset < options.length; offset++) {
      const index = (start + offset) % options.length;
      if (
        enabled(index) &&
        options[index]?.label.toLowerCase().startsWith(text)
      )
        return index;
    }
    return from;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    wheelAt.current = null;
    const { key, altKey } = event;
    const expanded = isOpen();
    const current = expanded ? active : selectedIndex;
    const isPrintable =
      key.length === 1 && !event.ctrlKey && !event.metaKey && !altKey;
    if (!expanded) {
      if (
        key === "ArrowDown" ||
        key === "ArrowUp" ||
        key === "Enter" ||
        key === " "
      ) {
        event.preventDefault();
        show(current);
      } else if (key === "Home") {
        event.preventDefault();
        show(first());
      } else if (key === "End") {
        event.preventDefault();
        show(last());
      } else if (isPrintable) {
        event.preventDefault();
        show(search(key, current));
      }
      return;
    }
    if (key === "Escape") {
      event.preventDefault();
      hide();
    } else if (key === "Tab") {
      choose(active);
    } else if ((key === "ArrowUp" && altKey) || key === "Enter") {
      event.preventDefault();
      choose(active);
    } else if (
      key === " " &&
      Date.now() - typeahead.current.at > TYPEAHEAD_MS
    ) {
      event.preventDefault();
      choose(active);
    } else if (key === "ArrowDown") {
      event.preventDefault();
      setActive(step(active, 1));
    } else if (key === "ArrowUp") {
      event.preventDefault();
      setActive(step(active, -1));
    } else if (key === "Home") {
      event.preventDefault();
      setActive(first());
    } else if (key === "End") {
      event.preventDefault();
      setActive(last());
    } else if (key === "PageDown") {
      event.preventDefault();
      setActive(step(active, PAGE));
    } else if (key === "PageUp") {
      event.preventDefault();
      setActive(step(active, -PAGE));
    } else if (isPrintable) {
      event.preventDefault();
      setActive(search(key, active));
    }
  };

  return (
    <Field
      id={selectId}
      label={label}
      description={description}
      errorMessage={errorMessage}
      className={className}
    >
      <div className={styles.wrapper}>
        <button
          ref={buttonRef}
          id={selectId}
          type="button"
          role="combobox"
          className={[controlClassName, styles.select].join(" ")}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={
            open && active >= 0 ? optionId(active) : undefined
          }
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={describedBy(selectId, description, errorMessage)}
          disabled={disabled}
          data-skeleton={skeleton || undefined}
          popoverTarget={listboxId}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
        >
          <span className={styles.value}>
            {skeleton ? "" : selected?.label}
          </span>
        </button>
        <svg
          className={styles.chevron}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <select
          {...rest}
          ref={(node) => {
            selectRef.current = node;
            const { ref } = rest;
            if (typeof ref === "function") return ref(node);
            if (ref) ref.current = node;
          }}
          hidden
          tabIndex={-1}
          disabled={disabled}
        >
          {children}
        </select>
      </div>
      <div
        ref={listboxRef}
        id={listboxId}
        role="listbox"
        popover="auto"
        aria-label={label ?? ariaLabel}
        tabIndex={-1}
        className={styles.listbox}
        onWheel={(event) => {
          wheelAt.current = { x: event.clientX, y: event.clientY };
        }}
        onScroll={() => {
          const at = wheelAt.current;
          if (at === null) return;
          const index = Number(
            document
              .elementFromPoint(at.x, at.y)
              ?.closest<HTMLElement>("[role='option']")?.dataset.index,
          );
          if (Number.isInteger(index) && enabled(index) && index !== active)
            setActive(index);
        }}
      >
        {options.map((option, index) => (
          // biome-ignore lint/a11y/useFocusableInteractive: 選択肢にはフォーカスを移さず、aria-activedescendant で示す（キー操作はコンボボックスで受ける）
          // biome-ignore lint/a11y/useKeyWithClickEvents: キー操作はコンボボックスで受ける
          <div
            key={option.value}
            id={optionId(index)}
            role="option"
            aria-selected={index === selectedIndex}
            aria-disabled={option.disabled || undefined}
            data-active={index === active || undefined}
            data-index={index}
            className={styles.option}
            onPointerDown={(event) => event.preventDefault()}
            onPointerMove={() => {
              if (enabled(index) && index !== active) setActive(index);
            }}
            onClick={() => choose(index)}
          >
            <span className={styles.optionLabel}>{option.label}</span>
            {index === selectedIndex && <CheckIcon size={16} />}
          </div>
        ))}
      </div>
    </Field>
  );
};
