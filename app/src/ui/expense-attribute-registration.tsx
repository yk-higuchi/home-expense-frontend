import type { ReactElement } from "react";

import { registerExpenseAttribute } from "@/server/actions/expense-attribute";
import ExpenseAttributeForm from "@/ui/parts/expense-attribute-form";

const ExpenseRegistration = (): ReactElement => {
  return (
    <ExpenseAttributeForm
      action={registerExpenseAttribute}
      buttonTitle="登録"
    />
  );
};

export default ExpenseRegistration;
