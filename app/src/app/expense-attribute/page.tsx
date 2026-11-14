import type { Metadata } from "next";
import type { ReactElement } from "react";

import { getExpenseAttributeSummary } from "@/service/expense-attribute-service";
import ExpenseAttribute from "@/ui/expense-attribute";

export const metadata: Metadata = {
  title: "経費属性一覧",
};

interface Props {
  searchParams: Promise<{
    category?: string;
    page?: string;
    per_page?: string;
  }>;
}

const ExpenseAttributePage = async (props: Props): Promise<ReactElement> => {
  const searchParams = await props.searchParams;
  // 画面の URL は per_page（API と同じ名前）
  const page = Number(searchParams.page) || 1;
  const perPage = Number(searchParams.per_page) || 20;
  const { category = "固定費" } = searchParams;
  const { expenseAttributes, pagination } = await getExpenseAttributeSummary({
    category,
    page,
    perPage,
    tag: "expense-attribute",
  });
  return (
    <ExpenseAttribute
      category={category}
      expenseAttributes={expenseAttributes}
      pagination={pagination}
    />
  );
};
export default ExpenseAttributePage;
