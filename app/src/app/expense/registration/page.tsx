import type { Metadata } from "next";
import type { ReactElement } from "react";
import { load } from "@/lib/load";
import { getExpenseAttributes } from "@/service/expense-attribute-service";
import ExpenseRegistration from "@/ui/expense-registration";
import { FormLoadFailed } from "@/ui/parts/load-failed";

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
export default ExpenseRegistrationPage;
