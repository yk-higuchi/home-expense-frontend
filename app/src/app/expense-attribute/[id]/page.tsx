import type { Metadata } from "next";
import type { ReactElement } from "react";
import { load } from "@/lib/load";
import { getExpenseAttribute } from "@/service/expense-attribute-service";
import ExpenseAttributeEdit from "@/ui/expense-attribute-edit";
import { FormLoadFailed } from "@/ui/parts/load-failed";
import { withHeading } from "@/ui/parts/page-heading";

export const metadata: Metadata = {
  title: "支出属性編集",
};

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
  const loaded = await load(
    () => getExpenseAttribute({ id, tag: `expense-attribute-${id}` }),
    { notFoundOn404: true },
  );
  if (!loaded.ok) return <FormLoadFailed />;
  return <ExpenseAttributeEdit expenseAttribute={loaded.value} />;
};
export default withHeading("支出属性編集", ExpenseAttributeEditPage);
