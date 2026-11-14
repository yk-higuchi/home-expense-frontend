"use client";

import { TextInput } from "@home-expense/ui";
import { type ReactElement, useActionState } from "react";
import { type FormAction, initialFormState } from "@/lib/form/form-state";
import type { IncomeAttribute } from "@/lib/income-attribute";
import SubmitButton from "@/ui/parts/submit-button";
import style from "./form.module.css";

interface Props {
  incomeAttribute?: IncomeAttribute | Record<string, never>;
  /** 登録・更新の Server Action（入力エラーを返す） */
  action: FormAction;
  buttonTitle: string;
}

const IncomeAttributeForm = ({
  incomeAttribute = {},
  action,
  buttonTitle,
}: Props): ReactElement => {
  const [state, formAction] = useActionState(action, initialFormState);
  const { id, name } = incomeAttribute;
  const { errors, values, message } = state;
  return (
    <form action={formAction} className={style.formStyle} noValidate>
      <input type="hidden" name="incomeAttributeId" value={id} />
      <TextInput
        label="属性名"
        name="name"
        defaultValue={values?.name ?? name}
        errorMessage={errors?.name}
        required
      />
      {message && (
        <p className={style.formError} role="alert">
          {message}
        </p>
      )}
      <SubmitButton fullWidth>{buttonTitle}</SubmitButton>
    </form>
  );
};

export default IncomeAttributeForm;
