import type { ReactElement } from "react";

import { getExpenseAttribute } from "@/service/expense-attribute-service";
import ExpenseAttributeEdit from "@/ui/expense-attribute-edit";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

const ExpenseAttributeEditPage = async (
  props: Props,
): Promise<ReactElement> => {
  const params = await props.params;
  const { id } = params;
  const expenseAttribute = await getExpenseAttribute({
    id,
    tag: `expense-attribute-${id}`,
  });
  return <ExpenseAttributeEdit expenseAttribute={expenseAttribute} />;
};
export default ExpenseAttributeEditPage;
