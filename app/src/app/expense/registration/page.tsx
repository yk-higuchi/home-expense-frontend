import type { Metadata } from "next";
import type { ReactElement } from "react";

import { getExpenseAttributes } from "@/service/expense-attribute-service";
import ExpenseRegistration from "@/ui/expense-registration";

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
  const { expenseAttributes } = await getExpenseAttributes({ category });
  return <ExpenseRegistration expenseAttributes={expenseAttributes} />;
};
export default ExpenseRegistrationPage;
