import type { Metadata } from "next";
import type { ReactElement } from "react";
import { isExpenseAttributeCategory } from "@/core/expense-attribute";
import { getExpenseSummary } from "@/server/queries/expense";
import { getExpenseAttributes } from "@/server/queries/expense-attribute";
import { load } from "@/server/queries/load";
import Expense from "@/ui/expense";
import { withHeading } from "@/ui/parts/page-heading";

export const metadata: Metadata = {
  title: "支出一覧",
};

interface Props {
  searchParams: Promise<{
    page?: string;
    per_page?: string;
    year?: string;
    month?: string;
    category?: string;
    attributeId?: string;
    saved?: string;
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
  const loaded = await load(() =>
    Promise.all([
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
    ]),
  );
  const [expenseAttributes, list] = loaded.ok ? loaded.value : [[], null];
  return (
    <Expense
      list={list}
      year={year}
      month={month}
      category={_category}
      expenseAttributes={expenseAttributes}
      attributeId={attributeId}
      savedId={searchParams.saved}
    />
  );
};
export default withHeading("支出一覧", ExpensePage);
