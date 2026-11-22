"use client";

import {
  DateInput,
  ErrorMessage,
  Select,
  SubmitButton,
  TextInput,
} from "@home-expense/ui";
import { type ChangeEvent, type ReactElement, useActionState } from "react";
import type { Expense } from "@/core/expense";
import type { ExpenseAttributes } from "@/core/expense-attribute";
import { type FormAction, initialFormState } from "@/core/form/form-state";
import { useFocusFirstError } from "@/ui/hooks/use-focus-first-error";
import style from "./form.module.css";

interface Props {
  expense?: Expense | Record<string, never>;
  expenseAttributes: ExpenseAttributes;
  onCategoryChange: (category: string) => void;
  action: FormAction;
  buttonTitle: string;
  returnTo?: string;
  defaultDate?: string;
}

const ExpenseForm = ({
  expense = {},
  expenseAttributes,
  onCategoryChange,
  action,
  buttonTitle,
  returnTo,
  defaultDate,
}: Props): ReactElement => {
  const [state, formAction] = useActionState(action, initialFormState);
  const formRef = useFocusFirstError(state);
  const {
    id,
    version,
    description,
    category,
    amount,
    paymentDate,
    attributeId,
  } = expense;
  const { errors, values, message } = state;
  const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onCategoryChange(event.currentTarget.value);
  };
  return (
    <form
      ref={formRef}
      action={formAction}
      className={style.formStyle}
      noValidate
    >
      <input type="hidden" name="expenseId" value={id} />
      <input type="hidden" name="version" value={version ?? ""} />
      <input type="hidden" name="returnTo" value={returnTo ?? ""} />
      <TextInput
        label="説明"
        name="description"
        defaultValue={values?.description ?? description}
        errorMessage={errors?.description}
        required
      />
      <TextInput
        label="金額"
        name="amount"
        inputMode="numeric"
        defaultValue={values?.amount ?? amount}
        errorMessage={errors?.amount}
        required
      />
      <DateInput
        label="支払日"
        name="paymentDate"
        defaultValue={values?.paymentDate ?? paymentDate ?? defaultDate}
        errorMessage={errors?.paymentDate}
        required
      />
      <Select
        label="分類"
        name="category"
        defaultValue={values?.category ?? category}
        onChange={handleCategoryChange}
      >
        <option value="固定費">固定費</option>
        <option value="変動費">変動費</option>
      </Select>
      <Select
        label="属性名"
        name="attributeId"
        defaultValue={values?.attributeId ?? attributeId}
        errorMessage={errors?.attributeId}
      >
        {expenseAttributes.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </Select>
      {message && <ErrorMessage>{message}</ErrorMessage>}
      <SubmitButton fullWidth>{buttonTitle}</SubmitButton>
    </form>
  );
};

export default ExpenseForm;
