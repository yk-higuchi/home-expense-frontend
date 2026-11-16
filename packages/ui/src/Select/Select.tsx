import { type ComponentPropsWithRef, type ReactElement, useId } from "react";

import { controlClassName, describedBy, Field } from "../Field/Field";
import styles from "./Select.module.css";

export interface SelectProps
  extends Omit<ComponentPropsWithRef<"select">, "size"> {
  label?: string;
  description?: string;
  errorMessage?: string;
}

export const Select = ({
  label,
  description,
  errorMessage,
  id,
  className,
  children,
  ...rest
}: SelectProps): ReactElement => {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  return (
    <Field
      id={selectId}
      label={label}
      description={description}
      errorMessage={errorMessage}
      className={className}
    >
      <div className={styles.wrapper}>
        <select
          id={selectId}
          className={[controlClassName, styles.select].join(" ")}
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={describedBy(selectId, description, errorMessage)}
          {...rest}
        >
          {children}
        </select>
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
      </div>
    </Field>
  );
};
