"use client";

import { ErrorMessage, TextInput } from "@home-expense/ui";
import { type ReactElement, useActionState } from "react";
import { type FormAction, initialFormState } from "@/core/form/form-state";
import type { IncomeAttribute } from "@/core/income-attribute";
import { useFocusFirstError } from "@/ui/hooks/use-focus-first-error";
import FormActions from "@/ui/parts/form-actions";
import style from "./form.module.css";

interface Props {
  incomeAttribute?: IncomeAttribute | Record<string, never>;
  action: FormAction;
  buttonTitle: string;
  backHref: string;
}

const IncomeAttributeForm = ({
  incomeAttribute = {},
  action,
  buttonTitle,
  backHref,
}: Props): ReactElement => {
  const [state, formAction] = useActionState(action, initialFormState);
  const formRef = useFocusFirstError(state);
  const { id, version, name } = incomeAttribute;
  const { errors, values, message } = state;
  return (
    <form
      ref={formRef}
      action={formAction}
      className={style.formStyle}
      noValidate
    >
      <input type="hidden" name="incomeAttributeId" value={id} />
      <input type="hidden" name="version" value={version ?? ""} />
      <TextInput
        label="属性名"
        name="name"
        defaultValue={values?.name ?? name}
        errorMessage={errors?.name}
        required
      />
      {message && <ErrorMessage>{message}</ErrorMessage>}
      <FormActions backHref={backHref}>{buttonTitle}</FormActions>
    </form>
  );
};

export default IncomeAttributeForm;
