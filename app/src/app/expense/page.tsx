import type { Metadata } from "next";
import type { ReactElement } from "react";

import { isExpenseAttributeCategory } from "@/lib/expense-attribute";
import { getExpenseAttributes } from "@/service/expense-attribute-service";
import { getExpenseSummary } from "@/service/expense-service";
import Expense from "@/ui/expense";

export const metadata: Metadata = {
  title: "経費一覧",
};

interface Props {
  searchParams: Promise<{
    page?: string;
    per_page?: string;
    year?: string;
    month?: string;
    category?: string;
    attributeId?: string;
  }>;
}

const ExpensePage = async (props: Props): Promise<ReactElement> => {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const perPage = Number(searchParams.per_page) || 20;
  const year = Number(searchParams.year) || new Date(Date.now()).getFullYear();
  const month = Number(searchParams.month) || undefined;
  const { category, attributeId } = searchParams;
  const _category = isExpenseAttributeCategory(category) ? category : undefined;
  const [expenseAttributes, { expenses, pagination }] = await Promise.all([
    _category
      ? getExpenseAttributes({ category: _category }).then(
          ({ expenseAttributes }) => expenseAttributes,
        )
      : Promise.resolve([]),
    getExpenseSummary({
      page,
      perPage,
      year,
      month,
      category: _category,
      attributeId,
      tag: `expense-${page}-${perPage}-${year}-${month}-${category}-${attributeId}`,
    }),
  ]);
  return (
    <Expense
      expenses={expenses}
      pagination={pagination}
      year={year}
      month={month}
      category={_category}
      expenseAttributes={expenseAttributes}
      attributeId={attributeId}
    />
  );
};
export default ExpensePage;
