import { type ComponentPropsWithRef, type ReactElement, useId } from "react";

import { controlClassName, describedBy, Field } from "../Field/Field";

export interface TextInputProps
  extends Omit<ComponentPropsWithRef<"input">, "size"> {
  label?: string;
  description?: string;
  errorMessage?: string;
  skeleton?: boolean;
}

export const TextInput = ({
  label,
  description,
  errorMessage,
  skeleton = false,
  id,
  className,
  type = "text",
  ...rest
}: TextInputProps): ReactElement => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <Field
      id={inputId}
      label={label}
      description={description}
      errorMessage={errorMessage}
      className={className}
    >
      <input
        id={inputId}
        type={type}
        className={controlClassName}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={describedBy(inputId, description, errorMessage)}
        {...rest}
        disabled={skeleton || rest.disabled}
        data-skeleton={skeleton || undefined}
      />
    </Field>
  );
};
