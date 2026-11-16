import type { Metadata } from "next";
import type { ReactElement } from "react";

import { isExpenseAttributeCategory } from "@/lib/expense-attribute";
import { getExpenseAttributes } from "@/service/expense-attribute-service";
import ExpenseAttribute from "@/ui/expense-attribute";

export const metadata: Metadata = {
  title: "支出属性一覧",
};

interface Props {
  searchParams: Promise<{
    category?: string;
    saved?: string;
  }>;
}

const ExpenseAttributePage = async (props: Props): Promise<ReactElement> => {
  const { category: requested, saved } = await props.searchParams;
  const category = isExpenseAttributeCategory(requested) ? requested : "固定費";
  const { expenseAttributes, version } = await getExpenseAttributes({
    category,
  });
  return (
    <ExpenseAttribute
      category={category}
      expenseAttributes={expenseAttributes}
      version={version}
      savedId={saved}
    />
  );
};
export default ExpenseAttributePage;
