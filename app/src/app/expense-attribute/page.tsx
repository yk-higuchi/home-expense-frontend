import type { Metadata } from "next";
import type { ReactElement } from "react";

import { isExpenseAttributeCategory } from "@/lib/expense-attribute";
import { getExpenseAttributes } from "@/service/expense-attribute-service";
import ExpenseAttribute from "@/ui/expense-attribute";

export const metadata: Metadata = {
  title: "経費属性一覧",
};

interface Props {
  searchParams: Promise<{
    category?: string;
  }>;
}

const ExpenseAttributePage = async (props: Props): Promise<ReactElement> => {
  const { category: requested } = await props.searchParams;
  const category = isExpenseAttributeCategory(requested) ? requested : "固定費";
  const { expenseAttributes, version } = await getExpenseAttributes({
    category,
  });
  return (
    <ExpenseAttribute
      category={category}
      expenseAttributes={expenseAttributes}
      version={version}
    />
  );
};
export default ExpenseAttributePage;
