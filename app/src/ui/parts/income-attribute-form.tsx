import { TextInput } from "@home-expense/ui";
import type { ReactElement } from "react";
import type { IncomeAttribute } from "@/lib/income-attribute";
import SubmitButton from "@/ui/parts/submit-button";
import style from "./form.module.css";

interface Props {
  incomeAttribute?: IncomeAttribute | Record<string, never>;
  onSubmit: (formData: FormData) => void;
  buttonTitle: string;
}

const IncomeAttributeForm = ({
  incomeAttribute = {},
  onSubmit,
  buttonTitle,
}: Props): ReactElement => {
  const { id, name } = incomeAttribute;
  return (
    <form action={onSubmit} className={style.formStyle}>
      <input type="hidden" name="incomeAttributeId" value={id} />
      <TextInput label="属性名" name="name" defaultValue={name} required />
      <SubmitButton fullWidth>{buttonTitle}</SubmitButton>
    </form>
  );
};

export default IncomeAttributeForm;
