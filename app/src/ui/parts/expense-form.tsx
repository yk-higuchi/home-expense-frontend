"use client";

import {
  ErrorMessage,
  Select,
  SubmitButton,
  TextInput,
} from "@home-expense/ui";
import { type ChangeEvent, type ReactElement, useActionState } from "react";
import type { Expense } from "@/lib/expense";
import type { ExpenseAttributes } from "@/lib/expense-attribute";
import { type FormAction, initialFormState } from "@/lib/form/form-state";
import style from "./form.module.css";

interface Props {
  expense?: Expense | Record<string, never>;
  expenseAttributes: ExpenseAttributes;
  onCategoryChange: (category: string) => void;
  /** 登録・更新の Server Action（入力エラーを返す） */
  action: FormAction;
  buttonTitle: string;
}

const ExpenseForm = ({
  expense = {},
  expenseAttributes,
  onCategoryChange,
  action,
  buttonTitle,
}: Props): ReactElement => {
  const [state, formAction] = useActionState(action, initialFormState);
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
    <form action={formAction} className={style.formStyle} noValidate>
      <input type="hidden" name="expenseId" value={id} />
      {/* 取得時のバージョン（更新時に If-Match として送る） */}
      <input type="hidden" name="version" value={version ?? ""} />
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
      <TextInput
        label="支払日"
        type="date"
        name="paymentDate"
        defaultValue={values?.paymentDate ?? paymentDate}
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
