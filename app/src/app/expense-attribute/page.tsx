import type { Metadata } from "next";
import type { ReactElement } from "react";
import { isExpenseAttributeCategory } from "@/core/expense-attribute";
import { getExpenseAttributes } from "@/server/queries/expense-attribute";
import { load } from "@/server/queries/load";
import ExpenseAttribute from "@/ui/expense-attribute";
import { withHeading } from "@/ui/parts/page-heading";

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
  const loaded = await load(() => getExpenseAttributes({ category }));
  return (
    <ExpenseAttribute
      category={category}
      list={loaded.ok ? loaded.value : null}
      savedId={saved}
    />
  );
};
export default withHeading("支出属性一覧", ExpenseAttributePage);
