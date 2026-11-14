import { Select, TextInput } from "@home-expense/ui";
import type { ChangeEvent, ReactElement } from "react";
import type { Expense } from "@/lib/expense";
import type { ExpenseAttributes } from "@/lib/expense-attribute";
import SubmitButton from "@/ui/parts/submit-button";
import style from "./form.module.css";

interface Props {
  expense?: Expense | Record<string, never>;
  expenseAttributes: ExpenseAttributes;
  onCategoryChange: (category: string) => void;
  onSubmit: (formData: FormData) => void;
  buttonTitle: string;
}

const ExpenseForm = ({
  expense = {},
  expenseAttributes,
  onCategoryChange,
  onSubmit,
  buttonTitle,
}: Props): ReactElement => {
  const { id, description, category, price, paymentDate, attributeId } =
    expense;
  const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onCategoryChange(event.currentTarget.value);
  };
  return (
    <form action={onSubmit} className={style.formStyle}>
      <input type="hidden" name="expenseId" value={id} />
      <TextInput
        label="説明"
        name="description"
        defaultValue={description}
        required
      />
      <TextInput
        label="金額"
        name="price"
        inputMode="numeric"
        defaultValue={price}
        required
      />
      <TextInput
        label="支払日"
        type="date"
        name="paymentDate"
        defaultValue={paymentDate}
        required
      />
      <Select
        label="分類"
        name="category"
        defaultValue={category}
        onChange={handleCategoryChange}
      >
        <option value="固定費">固定費</option>
        <option value="変動費">変動費</option>
      </Select>
      <Select label="属性名" name="attributeId" defaultValue={attributeId}>
        {expenseAttributes.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </Select>
      <SubmitButton fullWidth>{buttonTitle}</SubmitButton>
    </form>
  );
};

export default ExpenseForm;
