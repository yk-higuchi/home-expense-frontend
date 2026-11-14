"use client";

import { Select, TextInput } from "@home-expense/ui";
import { type ReactElement, useActionState } from "react";
import { type FormAction, initialFormState } from "@/lib/form/form-state";
import type { Income } from "@/lib/income";
import type { IncomeAttributes } from "@/lib/income-attribute";
import SubmitButton from "@/ui/parts/submit-button";
import style from "./form.module.css";

interface Props {
  income?: Income | Record<string, never>;
  incomeAttributes: IncomeAttributes;
  /** 登録・更新の Server Action（入力エラーを返す） */
  action: FormAction;
  buttonTitle: string;
}

const IncomeForm = ({
  income = {},
  incomeAttributes,
  action,
  buttonTitle,
}: Props): ReactElement => {
  const [state, formAction] = useActionState(action, initialFormState);
  const { id, version, description, amount, receiveDate, attributeId } = income;
  const { errors, values, message } = state;
  return (
    <form action={formAction} className={style.formStyle} noValidate>
      <input type="hidden" name="incomeId" value={id} />
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
        name="receiveDate"
        defaultValue={values?.receiveDate ?? receiveDate}
        errorMessage={errors?.receiveDate}
        required
      />
      <Select
        label="属性名"
        name="attributeId"
        defaultValue={values?.attributeId ?? attributeId}
        errorMessage={errors?.attributeId}
      >
        {incomeAttributes.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </Select>
      {message && (
        <p className={style.formError} role="alert">
          {message}
        </p>
      )}
      <SubmitButton fullWidth>{buttonTitle}</SubmitButton>
    </form>
  );
};

export default IncomeForm;
