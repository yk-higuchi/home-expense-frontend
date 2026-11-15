import type { Metadata } from "next";
import type { ReactElement } from "react";

import { getExpenseAttributes } from "@/service/expense-attribute-service";
import { getExpense } from "@/service/expense-service";
import ExpenseEdit from "@/ui/expense-edit";

export const metadata: Metadata = {
  title: "経費編集",
};

interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    category: string;
  }>;
}

const ExpenseEditPage = async (props: Props): Promise<ReactElement> => {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { id } = params;
  const expense = await getExpense({ id, tag: `expense-${id}` });
  const { category = expense.category } = searchParams;
  const { expenseAttributes } = await getExpenseAttributes({ category });
  return (
    <ExpenseEdit expense={expense} expenseAttributes={expenseAttributes} />
  );
};
export default ExpenseEditPage;
