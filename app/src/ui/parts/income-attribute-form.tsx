"use client";

import { ErrorMessage, SubmitButton, TextInput } from "@home-expense/ui";
import { type ReactElement, useActionState } from "react";
import { type FormAction, initialFormState } from "@/lib/form/form-state";
import type { IncomeAttribute } from "@/lib/income-attribute";
import style from "./form.module.css";

interface Props {
  incomeAttribute?: IncomeAttribute | Record<string, never>;
  action: FormAction;
  buttonTitle: string;
}

const IncomeAttributeForm = ({
  incomeAttribute = {},
  action,
  buttonTitle,
}: Props): ReactElement => {
  const [state, formAction] = useActionState(action, initialFormState);
  const { id, version, name } = incomeAttribute;
  const { errors, values, message } = state;
  return (
    <form action={formAction} className={style.formStyle} noValidate>
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
      <SubmitButton fullWidth>{buttonTitle}</SubmitButton>
    </form>
  );
};

export default IncomeAttributeForm;
