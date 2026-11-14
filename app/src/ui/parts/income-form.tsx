import { Select, TextInput } from "@home-expense/ui";
import type { ReactElement } from "react";
import type { Income } from "@/lib/income";
import type { IncomeAttributes } from "@/lib/income-attribute";
import SubmitButton from "@/ui/parts/submit-button";
import style from "./form.module.css";

interface Props {
  income?: Income | Record<string, never>;
  incomeAttributes: IncomeAttributes;
  onSubmit: (formData: FormData) => void;
  buttonTitle: string;
}

const IncomeForm = ({
  income = {},
  incomeAttributes,
  onSubmit,
  buttonTitle,
}: Props): ReactElement => {
  const { id, description, amount, receiveDate, attributeId } = income;
  return (
    <form action={onSubmit} className={style.formStyle}>
      <input type="hidden" name="incomeId" value={id} />
      <TextInput
        label="説明"
        name="description"
        defaultValue={description}
        required
      />
      <TextInput
        label="金額"
        name="amount"
        inputMode="numeric"
        defaultValue={amount}
        required
      />
      <TextInput
        label="支払日"
        type="date"
        name="receiveDate"
        defaultValue={receiveDate}
        required
      />
      <Select label="属性名" name="attributeId" defaultValue={attributeId}>
        {incomeAttributes.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </Select>
      <SubmitButton fullWidth>{buttonTitle}</SubmitButton>
    </form>
  );
};

export default IncomeForm;
