import type { ReactElement } from "react";
import type { ExpenseAttributeCategory } from "@/core/expense-attribute";

import { registerExpenseAttribute } from "@/server/actions/expense-attribute";
import ExpenseAttributeForm from "@/ui/parts/expense-attribute-form";
import { listHref } from "@/ui/parts/form-actions";

interface Props {
  category?: ExpenseAttributeCategory;
}

const ExpenseRegistration = ({ category }: Props): ReactElement => {
  return (
    <ExpenseAttributeForm
      defaultCategory={category}
      action={registerExpenseAttribute}
      buttonTitle="登録"
      backHref={listHref(
        "/expense-attribute",
        category && new URLSearchParams({ category }).toString(),
      )}
    />
  );
};

export default ExpenseRegistration;
