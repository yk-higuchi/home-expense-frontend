import type { Metadata } from "next";
import type { ReactElement } from "react";
import { load } from "@/lib/load";
import { getExpenseAttributes } from "@/service/expense-attribute-service";
import { getExpense } from "@/service/expense-service";
import ExpenseEdit from "@/ui/expense-edit";
import { FormLoadFailed } from "@/ui/parts/load-failed";
import { withHeading } from "@/ui/parts/page-heading";

export const metadata: Metadata = {
  title: "支出編集",
};

interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    category?: string;
    from?: string;
  }>;
}

const ExpenseEditPage = async (props: Props): Promise<ReactElement> => {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { id } = params;
  const loaded = await load(
    async () => {
      const expense = await getExpense({ id, tag: `expense-${id}` });
      const { category = expense.category } = searchParams;
      const { expenseAttributes } = await getExpenseAttributes({ category });
      return { expense, expenseAttributes };
    },
    { notFoundOn404: true },
  );
  if (!loaded.ok) return <FormLoadFailed />;
  const { expense, expenseAttributes } = loaded.value;
  return (
    <ExpenseEdit
      expense={expense}
      expenseAttributes={expenseAttributes}
      returnTo={searchParams.from}
    />
  );
};
export default withHeading("支出編集", ExpenseEditPage);
