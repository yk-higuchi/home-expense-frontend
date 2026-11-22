import type { ReactElement } from "react";

import type { ExpenseAttribute } from "@/core/expense-attribute";
import { updateExpenseAttribute } from "@/server/actions/expense-attribute";
import ExpenseAttributeForm from "@/ui/parts/expense-attribute-form";
import { listHref } from "@/ui/parts/form-actions";

interface Props {
  expenseAttribute: ExpenseAttribute;
}

const ExpenseAttributeEdit = ({ expenseAttribute }: Props): ReactElement => {
  return (
    <ExpenseAttributeForm
      expenseAttribute={expenseAttribute}
      action={updateExpenseAttribute}
      buttonTitle="更新"
      backHref={listHref(
        "/expense-attribute",
        new URLSearchParams({ category: expenseAttribute.category }).toString(),
      )}
    />
  );
};

export default ExpenseAttributeEdit;
