import { Select, TextInput } from "@home-expense/ui";
import type { ReactElement } from "react";
import type { ExpenseAttribute } from "@/lib/expense-attribute";
import SubmitButton from "@/ui/parts/submit-button";
import style from "./form.module.css";

interface Props {
  expenseAttribute?: ExpenseAttribute | Record<string, never>;
  onSubmit: (formData: FormData) => void;
  buttonTitle: string;
}

const ExpenseAttributeForm = ({
  expenseAttribute = {},
  onSubmit,
  buttonTitle,
}: Props): ReactElement => {
  const { id, name, category } = expenseAttribute;
  return (
    <form action={onSubmit} className={style.formStyle}>
      <input type="hidden" name="expenseAttributeId" value={id} />
      <TextInput label="属性名" name="name" defaultValue={name} required />
      <Select label="分類" name="category" defaultValue={category}>
        <option value="固定費">固定費</option>
        <option value="変動費">変動費</option>
      </Select>
      <SubmitButton fullWidth>{buttonTitle}</SubmitButton>
    </form>
  );
};

export default ExpenseAttributeForm;
