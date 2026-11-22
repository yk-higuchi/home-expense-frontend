"use client";

import { DateInput, ErrorMessage, Select, TextInput } from "@home-expense/ui";
import { type ReactElement, useActionState } from "react";
import { type FormAction, initialFormState } from "@/core/form/form-state";
import type { Income } from "@/core/income";
import type { IncomeAttributes } from "@/core/income-attribute";
import { useFocusFirstError } from "@/ui/hooks/use-focus-first-error";
import FormActions from "@/ui/parts/form-actions";
import style from "./form.module.css";

interface Props {
  income?: Income | Record<string, never>;
  incomeAttributes: IncomeAttributes;
  action: FormAction;
  buttonTitle: string;
  backHref: string;
  returnTo?: string;
  defaultDate?: string;
}

const IncomeForm = ({
  income = {},
  incomeAttributes,
  action,
  buttonTitle,
  backHref,
  returnTo,
  defaultDate,
}: Props): ReactElement => {
  const [state, formAction] = useActionState(action, initialFormState);
  const formRef = useFocusFirstError(state);
  const { id, version, description, amount, receiveDate, attributeId } = income;
  const { errors, values, message } = state;
  return (
    <form
      ref={formRef}
      action={formAction}
      className={style.formStyle}
      noValidate
    >
      <input type="hidden" name="incomeId" value={id} />
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
        label="受取日"
        name="receiveDate"
        defaultValue={values?.receiveDate ?? receiveDate ?? defaultDate}
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
      {message && <ErrorMessage>{message}</ErrorMessage>}
      <FormActions backHref={backHref}>{buttonTitle}</FormActions>
    </form>
  );
};

export default IncomeForm;
