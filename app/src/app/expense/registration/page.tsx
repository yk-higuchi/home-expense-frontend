import type { Metadata } from "next";
import type { ReactElement } from "react";
import { getExpenseAttributes } from "@/server/queries/expense-attribute";
import { load } from "@/server/queries/load";
import ExpenseRegistration from "@/ui/expense-registration";
import { FormLoadFailed } from "@/ui/parts/load-failed";
import { withHeading } from "@/ui/parts/page-heading";

export const metadata: Metadata = {
  title: "支出登録",
};

interface Props {
  searchParams: Promise<{
    category: string;
  }>;
}

const ExpenseRegistrationPage = async (props: Props): Promise<ReactElement> => {
  const searchParams = await props.searchParams;
  const { category = "固定費" } = searchParams;
  const loaded = await load(() => getExpenseAttributes({ category }));
  if (!loaded.ok) return <FormLoadFailed />;
  return (
    <ExpenseRegistration expenseAttributes={loaded.value.expenseAttributes} />
  );
};
export default withHeading("支出登録", ExpenseRegistrationPage);
