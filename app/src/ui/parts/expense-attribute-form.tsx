"use client";

import {
  ErrorMessage,
  Select,
  SubmitButton,
  TextInput,
} from "@home-expense/ui";
import { type ReactElement, useActionState } from "react";
import type { ExpenseAttribute } from "@/lib/expense-attribute";
import { type FormAction, initialFormState } from "@/lib/form/form-state";
import style from "./form.module.css";

interface Props {
  expenseAttribute?: ExpenseAttribute | Record<string, never>;
  /** 登録・更新の Server Action（入力エラーを返す） */
  action: FormAction;
  buttonTitle: string;
}

const ExpenseAttributeForm = ({
  expenseAttribute = {},
  action,
  buttonTitle,
}: Props): ReactElement => {
  const [state, formAction] = useActionState(action, initialFormState);
  const { id, version, name, category } = expenseAttribute;
  const { errors, values, message } = state;
  const isEdit = id !== undefined;
  return (
    <form action={formAction} className={style.formStyle} noValidate>
      <input type="hidden" name="expenseAttributeId" value={id} />
      {/* 取得時のバージョン（更新時に If-Match として送る） */}
      <input type="hidden" name="version" value={version ?? ""} />
      <TextInput
        label="属性名"
        name="name"
        defaultValue={values?.name ?? name}
        errorMessage={errors?.name}
        required
      />
      {/* 分類は登録後に変更できない（更新では送らない） */}
      <Select
        label="分類"
        name="category"
        defaultValue={values?.category ?? category}
        errorMessage={errors?.category}
        disabled={isEdit}
        description={isEdit ? "分類は登録後に変更できません" : undefined}
      >
        <option value="固定費">固定費</option>
        <option value="変動費">変動費</option>
      </Select>
      {message && <ErrorMessage>{message}</ErrorMessage>}
      <SubmitButton fullWidth>{buttonTitle}</SubmitButton>
    </form>
  );
};

export default ExpenseAttributeForm;
