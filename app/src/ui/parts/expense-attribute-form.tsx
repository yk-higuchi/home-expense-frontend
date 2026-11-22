"use client";

import { ErrorMessage, Select, TextInput } from "@home-expense/ui";
import { type ReactElement, useActionState } from "react";
import type { ExpenseAttribute } from "@/core/expense-attribute";
import { type FormAction, initialFormState } from "@/core/form/form-state";
import { useFocusFirstError } from "@/ui/hooks/use-focus-first-error";
import FormActions from "@/ui/parts/form-actions";
import style from "./form.module.css";

interface Props {
  expenseAttribute?: ExpenseAttribute | Record<string, never>;
  action: FormAction;
  buttonTitle: string;
  backHref: string;
  defaultCategory?: string;
}

const ExpenseAttributeForm = ({
  expenseAttribute = {},
  action,
  buttonTitle,
  backHref,
  defaultCategory,
}: Props): ReactElement => {
  const [state, formAction] = useActionState(action, initialFormState);
  const formRef = useFocusFirstError(state);
  const { id, version, name, category } = expenseAttribute;
  const { errors, values, message } = state;
  const isEdit = id !== undefined;
  return (
    <form
      ref={formRef}
      action={formAction}
      className={style.formStyle}
      noValidate
    >
      <input type="hidden" name="expenseAttributeId" value={id} />
      <input type="hidden" name="version" value={version ?? ""} />
      {isEdit && <input type="hidden" name="category" value={category} />}
      <TextInput
        label="属性名"
        name="name"
        defaultValue={values?.name ?? name}
        errorMessage={errors?.name}
        required
      />
      <Select
        label="分類"
        name="category"
        defaultValue={values?.category ?? category ?? defaultCategory}
        errorMessage={errors?.category}
        disabled={isEdit}
        description={isEdit ? "分類は登録後に変更できません" : undefined}
      >
        <option value="固定費">固定費</option>
        <option value="変動費">変動費</option>
      </Select>
      {message && <ErrorMessage>{message}</ErrorMessage>}
      <FormActions backHref={backHref}>{buttonTitle}</FormActions>
    </form>
  );
};

export default ExpenseAttributeForm;
