import type { Metadata } from "next";
import type { ReactElement } from "react";

import { isExpenseAttributeCategory } from "@/lib/expense-attribute";
import { getExpenseAttributeSummary } from "@/service/expense-attribute-service";
import { getExpenseSummary } from "@/service/expense-service";
import Expense from "@/ui/expense";

export const metadata: Metadata = {
  title: "経費一覧",
};

interface Props {
  searchParams: Promise<{
    page: number;
    perPage: number;
    year?: number;
    month?: number;
    category?: string;
    attributeId?: string;
  }>;
}

const ExpensePage = async (props: Props): Promise<ReactElement> => {
  const searchParams = await props.searchParams;
  const {
    page = 1,
    perPage = 20,
    year,
    month,
    category,
    attributeId,
  } = searchParams;
  const _category = isExpenseAttributeCategory(category) ? category : undefined;
  // 属性（分類を選んだときだけ）と経費を同時に取得する
  const [expenseAttributes, { expenses, pagination }] = await Promise.all([
    _category
      ? getExpenseAttributeSummary({
          category: _category,
          page: 1,
          perPage: 100,
          tag: `expense-expense-attribute-${page}-${perPage}-${_category}`,
        }).then(({ expenseAttributes }) => expenseAttributes)
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
